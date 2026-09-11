const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const generateEmbedding = async (text) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(90000), // 90s timeout to survive Render free tier cold starts
    });
    
    if (!response.ok) {
      throw new Error(`ML service returned status ${response.status}`);
    }
    
    const data = await response.json();
    const embedding = data.embedding;
    
    const isValid = Array.isArray(embedding) && 
                    embedding.length === 768 && 
                    embedding.every(val => typeof val === 'number' && Number.isFinite(val));

    if (!isValid) {
      throw new Error('ML service returned invalid embedding format, length, or NaN/Infinity values (expected 768 finite numbers).');
    }
    
    return embedding;
  } catch (error) {
    console.error('[Embedding Error]:', error);
    throw new Error('Knowledge embedding service is temporarily unavailable.');
  }
};

module.exports = {
  generateEmbedding,
};
