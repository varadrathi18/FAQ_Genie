const mongoose = require('mongoose');
const KnowledgeSource = require('../models/KnowledgeSource');
const KnowledgeChunk = require('../models/KnowledgeChunk');
const KnowledgeDrift = require('../models/KnowledgeDrift');
const FAQ = require('../models/FAQ');
const { cosineSimilarity } = require('../utils/mathUtils');
const { generateEmbedding } = require('./embeddingService');

const SIMILARITY_THRESHOLD_MODIFIED = 0.85;
const SIMILARITY_THRESHOLD_FAQ_IMPACT = 0.80;

const calculateDrift = async (projectId, knowledgeSourceId, userId) => {
  const source = await KnowledgeSource.findOne({ _id: knowledgeSourceId, projectId, userId });
  
  if (!source) {
    throw { status: 404, message: 'Knowledge source not found.', code: 'NOT_FOUND' };
  }

  const currentVersion = source.currentVersion;
  const previousVersion = currentVersion - 1;

  if (currentVersion < 2) {
    return { status: 'no_drift', previousVersion: null, currentVersion, driftScore: 0, driftLevel: 'none', changedChunks: [], affectedFaqs: [] };
  }

  // Idempotency check
  const existingDrift = await KnowledgeDrift.findOne({ knowledgeSourceId, previousVersion, currentVersion });
  if (existingDrift) {
    return existingDrift;
  }

  // Fetch chunks
  const [prevChunks, currChunks] = await Promise.all([
    KnowledgeChunk.find({ knowledgeSourceId, version: previousVersion }).lean(),
    KnowledgeChunk.find({ knowledgeSourceId, version: currentVersion }).lean()
  ]);

  const prevHashMap = new Map();
  const currHashMap = new Map();

  prevChunks.forEach(c => prevHashMap.set(c.contentHash, c));
  currChunks.forEach(c => currHashMap.set(c.contentHash, c));

  const unmatchedPrev = [];
  const unmatchedCurr = [];

  // Exact Matches / Removes
  for (const p of prevChunks) {
    if (!currHashMap.has(p.contentHash)) unmatchedPrev.push(p);
  }

  // Adds
  for (const c of currChunks) {
    if (!prevHashMap.has(c.contentHash)) unmatchedCurr.push(c);
  }

  const changedChunks = [];

  // Semantic Matching (Modified)
  const processedCurrSet = new Set();

  for (const p of unmatchedPrev) {
    let bestMatch = null;
    let maxSim = -1;

    for (const c of unmatchedCurr) {
      if (processedCurrSet.has(c._id.toString())) continue;
      
      const sim = cosineSimilarity(p.embedding, c.embedding);
      if (sim > maxSim) {
        maxSim = sim;
        bestMatch = c;
      }
    }

    if (bestMatch && maxSim >= SIMILARITY_THRESHOLD_MODIFIED) {
      changedChunks.push({
        type: 'modified',
        previousChunkId: p._id,
        currentChunkId: bestMatch._id,
        similarity: maxSim,
        previousHash: p.contentHash,
        currentHash: bestMatch.contentHash
      });
      processedCurrSet.add(bestMatch._id.toString());
    } else {
      changedChunks.push({
        type: 'removed',
        previousChunkId: p._id,
        currentChunkId: null,
        similarity: null,
        previousHash: p.contentHash,
        currentHash: null
      });
    }
  }

  // Remaining Adds
  for (const c of unmatchedCurr) {
    if (!processedCurrSet.has(c._id.toString())) {
      changedChunks.push({
        type: 'added',
        previousChunkId: null,
        currentChunkId: c._id,
        similarity: null,
        previousHash: null,
        currentHash: c.contentHash
      });
    }
  }

  // Check if drift is material
  if (changedChunks.length === 0) {
    return { status: 'no_drift', previousVersion, currentVersion, driftScore: 0, driftLevel: 'none', changedChunks: [], affectedFaqs: [] };
  }

  const prevChunkCount = prevChunks.length;
  const currChunkCount = currChunks.length;
  const maxChunkCount = Math.max(prevChunkCount, currChunkCount) || 1;

  let driftScore = (changedChunks.length / maxChunkCount) * 100;
  driftScore = Math.min(Math.max(Math.round(driftScore), 0), 100); // Clamp 0-100

  let driftLevel = 'none';
  if (driftScore > 30) driftLevel = 'high';
  else if (driftScore > 10) driftLevel = 'moderate';
  else if (driftScore > 0) driftLevel = 'low';

  // FAQ Impact detection
  const affectedFaqs = [];
  const faqs = await FAQ.find({ projectId, userId }).lean();
  
  if (faqs.length > 0) {
    // Generate fresh question embeddings internally (temporarily)
    const faqEmbeddings = await Promise.all(faqs.map(faq => generateEmbedding(faq.question)));
    
    // Build set of materially changed chunk embeddings
    const materialChunkEmbeddings = [];
    changedChunks.forEach(cc => {
      if (cc.type === 'added' || cc.type === 'modified') {
        const c = unmatchedCurr.find(uc => uc._id.toString() === cc.currentChunkId.toString());
        if (c) materialChunkEmbeddings.push(c.embedding);
      }
      if (cc.type === 'removed' || cc.type === 'modified') {
        const p = unmatchedPrev.find(up => up._id.toString() === cc.previousChunkId.toString());
        if (p) materialChunkEmbeddings.push(p.embedding);
      }
    });

    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i];
      const qEmbed = faqEmbeddings[i];
      let maxFaqSim = -1;

      for (const mcEmbed of materialChunkEmbeddings) {
        const sim = cosineSimilarity(qEmbed, mcEmbed);
        if (sim > maxFaqSim) maxFaqSim = sim;
      }

      if (maxFaqSim >= SIMILARITY_THRESHOLD_FAQ_IMPACT) {
        affectedFaqs.push({
          faqId: faq._id,
          similarity: maxFaqSim,
          reason: 'Supporting product knowledge may have changed.'
        });
      }
    }
  }

  // Create Drift Record
  try {
    const drift = await KnowledgeDrift.create({
      userId,
      projectId,
      knowledgeSourceId,
      previousVersion,
      currentVersion,
      status: 'detected',
      driftScore,
      driftLevel,
      changedChunks,
      affectedFaqs,
    });
    return drift;
  } catch (err) {
    if (err.code === 11000) {
      // Race condition hit: another request successfully generated this drift record
      return await KnowledgeDrift.findOne({ knowledgeSourceId, previousVersion, currentVersion });
    }
    throw err;
  }
};

const listDrift = async (projectId, userId) => {
  const drifts = await KnowledgeDrift.find({ projectId, userId }).sort({ detectedAt: -1 }).lean();
  return drifts.map(d => ({
    driftId: d._id,
    knowledgeSourceId: d.knowledgeSourceId,
    previousVersion: d.previousVersion,
    currentVersion: d.currentVersion,
    status: d.status,
    driftScore: d.driftScore,
    driftLevel: d.driftLevel,
    changedChunkCount: d.changedChunks ? d.changedChunks.length : 0,
    affectedFaqCount: d.affectedFaqs ? d.affectedFaqs.length : 0,
    detectedAt: d.detectedAt
  }));
};

const reviewDrift = async (projectId, driftId, userId, status) => {
  if (!['reviewed', 'resolved'].includes(status)) {
    throw { status: 400, message: 'Invalid status transition.', code: 'BAD_REQUEST' };
  }

  const drift = await KnowledgeDrift.findOne({ _id: driftId, projectId, userId });
  if (!drift) {
    throw { status: 404, message: 'Drift record not found.', code: 'NOT_FOUND' };
  }

  // Enforce Lifecycle Transitions
  const currentStatus = drift.status;

  if (currentStatus === 'resolved') {
    throw { status: 400, message: 'Cannot transition from a resolved state.', code: 'BAD_REQUEST' };
  }

  if (currentStatus === 'reviewed' && status === 'reviewed') {
    throw { status: 400, message: 'Drift is already reviewed.', code: 'BAD_REQUEST' };
  }

  if (currentStatus === 'detected' && status === 'detected') {
    throw { status: 400, message: 'Invalid status transition.', code: 'BAD_REQUEST' };
  }

  drift.status = status;
  if (status === 'resolved') {
    drift.resolvedAt = new Date();
  }

  await drift.save();
  return drift;
};

module.exports = {
  calculateDrift,
  listDrift,
  reviewDrift
};
