#!/bin/bash
set -e

cd ../backend
killall node || true
node src/server.js > node_server.log 2>&1 &
SERVER_PID=$!
sleep 5

TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@example.com"

# Register
curl -s -c cookie.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"password123\"}" http://localhost:5001/api/auth/register > /dev/null
P1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"title":"P1","description":"Desc"}' http://localhost:5001/api/projects)
P1_ID=$(echo $P1 | jq -r '.id')

USER_RES=$(curl -s -b cookie.txt http://localhost:5001/api/auth/me)
USER_ID=$(echo $USER_RES | jq -r '.id')

echo -e "\n--- TEST A/B/C: INGESTION VERSIONING & ROLLBACK ---"
node -e "
const mongoose = require('mongoose');
const KnowledgeSource = require('./src/models/KnowledgeSource');
const KnowledgeChunk = require('./src/models/KnowledgeChunk');
const { processWebsiteSource } = require('./src/services/knowledgeService');
const websiteScraper = require('./src/services/websiteScraper');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Create source with default version 0
  const source = await KnowledgeSource.create({
    projectId: '$P1_ID', userId: '$USER_ID', type: 'website', url: 'http://example.com'
  });
  console.log('Initial currentVersion:', source.currentVersion);

  // A) First successful ingestion
  websiteScraper.scrapeWebsite = async () => ({ text: 'Initial v1 data', sourceUrl: 'http://example.com' });
  await processWebsiteSource(source._id);
  const sourceV1 = await KnowledgeSource.findById(source._id);
  console.log('currentVersion after first ingestion:', sourceV1.currentVersion);

  // B) Failed second ingestion
  const originalInsertMany = KnowledgeChunk.insertMany;
  KnowledgeChunk.insertMany = async function() { throw new Error('Transaction simulated fail'); };
  
  await processWebsiteSource(source._id);
  
  const sourceV1_Failed = await KnowledgeSource.findById(source._id);
  console.log('currentVersion after failed second ingestion (should be 1):', sourceV1_Failed.currentVersion);
  
  // C) Retry successful ingestion
  KnowledgeChunk.insertMany = originalInsertMany; // Restore
  websiteScraper.scrapeWebsite = async () => ({ text: 'Updated v2 data that causes drift', sourceUrl: 'http://example.com' });
  await processWebsiteSource(source._id);
  
  const sourceV2 = await KnowledgeSource.findById(source._id);
  console.log('currentVersion after successful retry (should be 2):', sourceV2.currentVersion);

  console.log(source._id.toString());
  process.exit(0);
}
run();
" > ingestion_test_out.txt

cat ingestion_test_out.txt | head -n 4
SOURCE_ID=$(tail -n 1 ingestion_test_out.txt | tr -d ' ')

echo -e "\n--- SETTING UP REAL EMBEDDINGS FOR DRIFT FAQ TEST ---"
node -e "
const mongoose = require('mongoose');
const crypto = require('crypto');
const KnowledgeChunk = require('./src/models/KnowledgeChunk');
const FAQ = require('./src/models/FAQ');
const Generation = require('./src/models/Generation');
const { generateEmbedding } = require('./src/services/embeddingService');
require('dotenv').config();

const normalizeText = (text) => text.toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim();
const getHash = (text) => crypto.createHash('sha256').update(normalizeText(text)).digest('hex');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  await KnowledgeChunk.deleteMany({ knowledgeSourceId: '$SOURCE_ID' });

  const textV1 = 'Refunds are available within 7 days of purchase.';
  const textV2 = 'Refunds are available within 30 days of purchase.';
  const faqText = 'Are refunds available within 30 days of purchase?';
  const unrelatedText = 'What are the office opening hours on Sunday?';

  const embedV1 = await generateEmbedding(textV1);
  const embedV2 = await generateEmbedding(textV2);

  await KnowledgeChunk.insertMany([
    { projectId: '$P1_ID', knowledgeSourceId: '$SOURCE_ID', userId: '$USER_ID', text: textV1, sourceUrl: 'http://example.com', chunkIndex: 0, version: 1, contentHash: getHash(textV1), embedding: embedV1 }
  ]);

  await KnowledgeChunk.insertMany([
    { projectId: '$P1_ID', knowledgeSourceId: '$SOURCE_ID', userId: '$USER_ID', text: textV2, sourceUrl: 'http://example.com', chunkIndex: 0, version: 2, contentHash: getHash(textV2), embedding: embedV2 }
  ]);

  const gen = await Generation.create({ projectId: '$P1_ID', userId: '$USER_ID', version: 1, inputSnapshot: {} });
  
  await FAQ.insertMany([
    { generationId: gen._id, projectId: '$P1_ID', userId: '$USER_ID', persona: 'nora', question: faqText, answer: 'Answer A' },
    { generationId: gen._id, projectId: '$P1_ID', userId: '$USER_ID', persona: 'pro', question: unrelatedText, answer: 'Answer B' }
  ]);
  process.exit(0);
}
run();
"

echo -e "\n--- TEST: DRIFT CALCULATION ---"
DRIFT=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d "{\"knowledgeSourceId\":\"$SOURCE_ID\"}" http://localhost:5001/api/projects/$P1_ID/knowledge/drift)
echo $DRIFT | jq '{ driftScore, changedChunks, affectedFaqs: .affectedFaqs | map(.reason) }' || echo $DRIFT

DRIFT_ID=$(echo $DRIFT | jq -r '._id')

echo -e "\n--- TEST: CONCURRENT/IDEMPOTENT RACE CONDITION PROTECTION ---"
curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d "{\"knowledgeSourceId\":\"$SOURCE_ID\"}" http://localhost:5001/api/projects/$P1_ID/knowledge/drift > /dev/null
DRIFT2=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d "{\"knowledgeSourceId\":\"$SOURCE_ID\"}" http://localhost:5001/api/projects/$P1_ID/knowledge/drift)
DRIFT2_ID=$(echo $DRIFT2 | jq -r '._id')
echo "First Drift ID: $DRIFT_ID"
echo "Second Drift ID: $DRIFT2_ID"
if [ "$DRIFT_ID" == "$DRIFT2_ID" ]; then
  echo "Idempotency protection SUCCESS"
else
  echo "Idempotency protection FAILED"
fi

kill $SERVER_PID
rm cookie.txt ingestion_test_out.txt
