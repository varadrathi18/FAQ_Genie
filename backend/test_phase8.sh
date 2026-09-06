#!/bin/bash
set -e

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

USER_RES=$(curl -s -b cookie.txt http://localhost:5001/api/auth/me)
USER_ID=$(echo $USER_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "Generating mock FAQs for SEO..."
node -e "
const mongoose = require('mongoose');
const FAQ = require('./src/models/FAQ');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await FAQ.deleteMany({ generationId: '$GEN1_ID' });
  const docs = [
    { generationId: '$GEN1_ID', projectId: '$P1_ID', userId: '$USER_ID', persona: 'nora', question: 'How do I login?', answer: 'You can login by clicking the login button on the top right.'.repeat(2), intent: 'auth', intentConfidence: 0.9, sourceReferences: [{score: 0.9}], selected: false },
    { generationId: '$GEN1_ID', projectId: '$P1_ID', userId: '$USER_ID', persona: 'sam', question: 'Is my data secure?', answer: 'Yes, your data is secure and encrypted at rest.'.repeat(2), intent: 'security', intentConfidence: 0.9, sourceReferences: [], selected: false },
    { generationId: '$GEN1_ID', projectId: '$P1_ID', userId: '$USER_ID', persona: 'pro', question: 'What is the API rate limit?', answer: 'The rate limit is 100 req/s.'.repeat(2), intent: 'technical', intentConfidence: 0.9, sourceReferences: [{score: 0.9}], selected: false },
    // A highly similar duplicate question to test Jaccard uniqueness penalty
    { generationId: '$GEN1_ID', projectId: '$P1_ID', userId: '$USER_ID', persona: 'nora', question: 'How do I log in?', answer: 'Click login on the top right.'.repeat(2), intent: 'auth', intentConfidence: 0.9, sourceReferences: [{score: 0.9}], selected: false }
  ];
  const inserted = await FAQ.insertMany(docs);
  console.log(inserted.map(d => d._id.toString()).join(','));
  process.exit(0);
}
run();
" > inserted_ids.txt

IDS_STR=$(tail -n 1 inserted_ids.txt)
ID1=$(echo $IDS_STR | cut -d',' -f1)
ID2=$(echo $IDS_STR | cut -d',' -f2)
ID3=$(echo $IDS_STR | cut -d',' -f3)
ID4=$(echo $IDS_STR | cut -d',' -f4) # Duplicate question

echo -e "\n--- TEST: SEO NO SELECTION ---"
curl -s -b cookie.txt -X POST -H "Content-Type: application/json" http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/seo/analyze > seo_empty.json
cat seo_empty.json

echo -e "\n--- TEST: SELECT FAQs AND ANALYZE SEO ---"
curl -s -b cookie.txt -X PATCH -H "Content-Type: application/json" -d "{\"selectedFaqIds\":[\"$ID1\", \"$ID2\", \"$ID3\", \"$ID4\"]}" http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/faqs/selection > /dev/null

SEO_RES=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/seo/analyze)
echo $SEO_RES | jq '.' || echo $SEO_RES

echo -e "\n--- TEST: CROSS-USER ISOLATION ---"
curl -s -b cookie2.txt -X POST -H "Content-Type: application/json" http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/seo/analyze > cross_user_seo.json
cat cross_user_seo.json

echo -e "\n--- TEST: CLEAR SEO ON SELECTION CHANGE ---"
node -e "
const mongoose = require('mongoose');
const Generation = require('./src/models/Generation');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const gen = await Generation.findById('$GEN1_ID');
  if (!gen.seoAnalysis) { console.error('SEO Analysis was not persisted!'); process.exit(1); }
  console.log('SEO Analysis is persisted.');
  process.exit(0);
}
run();
"

curl -s -b cookie.txt -X PATCH -H "Content-Type: application/json" -d "{\"selectedFaqIds\":[\"$ID1\", \"$ID2\"]}" http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/faqs/selection > /dev/null

node -e "
const mongoose = require('mongoose');
const Generation = require('./src/models/Generation');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const gen = await Generation.findById('$GEN1_ID');
  if (gen.seoAnalysis) { console.error('SEO Analysis was not cleared on selection change!'); process.exit(1); }
  console.log('SEO Analysis successfully cleared on selection change.');
  process.exit(0);
}
run();
"

kill $SERVER_PID
rm inserted_ids.txt seo_empty.json cross_user_seo.json cookie.txt cookie2.txt
