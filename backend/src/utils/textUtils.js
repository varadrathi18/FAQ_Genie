/**
 * Normalizes text for comparison.
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text.toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim();
};

/**
 * Calculates Jaccard similarity between two tokenized strings.
 */
const calculateJaccardSimilarity = (tokens1, tokens2) => {
  if (tokens1.length === 0 && tokens2.length === 0) return 1;
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

module.exports = {
  normalizeText,
  calculateJaccardSimilarity
};
