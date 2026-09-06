const KnowledgeSource = require('../models/KnowledgeSource');
const KnowledgeChunk = require('../models/KnowledgeChunk');
const { scrapeWebsite } = require('./websiteScraper');
const { chunkText } = require('./textChunker');
const { generateEmbedding } = require('./embeddingService');
const { normalizeText } = require('../utils/textUtils');
const crypto = require('crypto');
const mongoose = require('mongoose');

const processWebsiteSource = async (sourceId) => {
  const source = await KnowledgeSource.findById(sourceId);
  if (!source) return;

  try {
    source.status = 'processing';
    await source.save();

    const scrapedData = await scrapeWebsite(source.url);

    let extractedText = scrapedData.text;
    if (extractedText.length > 500000) {
      extractedText = extractedText.substring(0, 500000);
    }

    const chunks = chunkText(extractedText);
    const limitedChunks = chunks.slice(0, 200);
    
    // Determine the next version
    const newVersion = source.currentVersion + 1;

    const chunkDocs = [];
    for (const chunk of limitedChunks) {
      const embedding = await generateEmbedding(chunk.text);
      
      const normalized = normalizeText(chunk.text);
      const contentHash = crypto.createHash('sha256').update(normalized).digest('hex');

      chunkDocs.push({
        projectId: source.projectId,
        knowledgeSourceId: source._id,
        userId: source.userId,
        text: chunk.text,
        version: newVersion,
        contentHash,
        sourceUrl: scrapedData.sourceUrl,
        chunkIndex: chunk.chunkIndex,
        embedding: embedding,
        embeddingModel: 'sentence-transformers/all-mpnet-base-v2'
      });
    }

    // Transaction Boundary
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // Safe re-ingestion: do NOT destroy the entire history. 
      // Delete chunks older than (newVersion - 1) to keep strictly previous+current.
      await KnowledgeChunk.deleteMany({ 
        knowledgeSourceId: source._id, 
        version: { $lt: newVersion - 1 } 
      }, { session });
      
      if (chunkDocs.length > 0) {
        await KnowledgeChunk.insertMany(chunkDocs, { session });
      }

      source.title = scrapedData.title || source.title;
      source.currentVersion = newVersion;
      source.status = 'ready';
      source.lastFetchedAt = new Date();
      source.error = null;
      await source.save({ session });
      
      await session.commitTransaction();
    } catch (txnError) {
      await session.abortTransaction();
      throw txnError;
    } finally {
      session.endSession();
    }

  } catch (error) {
    // If it fails, do not delete old chunks and do not advance version
    const errorMsg = error.message ? error.message.split('\n')[0] : 'Unknown error during scraping.';
    await KnowledgeSource.updateOne(
      { _id: source._id },
      { $set: { status: 'failed', error: errorMsg } }
    );
    throw error;
  }
};

// Safe boundary wrapper for background execution
const runWebsiteIngestionAsync = async (sourceId) => {
  try {
    await processWebsiteSource(sourceId);
  } catch (err) {
    // This catches fatal db-level crashes so NodeJS event loop isn't broken with unhandled rejections
    console.error(`[Ingestion Error] Fatal async error on source ${sourceId}:`, err);
  }
};

module.exports = {
  processWebsiteSource,
  runWebsiteIngestionAsync,
};
