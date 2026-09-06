const Groq = require('groq-sdk');

let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is missing.');
    }
    // Initialize once with a 15-second timeout
    groqClient = new Groq({ 
      apiKey: process.env.GROQ_API_KEY,
      timeout: 15000
    });
  }
  return groqClient;
};

const generateGroundedResponse = async ({ systemPrompt, userPrompt }) => {
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const groq = getGroqClient();
  
  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: model,
      temperature: 0.1, // Deterministic
    });
    
    return response.choices[0]?.message?.content || null;
  } catch (error) {
    // Log real error internally for debugging
    console.error(`[Groq API Error]:`, error);
    // Throw safe sanitized error to the client
    throw new Error('AI generation service is temporarily unavailable.');
  }
};

module.exports = {
  generateGroundedResponse,
};
