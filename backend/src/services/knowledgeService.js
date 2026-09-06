const KnowledgeSource = require('../models/KnowledgeSource');
const KnowledgeChunk = require('../models/KnowledgeChunk');
const { scrapeWebsite } = require('./websiteScraper');
const { chunkText } = require('./textChunker');

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

    const chunkDocs = limitedChunks.map((chunk) => ({
      projectId: source.projectId,
      knowledgeSourceId: source._id,
      userId: source.userId,
      text: chunk.text,
      sourceUrl: scrapedData.sourceUrl,
      chunkIndex: chunk.chunkIndex,
    }));

    // Safe re-ingestion: only delete chunks after parsing HTML and grouping new chunk array in memory successfully
    await KnowledgeChunk.deleteMany({ knowledgeSourceId: source._id });
    if (chunkDocs.length > 0) {
      await KnowledgeChunk.insertMany(chunkDocs);
    }

    source.title = scrapedData.title || source.title;
    source.status = 'ready';
    source.lastFetchedAt = new Date();
    source.error = null;
    await source.save();
  } catch (error) {
    // If it fails, do not delete old chunks
    source.status = 'failed';
    source.error = error.message ? error.message.split('\n')[0] : 'Unknown error during scraping.';
    await source.save();
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
