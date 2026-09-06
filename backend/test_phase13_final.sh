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

echo -e "\n--- TEST: KNOWLEDGE INGESTION (SUCCESS) ---"
INGEST1=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"url":"http://example.com"}' http://localhost:5001/api/projects/$P1_ID/knowledge/website)
JOB_ID1=$(echo $INGEST1 | jq -r '.jobId')
echo "Job 1 (First Ingestion): $JOB_ID1"

echo "Polling Job 1..."
for i in {1..10}; do
  STATUS=$(curl -s -b cookie.txt http://localhost:5001/api/jobs/$JOB_ID1 | jq -r '.status')
  if [ "$STATUS" == "completed" ] || [ "$STATUS" == "failed" ]; then
    echo "Job 1 finished: $STATUS"
    break
  fi
  sleep 1
done

echo -e "\n--- TEST: KNOWLEDGE INGESTION (ACTIVE DUPLICATE) ---"
# We pause the worker momentarily if possible, or just fire two requests
# Since we can't easily pause, we fire two concurrent requests again
curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"url":"https://example.org"}' http://localhost:5001/api/projects/$P1_ID/knowledge/website > inj1.json
sleep 0.2
curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"url":"https://example.org"}' http://localhost:5001/api/projects/$P1_ID/knowledge/website > inj2.json

JOB_ID_CONC1=$(cat inj1.json | jq -r '.jobId')
JOB_ID_CONC2=$(cat inj2.json | jq -r '.jobId')
echo "Concurrent Job 1: $JOB_ID_CONC1"
echo "Concurrent Job 2: $JOB_ID_CONC2"
if [ "$JOB_ID_CONC1" == "$JOB_ID_CONC2" ]; then
  echo "Active duplicate SUCCESS (Reused)"
else
  echo "Active duplicate FAILED (Not reused)"
fi

echo -e "\n--- TEST: FAILED JOB ERROR SANITIZATION ---"
# We expect the worker to fail this URL, which should result in a failed job
BAD_INGEST=$(curl -s -b cookie.txt -X POST -H "Content-Type: application/json" -d '{"url":"http://localhost:8080"}' http://localhost:5001/api/projects/$P1_ID/knowledge/website)
BAD_JOB_ID=$(echo $BAD_INGEST | jq -r '.jobId')

echo "Polling Bad Job..."
for i in {1..15}; do
  JOB_RESP=$(curl -s -b cookie.txt http://localhost:5001/api/jobs/$BAD_JOB_ID)
  STATUS=$(echo $JOB_RESP | jq -r '.status')
  if [ "$STATUS" == "failed" ]; then
    echo "Bad Job finished: $STATUS"
    ERROR_MSG=$(echo $JOB_RESP | jq -r '.error.message')
    if [ "$ERROR_MSG" == "Job execution failed." ]; then
      echo "Failed Job error sanitization SUCCESS: $ERROR_MSG"
    else
      echo "Failed Job error sanitization FAILED. Expected 'Job execution failed.', got: $ERROR_MSG"
    fi
    break
  fi
  sleep 1
done

kill $API_PID $WORKER_PID
rm cookie.txt inj1.json inj2.json
