const mongoose = require('mongoose');
const KnowledgeSource = require('../models/KnowledgeSource');
const FAQ = require('../models/FAQ');
const { searchKnowledge } = require('./vectorSearchService');
const { generateGroundedResponse } = require('./groqService');

const PERSONAS = {
  nora: {
    queries: ["basic usage", "how to use", "getting started", "what is this feature"],
    instructions: "Generate beginner-friendly FAQs. Tone must be friendly, simple, easy to understand, and non-technical. Focus on: what is this?, how does it work?, how do I use it?, where do I find it?, prerequisites, basic workflow, beginner troubleshooting. Do NOT primarily generate security, privacy, advanced configuration, technical integration, or deep limitations questions."
  },
  sam: {
    queries: ["security", "privacy", "limitations", "failure cases", "risks"],
    instructions: "Generate skeptical/trust-oriented FAQs. Tone must be cautious, practical, trust-oriented, and direct. Focus on: security, privacy, risks, limitations, failure cases, edge cases, data handling, what happens when something goes wrong. Do NOT invent security/privacy guarantees; only use claims supported by the knowledge."
  },
  pro: {
    queries: ["configuration", "technical behavior", "integrations", "advanced usage", "limitations"],
    instructions: "Generate advanced/technical FAQs. Tone must be concise, technical, precise. Focus on: advanced configuration, technical behavior, integrations, compatibility, advanced usage, technical constraints."
  }
};

const MAX_FAQS_PER_PERSONA = 5;
const MAX_CONTEXT_LENGTH = 30000;

const getMLIntent = async (question) => {
  try {
    const response = await fetch(`${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/predict-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: question }),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`ML service returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      intent: data.is_out_of_scope ? 'out_of_scope' : data.intent,
      intentConfidence: data.confidence
    };
  } catch (error) {
    console.error('[ML Intent Error]:', error);
    throw new Error('Intent classification service is temporarily unavailable.');
  }
};

const generateFaqsForGeneration = async (projectId, generationId, userId) => {
  // 1. Verify ready knowledge exists
  const readySources = await KnowledgeSource.find({ projectId, status: 'ready' }, { _id: 1 });
  if (readySources.length === 0) {
    throw { status: 400, message: 'Insufficient product knowledge to generate FAQs.', code: 'INSUFFICIENT_KNOWLEDGE' };
  }

  const generatedFaqs = [];

  // 2. Loop through personas
  for (const [persona, config] of Object.entries(PERSONAS)) {
    // Collect unique chunks from all queries
    const uniqueChunksMap = new Map();
    for (const query of config.queries) {
      const chunks = await searchKnowledge(projectId, query, 5); // topK=5 per query
      for (const chunk of chunks) {
        if (!uniqueChunksMap.has(chunk.id)) {
          uniqueChunksMap.set(chunk.id, chunk);
        }
      }
    }

    const uniqueChunks = Array.from(uniqueChunksMap.values());
    if (uniqueChunks.length === 0) {
      continue; // No knowledge found for this persona's queries
    }

    // Build context with length constraint
    let contextText = '';
    let currentLength = 0;
    const selectedSources = [];
    
    for (const c of uniqueChunks) {
      const chunkStr = `[Source ${selectedSources.length + 1}]\n${c.text}\n\n`;
      if (currentLength + chunkStr.length > MAX_CONTEXT_LENGTH) {
        break; // Reached max context length
      }
      contextText += chunkStr;
      currentLength += chunkStr.length;
      selectedSources.push({
        knowledgeSourceId: c.knowledgeSourceId,
        sourceUrl: c.sourceUrl,
        score: c.score
      });
    }

    // Generate with Groq
    const systemPrompt = `You are FAQGenie, an enterprise product FAQ generator.

Generate FAQs for a specific persona using ONLY the supplied product knowledge.
Never invent product facts. Do not assume unsupported features, pricing, security guarantees, integrations, limits, policies, or workflows.
If the knowledge does not support a potential question/answer, do not generate it.
Questions should represent real user intent. Answers should be concise, useful, and directly supported by the supplied knowledge.
Avoid duplicate or near-duplicate questions.
Every generated question MUST belong to this persona's scope.
Do not generate questions simply because the retrieved context contains the information. Select questions that are genuinely appropriate for this persona.

Persona Instructions:
${config.instructions}

Output FORMAT:
You MUST return ONLY valid JSON in the following exact structure:
{
  "faqs": [
    {
      "question": "question string",
      "answer": "answer string"
    }
  ]
}
Generate up to ${MAX_FAQS_PER_PERSONA} FAQs. No markdown, no extra text.`;

    const userPrompt = `Product Knowledge:\n${contextText}\n\nGenerate FAQs for the persona based ONLY on this knowledge.`;

    const responseContent = await generateGroundedResponse({
      systemPrompt,
      userPrompt,
      responseFormat: { type: 'json_object' }
    });

    if (!responseContent) {
      console.warn(`Groq returned empty response for persona: ${persona}`);
      continue;
    }

    // Parse and validate JSON
    let parsedData;
    try {
      parsedData = JSON.parse(responseContent);
    } catch (err) {
      console.error(`[FAQ Generation Parse Error for ${persona}]:`, err, 'Raw response:', responseContent);
      continue;
    }

    if (!parsedData || !Array.isArray(parsedData.faqs)) {
      console.error(`[FAQ Generation Invalid Format for ${persona}] Expected { faqs: [] }, got:`, parsedData);
      continue;
    }

    // Validate FAQs and prevent duplicates within this persona
    const seenQuestions = new Set();
    let acceptedCount = 0;

    for (const item of parsedData.faqs) {
      if (acceptedCount >= MAX_FAQS_PER_PERSONA) break;

      if (!item.question || typeof item.question !== 'string' || !item.answer || typeof item.answer !== 'string') {
        continue;
      }

      const questionText = item.question.trim();
      const answerText = item.answer.trim();

      if (questionText.length === 0 || answerText.length === 0) continue;
      
      const lowerQ = questionText.toLowerCase();
      if (seenQuestions.has(lowerQ)) continue;
      
      // Basic sanity check on length
      if (questionText.length > 500 || answerText.length > 5000) continue;

      seenQuestions.add(lowerQ);

      // ML Classification
      const intentData = await getMLIntent(questionText);

      generatedFaqs.push({
        generationId,
        projectId,
        userId,
        persona,
        question: questionText,
        answer: answerText,
        intent: intentData.intent,
        intentConfidence: intentData.intentConfidence,
        sourceReferences: selectedSources,
        selected: false
      });
      
      acceptedCount++;
    }
  }

  // Verify all personas successfully generated at least 1 FAQ
  const personasPresent = new Set(generatedFaqs.map(f => f.persona));
  if (personasPresent.size !== 3 || generatedFaqs.length === 0) {
    throw { status: 422, message: "Unable to generate a complete FAQ set.", code: "FAQ_GENERATION_INCOMPLETE" };
  }

  // 3. Atomically persist
  let insertedFaqs = [];
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    await FAQ.deleteMany({ generationId, projectId }).session(session); // Clear previous
    insertedFaqs = await FAQ.insertMany(generatedFaqs, { session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  // 4. Group by persona
  const groupedFaqs = {
    nora: [],
    sam: [],
    pro: []
  };

  for (const faq of insertedFaqs) {
    if (groupedFaqs[faq.persona]) {
      groupedFaqs[faq.persona].push(faq);
    }
  }

  return {
    generationId,
    faqs: groupedFaqs
  };
};

module.exports = {
  generateFaqsForGeneration
};
