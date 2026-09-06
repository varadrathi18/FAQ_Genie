#!/bin/bash
set -e

cd ../backend
killall node || true
sleep 2

node src/server.js > api.log 2>&1 &
API_PID=$!
node src/worker.js > worker.log 2>&1 &
WORKER_PID=$!
sleep 5

TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@example.com"

# Setup
curl -s -c cookie.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"password123\"}" http://localhost:5001/api/auth/register > /dev/null
P1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"title":"P1","description":"Desc"}' http://localhost:5001/api/projects)
P1_ID=$(echo $P1 | jq -r '.id')

echo -e "\n--- TEST: KNOWLEDGE INGESTION ---"
INGEST1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"url":"http://example.com"}' http://localhost:5001/api/projects/$P1_ID/knowledge/website)
JOB_ID1=$(echo $INGEST1 | jq -r '.jobId')
SOURCE_ID=$(echo $INGEST1 | jq -r '.sourceId')
echo "Job 1 (First Ingestion): $JOB_ID1"

# Active duplicate (immediately)
INGEST2=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"url":"http://example.com"}' http://localhost:5001/api/projects/$P1_ID/knowledge/website)
JOB_ID2=$(echo $INGEST2 | jq -r '.jobId')
echo "Job 2 (Active Duplicate): $JOB_ID2"

if [ "$JOB_ID1" == "$JOB_ID2" ]; then
  echo "Active duplicate SUCCESS (Reused)"
else
  echo "Active duplicate FAILED (Not reused)"
fi

echo "Polling Job 1..."
for i in {1..10}; do
  STATUS=$(curl -s -b cookie.txt http://localhost:5001/api/jobs/$JOB_ID1 | jq -r '.status')
  if [ "$STATUS" == "completed" ] || [ "$STATUS" == "failed" ]; then
    echo "Job 1 finished: $STATUS"
    break
  fi
  sleep 1
done

# Post-completion duplicate
INGEST3=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"url":"http://example.com"}' http://localhost:5001/api/projects/$P1_ID/knowledge/website)
JOB_ID3=$(echo $INGEST3 | jq -r '.jobId')
echo "Job 3 (Post-Completion): $JOB_ID3"

if [ "$JOB_ID1" != "$JOB_ID3" ]; then
  echo "Post-completion duplicate SUCCESS (New Job Created)"
else
  echo "Post-completion duplicate FAILED (Reused old job)"
fi

echo -e "\n--- TEST: FAQ GENERATION ---"
GEN=$(curl -s -b cookie.txt -H "Content-Type: application/json" -d '{"inputSnapshot":{}}' -X POST http://localhost:5001/api/projects/$P1_ID/generations)
GEN_ID=$(echo $GEN | jq -r '.id')

# Fire concurrently to guarantee the second request hits while the first is still waiting/active
curl -s -b cookie.txt -X POST http://localhost:5001/api/projects/$P1_ID/generations/$GEN_ID/faqs/generate > faq1.json &
CURL_PID1=$!
curl -s -b cookie.txt -X POST http://localhost:5001/api/projects/$P1_ID/generations/$GEN_ID/faqs/generate > faq2.json &
CURL_PID2=$!
wait $CURL_PID1 $CURL_PID2

FAQ_JOB1=$(cat faq1.json | jq -r '.jobId')
echo "FAQ Job 1: $FAQ_JOB1"

FAQ_JOB2=$(cat faq2.json | jq -r '.jobId')
echo "FAQ Job 2 (Active Duplicate): $FAQ_JOB2"

if [ "$FAQ_JOB1" == "$FAQ_JOB2" ]; then
  echo "Active duplicate FAQ SUCCESS (Reused)"
else
  echo "Active duplicate FAQ FAILED (Not reused)"
fi

echo "Polling FAQ Job 1..."
for i in {1..10}; do
  STATUS=$(curl -s -b cookie.txt http://localhost:5001/api/jobs/$FAQ_JOB1 | jq -r '.status')
  if [ "$STATUS" == "completed" ] || [ "$STATUS" == "failed" ]; then
    echo "FAQ Job 1 finished: $STATUS"
    curl -s -b cookie.txt http://localhost:5001/api/jobs/$FAQ_JOB1 | jq '.'
    break
  fi
  sleep 1
done

FAQ3=$(curl -s -b cookie.txt -X POST http://localhost:5001/api/projects/$P1_ID/generations/$GEN_ID/faqs/generate)
FAQ_JOB3=$(echo $FAQ3 | jq -r '.jobId')
echo "FAQ Job 3 (Post-Completion): $FAQ_JOB3"

if [ "$FAQ_JOB1" != "$FAQ_JOB3" ]; then
  echo "Post-completion duplicate FAQ SUCCESS (New Job Created)"
else
  echo "Post-completion duplicate FAQ FAILED (Reused old job)"
fi

kill $API_PID $WORKER_PID
rm cookie.txt
