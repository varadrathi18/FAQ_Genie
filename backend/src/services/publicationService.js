const crypto = require('crypto');
const FAQ = require('../models/FAQ');
const Generation = require('../models/Generation');
const Project = require('../models/Project');

/**
 * Helper to safely extract brand metadata from the project websiteUrl.
 * Without full browser scraping, we default to domain or safe defaults.
 */
const extractBrandAndTheme = (project) => {
  let siteTitle = project.title || 'FAQWidget';
  if (project.websiteUrl) {
    try {
      const urlObj = new URL(project.websiteUrl);
      siteTitle = urlObj.hostname;
    } catch (e) {
      // Ignored
    }
  }

  return {
    brand: {
      siteTitle,
      logoUrl: null
    },
    theme: {
      primaryColor: '#007BFF', // Default safe blue
      backgroundColor: '#FFFFFF',
      textColor: '#333333'
    }
  };
};

/**
 * Previews the final selected FAQ set.
 */
const previewPublication = async (projectId, generationId, userId) => {
  const generation = await Generation.findOne({ _id: generationId, projectId, userId });
  if (!generation) {
    throw { status: 404, message: 'Generation not found.', code: 'NOT_FOUND' };
  }

  const project = await Project.findOne({ _id: projectId, userId });
  
  const selectedFaqIds = generation.selectedFaqIds || [];
  let faqs = [];
  if (selectedFaqIds.length > 0) {
    const rawFaqs = await FAQ.find({ _id: { $in: selectedFaqIds }, generationId, projectId, userId });
    faqs = rawFaqs.map(faq => ({
      id: faq._id,
      question: faq.question,
      answer: faq.answer,
      persona: faq.persona
    }));
  }

  const extracted = extractBrandAndTheme(project);

  return {
    generationId,
    faqs,
    theme: extracted.theme,
    brand: extracted.brand
  };
};

/**
 * Publishes the generation (JSON-LD + Widget).
 */
const publish = async (projectId, generationId, userId) => {
  const generation = await Generation.findOne({ _id: generationId, projectId, userId });
  if (!generation) {
    throw { status: 404, message: 'Generation not found.', code: 'NOT_FOUND' };
  }

  const project = await Project.findOne({ _id: projectId, userId });

  // 1. Verify SEO exists
  if (!generation.seoAnalysis) {
    throw { status: 400, message: 'Run SEO analysis before publishing.', code: 'SEO_REQUIRED' };
  }

  // 2. Load Selected FAQs
  const selectedFaqIds = generation.selectedFaqIds || [];
  if (selectedFaqIds.length === 0) {
    throw { status: 400, message: 'Select at least one FAQ to publish.', code: 'NO_SELECTION' };
  }

  const rawFaqs = await FAQ.find({ _id: { $in: selectedFaqIds }, generationId, projectId, userId });
  if (rawFaqs.length !== selectedFaqIds.length) {
    throw { status: 400, message: 'Mismatched FAQs detected.', code: 'INVALID_SELECTED_FAQS' };
  }

  // 3. Prepare JSON-LD
  const mainEntity = rawFaqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }));

  const jsonLdObj = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": mainEntity
  };

  const jsonLd = JSON.stringify(jsonLdObj);

  // 4. Generate/Reuse widgetId
  let widgetId = generation.publication?.widgetId;
  if (!widgetId) {
    widgetId = crypto.randomBytes(16).toString('hex');
  }

  // 5. Generate Embed Script
  const baseUrl = process.env.PUBLIC_WIDGET_URL || 'http://localhost:5001/widget';
  const embedCode = `<script src="${baseUrl}/widget.js" data-faqgenie-id="${widgetId}" defer></script>`;

  // 6. Extracted Theme
  const { brand, theme } = extractBrandAndTheme(project);

  // 7. Persist
  generation.publication = {
    status: 'published',
    widgetId,
    theme,
    brand,
    embedCode,
    jsonLd,
    publishedAt: new Date(),
    updatedAt: new Date()
  };

  await generation.save();

  return generation.publication;
};

/**
 * Unpublishes the generation.
 */
const unpublish = async (projectId, generationId, userId) => {
  const generation = await Generation.findOne({ _id: generationId, projectId, userId });
  if (!generation) {
    throw { status: 404, message: 'Generation not found.', code: 'NOT_FOUND' };
  }

  if (generation.publication) {
    generation.publication.status = 'unpublished';
    generation.publication.updatedAt = new Date();
    generation.markModified('publication');
    await generation.save();
  }

  return {
    generationId,
    status: 'unpublished'
  };
};

/**
 * Public endpoint to fetch widget data. NO AUTH REQUIRED.
 */
const getPublicWidget = async (widgetId) => {
  if (!widgetId) {
    throw { status: 400, message: 'Widget ID is required.', code: 'INVALID_ID' };
  }

  const generation = await Generation.findOne({ 'publication.widgetId': widgetId });
  
  if (!generation || !generation.publication || generation.publication.status !== 'published') {
    throw { status: 404, message: 'Widget not found or not published.', code: 'PUBLICATION_NOT_FOUND' };
  }

  const selectedFaqIds = generation.selectedFaqIds || [];
  
  // We don't query by projectId/userId here since this is a public lookup by opaque ID.
  const rawFaqs = await FAQ.find({ _id: { $in: selectedFaqIds }, generationId: generation._id });

  // Map tightly so we don't leak internals
  const faqs = rawFaqs.map(f => ({
    question: f.question,
    answer: f.answer
  }));

  return {
    widgetId,
    theme: generation.publication.theme,
    brand: generation.publication.brand,
    faqs
  };
};

module.exports = {
  previewPublication,
  publish,
  unpublish,
  getPublicWidget
};
