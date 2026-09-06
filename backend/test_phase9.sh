#!/bin/bash
set -e

cd ../backend
killall node || true
node src/server.js > node_server.log 2>&1 &
SERVER_PID=$!
sleep 5

TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@example.com"

# Setup
curl -s -c cookie.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"password123\"}" http://localhost:5001/api/auth/register > /dev/null

P1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"title":"Test Proj","description":"Desc","websiteUrl":"https://example.com"}' http://localhost:5001/api/projects)
P1_ID=$(echo $P1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

GEN1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"inputSnapshot":{"topic":"test"}}' http://localhost:5001/api/projects/$P1_ID/generations)
GEN1_ID=$(echo $GEN1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

USER_RES=$(curl -s -b cookie.txt http://localhost:5001/api/auth/me)
USER_ID=$(echo $USER_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "Inserting mock FAQs..."
node -e "
const mongoose = require('mongoose');
const FAQ = require('./src/models/FAQ');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await FAQ.deleteMany({ generationId: '$GEN1_ID' });
  const docs = [
    { generationId: '$GEN1_ID', projectId: '$P1_ID', userId: '$USER_ID', persona: 'nora', question: 'How do I login?', answer: 'Click login on the top right.', intent: 'auth', intentConfidence: 0.9, selected: false }
  ];
  const inserted = await FAQ.insertMany(docs);
  console.log(inserted[0]._id.toString());
  process.exit(0);
}
run();
" > inserted_ids.txt

ID1=$(tail -n 1 inserted_ids.txt | tr -d ' ')

echo -e "\n--- TEST: PREVIEW (No Selection) ---"
PREV1=$(curl -s -b cookie.txt http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/publication/preview)
echo $PREV1 | jq '.' || echo $PREV1

echo -e "\n--- TEST: PUBLISH WITHOUT SEO ---"
# Select FAQ
curl -s -b cookie.txt -X PATCH -H "Content-Type: application/json" -d "{\"selectedFaqIds\":[\"$ID1\"]}" http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/faqs/selection > /dev/null
# Try publish
PUB_NO_SEO=$(curl -s -b cookie.txt -X POST http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/publication)
echo $PUB_NO_SEO | jq '.' || echo $PUB_NO_SEO

echo -e "\n--- TEST: RUN SEO AND PUBLISH ---"
curl -s -b cookie.txt -X POST http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/seo/analyze > /dev/null
PUB_OK=$(curl -s -b cookie.txt -X POST http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/publication)
echo $PUB_OK | jq '.' || echo $PUB_OK

WIDGET_ID=$(echo $PUB_OK | grep -o '"widgetId":"[^"]*' | cut -d'"' -f4)
echo "WIDGET_ID=$WIDGET_ID"

echo -e "\n--- TEST: GET PUBLIC WIDGET ---"
PUB_WIDGET=$(curl -s http://localhost:5001/api/public/widgets/$WIDGET_ID)
echo $PUB_WIDGET | jq '.' || echo $PUB_WIDGET

echo -e "\n--- TEST: UNPUBLISH ---"
UNPUB=$(curl -s -b cookie.txt -X DELETE http://localhost:5001/api/projects/$P1_ID/generations/$GEN1_ID/publication)
echo $UNPUB | jq '.' || echo $UNPUB

echo -e "\n--- TEST: GET PUBLIC WIDGET (UNPUBLISHED) ---"
PUB_404=$(curl -s -w "%{http_code}" http://localhost:5001/api/public/widgets/$WIDGET_ID)
echo $PUB_404

kill $SERVER_PID
rm inserted_ids.txt cookie.txt
