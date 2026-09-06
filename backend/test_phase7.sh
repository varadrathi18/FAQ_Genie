#!/bin/bash
set -e

# Restart server
cd ../backend
killall node || true
node src/server.js > node_server.log 2>&1 &
SERVER_PID=$!
sleep 5

TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@example.com"
EMAIL2="test2_${TIMESTAMP}@example.com"

# Setup
curl -s -c cookie.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"password123\"}" http://localhost:5001/api/auth/register > /dev/null
curl -s -c cookie2.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"Test2\",\"email\":\"$EMAIL2\",\"password\":\"password123\"}" http://localhost:5001/api/auth/register > /dev/null

P1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"title":"Test Proj","description":"Desc"}' http://localhost:5001/api/projects)
P1_ID=$(echo $P1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

GEN1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"inputSnapshot":{"topic":"test"}}' http://localhost:5001/api/projects/$P1_ID/generations)
GEN1_ID=$(echo $GEN1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "Generating mock FAQs..."
USER_RES=$(curl -s -b cookie.txt http://localhost:5001/api/auth/me)
USER_ID=$(echo $USER_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

node -e "
const mongoose = require('mongoose');
const FAQ = require('./src/models/FAQ');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await FAQ.deleteMany({ generationId: '$GEN1_ID' });
  const docs = [];
  for (let i = 0; i < 15; i++) {
    docs.push({
      generationId: '$GEN1_ID',
      projectId: '$P1_ID',
      userId: '$USER_ID',
      persona: i % 3 === 0 ? 'nora' : (i % 3 === 1 ? 'sam' : 'pro'),
      question: 'Test Question ' + i + ' with unique words ' + Math.random(),
      answer: 'Test Answer ' + i + ' very long answer to boost score by length ' + 'x'.repeat(100),
      intent: i % 2 === 0 ? 'info' : 'troubleshoot',
      intentConfidence: 0.9 + (i / 100),
      sourceReferences: [{score: 0.9}],
      selected: false
    });
  }
  await FAQ.insertMany(docs);
  console.log('Inserted mock FAQs');
  process.exit(0);
}
run();
"

echo -e "\n--- TEST: SUGGEST FAQs ---"
SUGGEST=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/faqs/suggest)
echo $SUGGEST | jq '.' || echo $SUGGEST
COUNT=$(echo $SUGGEST | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ "$COUNT" != "10" ]; then
  echo "Expected 10 suggested FAQs, got $COUNT"
  exit 1
fi

SUGGESTED_IDS=$(echo $SUGGEST | grep -o '"suggestedFaqIds":\[[^]]*\]' | cut -d'[' -f2 | cut -d']' -f1)
echo "Suggested IDs: $SUGGESTED_IDS"

echo -e "\n--- TEST: DB CONSISTENCY AFTER SUGGEST ---"
node -e "
const mongoose = require('mongoose');
const FAQ = require('./src/models/FAQ');
const Generation = require('./src/models/Generation');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const selectedCount = await FAQ.countDocuments({ generationId: '$GEN1_ID', selected: true });
  const gen = await Generation.findById('$GEN1_ID');
  if (selectedCount !== 0 || gen.selectedFaqIds.length !== 0) {
    console.error('Suggest modified the database!');
    process.exit(1);
  }
  console.log('Suggest did not modify DB. Passed.');
  process.exit(0);
}
run();
"

echo -e "\n--- TEST: SAVE SELECTION (Valid) ---"
# Select the first 3 IDs from the suggestion
ID1=$(echo $SUGGESTED_IDS | cut -d',' -f1 | tr -d '"' | tr -d ' ')
ID2=$(echo $SUGGESTED_IDS | cut -d',' -f2 | tr -d '"' | tr -d ' ')
ID3=$(echo $SUGGESTED_IDS | cut -d',' -f3 | tr -d '"' | tr -d ' ')

curl -s -b cookie.txt -X PATCH -H "Content-Type: application/json" -d "{\"selectedFaqIds\":[\"$ID1\", \"$ID2\", \"$ID3\", \"$ID1\"]}" http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/faqs/selection > selection_result.json
cat selection_result.json

echo -e "\n--- TEST: SAVE SELECTION (Invalid ID) ---"
curl -s -b cookie.txt -X PATCH -H "Content-Type: application/json" -d "{\"selectedFaqIds\":[\"invalid\"]}" http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/faqs/selection > invalid_selection.json
cat invalid_selection.json

echo -e "\n--- TEST: CROSS-USER SELECTION ---"
curl -s -b cookie2.txt -X PATCH -H "Content-Type: application/json" -d "{\"selectedFaqIds\":[\"$ID1\"]}" http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/faqs/selection > cross_user_selection.json
cat cross_user_selection.json

echo -e "\n--- TEST: DB CONSISTENCY VERIFICATION ---"
node -e "
const mongoose = require('mongoose');
const FAQ = require('./src/models/FAQ');
const Generation = require('./src/models/Generation');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const selectedFaqs = await FAQ.find({ generationId: '$GEN1_ID', selected: true });
  const gen = await Generation.findById('$GEN1_ID');
  
  if (selectedFaqs.length !== 3) {
    console.error('Expected 3 selected FAQs, got ' + selectedFaqs.length);
    process.exit(1);
  }
  if (gen.selectedFaqIds.length !== 3) {
    console.error('Expected 3 in Generation.selectedFaqIds, got ' + gen.selectedFaqIds.length);
    process.exit(1);
  }
  
  const faqIds = selectedFaqs.map(f => f._id.toString()).sort();
  const genIds = gen.selectedFaqIds.map(id => id.toString()).sort();
  
  if (JSON.stringify(faqIds) !== JSON.stringify(genIds)) {
    console.error('Mismatch between FAQ.selected and Generation.selectedFaqIds!');
    console.error(faqIds, genIds);
    process.exit(1);
  }
  
  console.log('Consistency check passed!');
  process.exit(0);
}
run();
"

kill $SERVER_PID
