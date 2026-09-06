#!/bin/bash
set -e

cd ../backend
killall node || true
node src/server.js > node_server.log 2>&1 &
SERVER_PID=$!
sleep 5

TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@example.com"

# Setup User & Project
curl -s -c cookie.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"password123\"}" http://localhost:5001/api/auth/register > /dev/null
P1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"title":"History Proj","description":"Desc"}' http://localhost:5001/api/projects)
P1_ID=$(echo $P1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
USER_RES=$(curl -s -b cookie.txt http://localhost:5001/api/auth/me)
USER_ID=$(echo $USER_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Create Generation 1
GEN1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"inputSnapshot":{"topic":"test v1"}}' http://localhost:5001/api/projects/$P1_ID/generations)
GEN1_ID=$(echo $GEN1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Insert FAQs for Generation 1
echo "Inserting FAQs for V1..."
node -e "
const mongoose = require('mongoose');
const FAQ = require('./src/models/FAQ');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await FAQ.deleteMany({ generationId: '$GEN1_ID' });
  const docs = [
    { generationId: '$GEN1_ID', projectId: '$P1_ID', userId: '$USER_ID', persona: 'nora', question: 'V1 Q1', answer: 'A1', intent: 'test', intentConfidence: 1.0, selected: false }
  ];
  const inserted = await FAQ.insertMany(docs);
  console.log(inserted[0]._id.toString());
  process.exit(0);
}
run();
" > ids_v1.txt
V1_FAQ_ID=$(tail -n 1 ids_v1.txt | tr -d ' ')

# Select FAQ in Generation 1
curl -s -b cookie.txt -X PATCH -H "Content-Type: application/json" -d "{\"selectedFaqIds\":[\"$V1_FAQ_ID\"]}" http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/faqs/selection > /dev/null
# Wait 1s so v2 has a different createdAt
sleep 1

# Create Generation 2
GEN2=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"inputSnapshot":{"topic":"test v2"}}' http://localhost:5001/api/projects/$P1_ID/generations)
GEN2_ID=$(echo $GEN2 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Insert FAQs for Generation 2
echo "Inserting FAQs for V2..."
node -e "
const mongoose = require('mongoose');
const FAQ = require('./src/models/FAQ');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await FAQ.deleteMany({ generationId: '$GEN2_ID' });
  const docs = [
    { generationId: '$GEN2_ID', projectId: '$P1_ID', userId: '$USER_ID', persona: 'sam', question: 'V2 Q1', answer: 'A1', intent: 'test', intentConfidence: 1.0, selected: false },
    { generationId: '$GEN2_ID', projectId: '$P1_ID', userId: '$USER_ID', persona: 'pro', question: 'V2 Q2', answer: 'A2', intent: 'test', intentConfidence: 1.0, selected: false }
  ];
  await FAQ.insertMany(docs);
  process.exit(0);
}
run();
"

echo -e "\n--- TEST: HISTORY LIST ---"
HISTORY=$(curl -s -b cookie.txt http://localhost:5001/api/projects/$P1_ID/generations)
echo $HISTORY | jq '.' || echo $HISTORY

echo -e "\n--- TEST: GENERATION 1 DETAIL ---"
DETAIL_V1=$(curl -s -b cookie.txt http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID)
echo $DETAIL_V1 | jq '.' || echo $DETAIL_V1

echo -e "\n--- TEST: GENERATION 2 DETAIL ---"
DETAIL_V2=$(curl -s -b cookie.txt http://localhost:5001/api/projects/$P1_ID/generations/$GEN2_ID)
echo $DETAIL_V2 | jq '.' || echo $DETAIL_V2

kill $SERVER_PID
rm ids_v1.txt cookie.txt
