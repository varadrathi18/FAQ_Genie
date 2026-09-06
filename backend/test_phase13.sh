#!/bin/bash
set -e

cd ../backend

# Clean start
killall node || true
sleep 2

# Start API
node src/server.js > api.log 2>&1 &
API_PID=$!

# Start Worker
node src/worker.js > worker.log 2>&1 &
WORKER_PID=$!

sleep 5

TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@example.com"

# Register & create project
curl -s -c cookie.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"password123\"}" http://localhost:5001/api/auth/register > /dev/null
P1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"title":"P1","description":"Desc"}' http://localhost:5001/api/projects)
P1_ID=$(echo $P1 | jq -r '.id')
USER_RES=$(curl -s -b cookie.txt http://localhost:5001/api/auth/me)
USER_ID=$(echo $USER_RES | jq -r '.id')

# Create second user for unauthorized test
EMAIL2="test2_${TIMESTAMP}@example.com"
curl -s -c cookie2.txt -X POST -H "Content-Type: application/json" -d "{\"name\":\"Test2\",\"email\":\"$EMAIL2\",\"password\":\"password123\"}" http://localhost:5001/api/auth/register > /dev/null


echo -e "\n--- TEST: QUEUE KNOWLEDGE INGESTION ---"
INGEST=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"url":"http://example.com"}' http://localhost:5001/api/projects/$P1_ID/knowledge/website)
echo $INGEST | jq '.' || echo $INGEST
JOB_ID=$(echo $INGEST | jq -r '.jobId')
SOURCE_ID=$(echo $INGEST | jq -r '.sourceId')

if [ "$JOB_ID" == "null" ]; then
  echo "Failed to queue knowledge ingestion"
  kill $API_PID $WORKER_PID
  exit 1
fi

echo -e "\n--- TEST: JOB OWNERSHIP ISOLATION ---"
UNAUTH=$(curl -s -b cookie2.txt http://localhost:5001/api/jobs/$JOB_ID)
echo $UNAUTH | jq '.' || echo $UNAUTH


echo -e "\n--- TEST: POLLING KNOWLEDGE JOB ---"
for i in {1..10}; do
  STATUS_RES=$(curl -s -b cookie.txt http://localhost:5001/api/jobs/$JOB_ID)
  STATUS=$(echo $STATUS_RES | jq -r '.status')
  if [ "$STATUS" == "completed" ]; then
    echo "Job completed successfully!"
    echo $STATUS_RES | jq '.'
    break
  elif [ "$STATUS" == "failed" ]; then
    echo "Job failed!"
    echo $STATUS_RES | jq '.'
    break
  fi
  echo "Status: $STATUS (Polling...)"
  sleep 2
done


echo -e "\n--- TEST: QUEUE FAQ GENERATION ---"
GEN=$(curl -s -b cookie.txt -H "Content-Type: application/json" -d '{"inputSnapshot":{}}' -X POST http://localhost:5001/api/projects/$P1_ID/generations)
GEN_ID=$(echo $GEN | jq -r '.id')

FAQ_GEN=$(curl -s -b cookie.txt -X POST http://localhost:5001/api/projects/$P1_ID/generations/$GEN_ID/faqs/generate)
echo $FAQ_GEN | jq '.' || echo $FAQ_GEN
FAQ_JOB_ID=$(echo $FAQ_GEN | jq -r '.jobId')

echo -e "\n--- TEST: IDEMPOTENCY / DUPLICATE JOBS ---"
FAQ_GEN2=$(curl -s -b cookie.txt -X POST http://localhost:5001/api/projects/$P1_ID/generations/$GEN_ID/faqs/generate)
FAQ_JOB_ID2=$(echo $FAQ_GEN2 | jq -r '.jobId')

if [ "$FAQ_JOB_ID" == "$FAQ_JOB_ID2" ]; then
  echo "Idempotency SUCCESS: duplicate API call returned the exact same Job ID."
else
  echo "Idempotency FAILED."
fi

echo -e "\n--- TEST: POLLING FAQ JOB ---"
for i in {1..15}; do
  STATUS_RES=$(curl -s -b cookie.txt http://localhost:5001/api/jobs/$FAQ_JOB_ID)
  STATUS=$(echo $STATUS_RES | jq -r '.status')
  if [ "$STATUS" == "completed" ]; then
    echo "FAQ Job completed successfully!"
    echo $STATUS_RES | jq '.'
    break
  elif [ "$STATUS" == "failed" ]; then
    echo "FAQ Job failed!"
    echo $STATUS_RES | jq '.'
    break
  fi
  echo "Status: $STATUS (Polling...)"
  sleep 2
done

echo -e "\n--- TEST: QUEUE KNOWLEDGE DRIFT ---"
# Trigger drift manually for the same source
DRIFT_GEN=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d "{\"knowledgeSourceId\":\"$SOURCE_ID\"}" http://localhost:5001/api/projects/$P1_ID/knowledge/drift)
echo $DRIFT_GEN | jq '.' || echo $DRIFT_GEN
DRIFT_JOB_ID=$(echo $DRIFT_GEN | jq -r '.jobId')

echo -e "\n--- TEST: POLLING DRIFT JOB ---"
for i in {1..10}; do
  STATUS_RES=$(curl -s -b cookie.txt http://localhost:5001/api/jobs/$DRIFT_JOB_ID)
  STATUS=$(echo $STATUS_RES | jq -r '.status')
  if [ "$STATUS" == "completed" ]; then
    echo "Drift Job completed successfully!"
    echo $STATUS_RES | jq '.'
    break
  elif [ "$STATUS" == "failed" ]; then
    echo "Drift Job failed!"
    echo $STATUS_RES | jq '.'
    break
  fi
  echo "Status: $STATUS (Polling...)"
  sleep 2
done

# Cleanup
kill $API_PID $WORKER_PID
rm cookie.txt cookie2.txt
