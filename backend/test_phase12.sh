#!/bin/bash
set -e

cd ../backend
killall node || true
node src/server.js > node_server.log 2>&1 &
SERVER_PID=$!
sleep 5

TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@example.com"

# Register User
curl -s -c cookie.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"Test1\",\"email\":\"$EMAIL\",\"password\":\"password123\"}" http://localhost:5001/api/auth/register > /dev/null

USER_RES=$(curl -s -b cookie.txt http://localhost:5001/api/auth/me)
USER_ID=$(echo $USER_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Create Project
P1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"title":"P1","description":"Desc"}' http://localhost:5001/api/projects)
P1_ID=$(echo $P1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Seed Mongoose directly to avoid actual scraping and ML calls for speed, but test exactly our business logic
node -e "
const mongoose = require('mongoose');
const crypto = require('crypto');
const KnowledgeSource = require('./src/models/KnowledgeSource');
const KnowledgeChunk = require('./src/models/KnowledgeChunk');
const FAQ = require('./src/models/FAQ');
const Generation = require('./src/models/Generation');
require('dotenv').config();

const normalizeText = (text) => text.toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim();
const getHash = (text) => crypto.createHash('sha256').update(normalizeText(text)).digest('hex');

// Dummy embeddings that trigger similarities (cosine sim > 0.85 requires they be close)
const embedA1 = Array(768).fill(0.1);
const embedA2 = Array(768).fill(0.101); // highly similar to A1, Modified
const embedB1 = Array(768).fill(0.2); // Exact
const embedC1 = Array(768).fill(0.3); // Removed
const embedD2 = Array(768).fill(0.4); // Added
const embedFAQ = Array(768).fill(0.105); // FAQ matching A

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // 1. Create Source
  const source = await KnowledgeSource.create({
    projectId: '$P1_ID', userId: '$USER_ID', type: 'website', url: 'http://example.com', currentVersion: 2, status: 'ready'
  });

  // 2. Insert V1 Chunks
  await KnowledgeChunk.insertMany([
    { projectId: '$P1_ID', knowledgeSourceId: source._id, userId: '$USER_ID', text: 'Sentence A1', sourceUrl: 'http://example.com', chunkIndex: 0, version: 1, contentHash: getHash('Sentence A1'), embedding: embedA1 },
    { projectId: '$P1_ID', knowledgeSourceId: source._id, userId: '$USER_ID', text: 'Sentence B1', sourceUrl: 'http://example.com', chunkIndex: 1, version: 1, contentHash: getHash('Sentence B1'), embedding: embedB1 },
    { projectId: '$P1_ID', knowledgeSourceId: source._id, userId: '$USER_ID', text: 'Sentence C1', sourceUrl: 'http://example.com', chunkIndex: 2, version: 1, contentHash: getHash('Sentence C1'), embedding: embedC1 }
  ]);

  // 3. Insert V2 Chunks (A2 modified, B1 exact, C1 removed, D2 added)
  await KnowledgeChunk.insertMany([
    { projectId: '$P1_ID', knowledgeSourceId: source._id, userId: '$USER_ID', text: 'Sentence A2', sourceUrl: 'http://example.com', chunkIndex: 0, version: 2, contentHash: getHash('Sentence A2'), embedding: embedA2 },
    { projectId: '$P1_ID', knowledgeSourceId: source._id, userId: '$USER_ID', text: 'Sentence B1', sourceUrl: 'http://example.com', chunkIndex: 1, version: 2, contentHash: getHash('Sentence B1'), embedding: embedB1 },
    { projectId: '$P1_ID', knowledgeSourceId: source._id, userId: '$USER_ID', text: 'Sentence D2', sourceUrl: 'http://example.com', chunkIndex: 2, version: 2, contentHash: getHash('Sentence D2'), embedding: embedD2 }
  ]);

  // 4. Insert FAQ (matches A)
  const gen = await Generation.create({ projectId: '$P1_ID', userId: '$USER_ID', version: 1, inputSnapshot: {} });
  await FAQ.create({ generationId: gen._id, projectId: '$P1_ID', userId: '$USER_ID', persona: 'nora', question: 'Question about A', answer: 'Answer A' });

  // Expose source ID
  console.log(source._id.toString());
  process.exit(0);
}
run();
" > source_id.txt

SOURCE_ID=$(tail -n 1 source_id.txt | tr -d ' ')

# Need to mock the ML endpoint to return embedFAQ for the FAQ question
# Since we can't easily mock the fetch in test without breaking the real app,
# I'll just rely on the fallback or actual ML service if it's running. 
# Wait, if ML_SERVICE_URL is hit by FAQ embedding during drift calculation, it will actually call Python!
# That's fine, the Python server is running and will return a real embedding for 'Question about A'.
# So the similarity might not match our mock embedA2 perfectly. 
# Let's see if the drift itself calculates successfully first.

echo -e "\n--- TEST: DRIFT CALCULATION ---"
DRIFT=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d "{\"knowledgeSourceId\":\"$SOURCE_ID\"}" http://localhost:5001/api/projects/$P1_ID/knowledge/drift)
echo $DRIFT | jq '.' || echo $DRIFT

DRIFT_ID=$(echo $DRIFT | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

echo -e "\n--- TEST: IDEMPOTENT DRIFT CALCULATION ---"
DRIFT_AGAIN=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d "{\"knowledgeSourceId\":\"$SOURCE_ID\"}" http://localhost:5001/api/projects/$P1_ID/knowledge/drift)
echo $DRIFT_AGAIN | jq '.' || echo $DRIFT_AGAIN

echo -e "\n--- TEST: REVIEW DRIFT ---"
REVIEW=$(curl -s -b cookie.txt -X PATCH -H "Content-Type: application/json" -d "{\"status\":\"reviewed\"}" http://localhost:5001/api/projects/$P1_ID/knowledge/drift/$DRIFT_ID)
echo $REVIEW | jq '.' || echo $REVIEW

kill $SERVER_PID
rm cookie.txt source_id.txt
