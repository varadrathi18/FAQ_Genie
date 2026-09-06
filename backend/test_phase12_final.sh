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
P1_ID=$(echo $P1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

USER_RES=$(curl -s -b cookie.txt http://localhost:5001/api/auth/me)
USER_ID=$(echo $USER_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo -e "\n--- SETTING UP FAQ & KNOWLEDGE VERSIONS WITH REAL EMBEDDINGS ---"
node -e "
const mongoose = require('mongoose');
const crypto = require('crypto');
const KnowledgeSource = require('./src/models/KnowledgeSource');
const KnowledgeChunk = require('./src/models/KnowledgeChunk');
const FAQ = require('./src/models/FAQ');
const Generation = require('./src/models/Generation');
const { generateEmbedding } = require('./src/services/embeddingService');
require('dotenv').config();

const normalizeText = (text) => text.toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim();
const getHash = (text) => crypto.createHash('sha256').update(normalizeText(text)).digest('hex');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Real embeddings via Python API
  const textV1 = 'Refunds are available within 7 days.';
  const textV2 = 'Refunds are available within 30 days.';
  const faqText = 'What is the refund period?';
  const unrelatedText = 'What are the office opening hours?';

  const embedV1 = await generateEmbedding(textV1);
  const embedV2 = await generateEmbedding(textV2);

  const source = await KnowledgeSource.create({
    projectId: '$P1_ID', userId: '$USER_ID', type: 'website', url: 'http://example.com', currentVersion: 2, status: 'ready'
  });

  await KnowledgeChunk.insertMany([
    { projectId: '$P1_ID', knowledgeSourceId: source._id, userId: '$USER_ID', text: textV1, sourceUrl: 'http://example.com', chunkIndex: 0, version: 1, contentHash: getHash(textV1), embedding: embedV1 }
  ]);

  await KnowledgeChunk.insertMany([
    { projectId: '$P1_ID', knowledgeSourceId: source._id, userId: '$USER_ID', text: textV2, sourceUrl: 'http://example.com', chunkIndex: 0, version: 2, contentHash: getHash(textV2), embedding: embedV2 }
  ]);

  const gen = await Generation.create({ projectId: '$P1_ID', userId: '$USER_ID', version: 1, inputSnapshot: {} });
  
  await FAQ.insertMany([
    { generationId: gen._id, projectId: '$P1_ID', userId: '$USER_ID', persona: 'nora', question: faqText, answer: 'Answer A' },
    { generationId: gen._id, projectId: '$P1_ID', userId: '$USER_ID', persona: 'pro', question: unrelatedText, answer: 'Answer B' }
  ]);

  console.log(source._id.toString());
  process.exit(0);
}
run();
" > source_id.txt

SOURCE_ID=$(tail -n 1 source_id.txt | tr -d ' ')

echo -e "\n--- TEST: DRIFT FAQ IMPACT ---"
DRIFT=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d "{\"knowledgeSourceId\":\"$SOURCE_ID\"}" http://localhost:5001/api/projects/$P1_ID/knowledge/drift)
echo $DRIFT | jq '.' || echo $DRIFT

DRIFT_ID=$(echo $DRIFT | grep -o '"_id":"[^"]*' | head -n 1 | cut -d'"' -f4)

echo -e "\n--- TEST: INVALID TRANSITION (RESOLVED -> REVIEWED) ---"
curl -s -b cookie.txt -X PATCH -H "Content-Type: application/json" -d "{\"status\":\"resolved\"}" http://localhost:5001/api/projects/$P1_ID/knowledge/drift/$DRIFT_ID > /dev/null
BAD_TRANSITION=$(curl -s -b cookie.txt -X PATCH -H "Content-Type: application/json" -d "{\"status\":\"reviewed\"}" http://localhost:5001/api/projects/$P1_ID/knowledge/drift/$DRIFT_ID)
echo $BAD_TRANSITION | jq '.' || echo $BAD_TRANSITION

echo -e "\n--- TEST: FAILURE SAFETY ---"
node -e "
const mongoose = require('mongoose');
const { processWebsiteSource } = require('./src/services/knowledgeService');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // To simulate failure, let's inject a monkey-patch into KnowledgeChunk.insertMany temporarily
  const KnowledgeChunk = require('./src/models/KnowledgeChunk');
  const originalInsertMany = KnowledgeChunk.insertMany;
  KnowledgeChunk.insertMany = async function() {
    throw new Error('Simulated persistence failure during transaction!');
  };

  try {
    await processWebsiteSource('$SOURCE_ID');
  } catch (err) { }
  
  const source = await require('./src/models/KnowledgeSource').findById('$SOURCE_ID');
  console.log('Current Version after failure:', source.currentVersion);
  
  // Revert patch
  KnowledgeChunk.insertMany = originalInsertMany;
  process.exit(0);
}
run();
"

kill $SERVER_PID
rm cookie.txt source_id.txt
