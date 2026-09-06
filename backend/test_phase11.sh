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

# Register Users
curl -s -c cookie.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"Test1\",\"email\":\"$EMAIL\",\"password\":\"password123\"}" http://localhost:5001/api/auth/register > /dev/null
curl -s -c cookie2.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"Test2\",\"email\":\"$EMAIL2\",\"password\":\"password123\"}" http://localhost:5001/api/auth/register > /dev/null

echo -e "\n--- TEST: EMPTY DASHBOARD ---"
DASH_EMPTY=$(curl -s -b cookie.txt http://localhost:5001/api/dashboard)
echo $DASH_EMPTY | jq '.' || echo $DASH_EMPTY

# Add Project 1
P1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"title":"P1","description":"Desc"}' http://localhost:5001/api/projects)
P1_ID=$(echo $P1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Add Generation 1
GEN1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"inputSnapshot":{"topic":"test"}}' http://localhost:5001/api/projects/$P1_ID/generations)
GEN1_ID=$(echo $GEN1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)

USER_RES=$(curl -s -b cookie.txt http://localhost:5001/api/auth/me)
USER_ID=$(echo $USER_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Insert FAQs for Gen 1 (2 total, 1 selected)
node -e "
const mongoose = require('mongoose');
const FAQ = require('./src/models/FAQ');
const Generation = require('./src/models/Generation');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const docs = [
    { generationId: '$GEN1_ID', projectId: '$P1_ID', userId: '$USER_ID', persona: 'nora', question: 'Q1', answer: 'A1', selected: true },
    { generationId: '$GEN1_ID', projectId: '$P1_ID', userId: '$USER_ID', persona: 'sam', question: 'Q2', answer: 'A2', selected: false }
  ];
  const inserted = await FAQ.insertMany(docs);
  await Generation.findByIdAndUpdate('$GEN1_ID', { 
    selectedFaqIds: [inserted[0]._id],
    seoAnalysis: { score: 90 },
    publication: { status: 'published' }
  });
  process.exit(0);
}
run();
"

# Cross User Empty
echo -e "\n--- TEST: CROSS USER EMPTY DASHBOARD ---"
DASH_CROSS=$(curl -s -b cookie2.txt http://localhost:5001/api/dashboard)
echo $DASH_CROSS | jq '.' || echo $DASH_CROSS

echo -e "\n--- TEST: POPULATED DASHBOARD ---"
DASH_POP=$(curl -s -b cookie.txt http://localhost:5001/api/dashboard)
echo $DASH_POP | jq '.' || echo $DASH_POP

kill $SERVER_PID
rm cookie.txt cookie2.txt
