const mongoose = require('mongoose');
const FAQ = require('../models/FAQ');
const Generation = require('../models/Generation');
const { normalizeText, calculateJaccardSimilarity } = require('../utils/textUtils');

/**
 * Deterministically suggests a balanced, diverse FAQ set.
 */
const suggestBestFaqs = (faqs, targetCount = 10) => {
  if (!faqs || faqs.length === 0) {
    throw { status: 400, message: 'No generated FAQs found.', code: 'NO_FAQS' };
  }

  // 1. Deduplicate exact normalized question matches
  const uniqueFaqsMap = new Map();
  for (const faq of faqs) {
    const normQ = normalizeText(faq.question);
    // Keep the one with higher confidence if duplicate
    if (!uniqueFaqsMap.has(normQ) || (faq.intentConfidence || 0) > (uniqueFaqsMap.get(normQ).intentConfidence || 0)) {
      uniqueFaqsMap.set(normQ, faq);
    }
  }
  let candidates = Array.from(uniqueFaqsMap.values());

  // 2. Base Scoring
  const scoredCandidates = candidates.map(faq => {
    let score = 0;
    
    // Reward valid intents strongly
    if (faq.intent && faq.intent !== 'out_of_scope' && faq.intent !== 'unknown') {
      score += 10;
    }
    
    // Reward confidence
    score += (faq.intentConfidence || 0) * 5;
    
    // Reward decent answer length (not too short, not too long)
    const ansLen = (faq.answer || '').length;
    if (ansLen > 50 && ansLen < 1500) score += 2;
    
    // Reward presence of sources
    if (faq.sourceReferences && faq.sourceReferences.length > 0) score += 1;

    return {
      faq,
      tokens: normalizeText(faq.question).split(' '),
      baseScore: score
    };
  });

  // 3. Greedy Selection Loop
  const selected = [];
  const selectedTokensList = [];
  const selectedPersonasCount = { nora: 0, sam: 0, pro: 0 };
  const selectedIntents = new Set();
  
  // Sort deterministically to ensure stable output (highest score first, then by ID)
  scoredCandidates.sort((a, b) => {
    if (b.baseScore !== a.baseScore) return b.baseScore - a.baseScore;
    return a.faq._id.toString().localeCompare(b.faq._id.toString());
  });

  while (selected.length < targetCount && scoredCandidates.length > 0) {
    let bestIndex = -1;
    let bestAdjustedScore = -Infinity;

    for (let i = 0; i < scoredCandidates.length; i++) {
      const candidate = scoredCandidates[i];
      let currentScore = candidate.baseScore;
      
      const pCount = selectedPersonasCount[candidate.faq.persona] || 0;
      
      // Bonus for unrepresented persona
      if (pCount === 0) currentScore += 5;
      
      // Penalty for over-concentration (try to balance Nora/Sam/Pro)
      if (pCount >= 3) currentScore -= 5;
      
      // Bonus for new intent
      if (candidate.faq.intent && !selectedIntents.has(candidate.faq.intent)) {
        currentScore += 3;
      }
      
      // Penalty for near-duplicates (Jaccard similarity > 0.4 means heavy penalty)
      let maxSim = 0;
      for (const selTokens of selectedTokensList) {
        const sim = calculateJaccardSimilarity(candidate.tokens, selTokens);
        if (sim > maxSim) maxSim = sim;
      }
      
      if (maxSim > 0.4) currentScore -= (maxSim * 20); // Massive penalty for high overlap
      
      // Break ties deterministically (done via the initial stable sort loop order + strictly greater check)
      if (currentScore > bestAdjustedScore) {
        bestAdjustedScore = currentScore;
        bestIndex = i;
      }
    }

    if (bestIndex !== -1) {
      const winner = scoredCandidates[bestIndex];
      selected.push(winner.faq);
      selectedTokensList.push(winner.tokens);
      selectedPersonasCount[winner.faq.persona] = (selectedPersonasCount[winner.faq.persona] || 0) + 1;
      if (winner.faq.intent) selectedIntents.add(winner.faq.intent);
      
      // Remove winner from candidates
      scoredCandidates.splice(bestIndex, 1);
    } else {
      break;
    }
  }

  // Final deterministic sort by persona order then string ID to guarantee stable JSON arrays
  selected.sort((a, b) => {
    const pOrder = { nora: 1, sam: 2, pro: 3 };
    if (pOrder[a.persona] !== pOrder[b.persona]) {
      return (pOrder[a.persona] || 99) - (pOrder[b.persona] || 99);
    }
    return a._id.toString().localeCompare(b._id.toString());
  });

  return selected.map(f => f._id);
};

/**
 * Atomically saves a selection of FAQs for a generation.
 */
const saveSelection = async (projectId, generationId, userId, selectedFaqIds) => {
  if (!Array.isArray(selectedFaqIds)) {
    throw { status: 400, message: 'selectedFaqIds must be an array.', code: 'BAD_REQUEST' };
  }

  // Deduplicate
  const uniqueIds = Array.from(new Set(selectedFaqIds));
  
  for (const id of uniqueIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, message: 'One or more FAQ IDs are invalid.', code: 'INVALID_FAQ_IDS' };
    }
  }

  // Fetch all requested FAQs to ensure they belong to this gen/project/user
  if (uniqueIds.length > 0) {
    const validFaqs = await FAQ.find({
      _id: { $in: uniqueIds },
      generationId,
      projectId,
      userId
    }, { _id: 1 });

    if (validFaqs.length !== uniqueIds.length) {
      throw { status: 400, message: 'One or more FAQs do not belong to this generation.', code: 'FAQ_GENERATION_MISMATCH' };
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Reset all FAQs for this generation to false
    await FAQ.updateMany(
      { generationId, projectId, userId },
      { $set: { selected: false } },
      { session }
    );

    // 2. Set requested FAQs to true
    if (uniqueIds.length > 0) {
      await FAQ.updateMany(
        { _id: { $in: uniqueIds }, generationId, projectId, userId },
        { $set: { selected: true } },
        { session }
      );
    }

    // 3. Update Generation and clear stale seoAnalysis
    await Generation.updateOne(
      { _id: generationId, projectId, userId },
      { $set: { selectedFaqIds: uniqueIds, seoAnalysis: null } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return {
    generationId,
    selectedFaqIds: uniqueIds,
    selectedCount: uniqueIds.length
  };
};

module.exports = {
  suggestBestFaqs,
  saveSelection
};
