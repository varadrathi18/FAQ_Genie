const { searchKnowledge } = require('./vectorSearchService');
const { generateGroundedResponse } = require('./groqService');

const SYSTEM_PROMPT = `You are FAQGenie, a product FAQ assistant.

Use only the supplied product knowledge.

Do not invent product behavior, pricing, limits, security claims,
features, integrations, or policies.

If the provided knowledge does not support an answer,
state that the information is not available in the provided
product knowledge.`;

const askQuestion = async (projectId, query) => {
  const chunks = await searchKnowledge(projectId, query, 5);

  if (chunks.length === 0) {
    return {
      answer: null,
      sources: [],
      message: "Insufficient product knowledge to answer this question."
    };
  }

  let contextText = '';
  let currentLength = 0;
  const MAX_CONTEXT_LENGTH = 30000; // Safe character limit for prompt context

  const selectedSources = [];
  for (const c of chunks) {
    const chunkStr = `[Source ${selectedSources.length + 1}]\n${c.text}\n\n`;
    if (currentLength + chunkStr.length > MAX_CONTEXT_LENGTH) {
      // Reached safe context limit, skip adding more chunks
      break;
    }
    contextText += chunkStr;
    currentLength += chunkStr.length;
    selectedSources.push({
      id: c.id,
      sourceUrl: c.sourceUrl,
      score: c.score
    });
  }

  const userPrompt = `Product Context:\n${contextText}\nQuestion:\n${query}`;

  const answer = await generateGroundedResponse({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: userPrompt
  });

  return {
    answer,
    sources: selectedSources,
    message: null
  };
};

module.exports = {
  askQuestion,
};
