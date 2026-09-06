const { normalizeText, calculateJaccardSimilarity } = require('../utils/textUtils');

const analyzeFaqSet = (faqs) => {
  if (!faqs || faqs.length === 0) {
    throw { status: 400, message: 'Select at least one FAQ before running SEO analysis.', code: 'NO_SELECTION' };
  }

  const totalFaqs = faqs.length;
  let recommendations = new Set();

  // 1. Coverage (30%)
  const validIntents = new Set();
  for (const faq of faqs) {
    if (faq.intent && faq.intent !== 'out_of_scope' && faq.intent !== 'unknown') {
      validIntents.add(faq.intent);
    }
  }
  let coverageScore = Math.min((validIntents.size / totalFaqs) * 100, 100);
  if (coverageScore < 80) recommendations.add("Add FAQs covering additional user intents.");

  // 2. Persona Coverage (15%)
  const personas = new Set(faqs.map(f => f.persona).filter(Boolean));
  // Expected personas: nora, sam, pro
  let personaCoverageScore = Math.min((personas.size / 3) * 100, 100);
  if (personaCoverageScore < 100) recommendations.add("Consider adding FAQs from the missing persona(s).");

  // 3. Question Uniqueness (20%)
  let overlapPenalties = 0;
  const tokenizedQuestions = faqs.map(faq => normalizeText(faq.question).split(' '));
  
  for (let i = 0; i < tokenizedQuestions.length; i++) {
    for (let j = i + 1; j < tokenizedQuestions.length; j++) {
      const sim = calculateJaccardSimilarity(tokenizedQuestions[i], tokenizedQuestions[j]);
      if (sim > 0.4) {
        // Heavy penalty for highly similar questions
        overlapPenalties += (sim * 100);
      }
    }
  }
  // Max possible pairs is n(n-1)/2
  const totalPairs = (totalFaqs * (totalFaqs - 1)) / 2;
  let uniquenessScore = 100;
  if (totalPairs > 0) {
    const avgPenalty = overlapPenalties / totalPairs;
    uniquenessScore = Math.max(100 - avgPenalty, 0);
  }
  if (uniquenessScore < 80) recommendations.add("Replace or merge highly similar questions.");

  // 4. Answer Completeness (20%)
  let totalCompleteness = 0;
  for (const faq of faqs) {
    const ansLen = (faq.answer || '').trim().length;
    let faqCompleteness = 0;
    if (ansLen > 50 && ansLen <= 2000) {
      faqCompleteness = 100;
    } else if (ansLen > 0 && ansLen <= 50) {
      faqCompleteness = (ansLen / 50) * 100; // Partial score for short answers
    } else if (ansLen > 2000) {
      faqCompleteness = 50; // Penalty for overly verbose answers
    }
    totalCompleteness += faqCompleteness;
  }
  let answerCompletenessScore = totalCompleteness / totalFaqs;
  if (answerCompletenessScore < 80) recommendations.add("Improve short or incomplete FAQ answers.");

  // 5. Source Coverage (15%)
  let sourcedFaqsCount = 0;
  for (const faq of faqs) {
    if (faq.sourceReferences && faq.sourceReferences.length > 0) {
      sourcedFaqsCount++;
    }
  }
  let sourceCoverageScore = (sourcedFaqsCount / totalFaqs) * 100;
  if (sourceCoverageScore < 100) recommendations.add("Add source-backed answers for unsupported FAQs.");

  // Calculate Final Weighted Score
  const finalScore = (
    (coverageScore * 0.30) +
    (personaCoverageScore * 0.15) +
    (uniquenessScore * 0.20) +
    (answerCompletenessScore * 0.20) +
    (sourceCoverageScore * 0.15)
  );

  return {
    score: Math.round(finalScore),
    breakdown: {
      coverage: Math.round(coverageScore),
      personaCoverage: Math.round(personaCoverageScore),
      uniqueness: Math.round(uniquenessScore),
      answerCompleteness: Math.round(answerCompletenessScore),
      sourceCoverage: Math.round(sourceCoverageScore)
    },
    recommendations: Array.from(recommendations),
    analyzedFaqCount: totalFaqs,
    analyzedAt: new Date()
  };
};

module.exports = {
  analyzeFaqSet
};
