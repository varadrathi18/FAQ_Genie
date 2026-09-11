#!/bin/bash

# Utility to start the ML service cleanly.
cd ML

if [ ! -d "api_venv" ]; then
  echo "Error: ML virtual environment 'api_venv' not found."
  echo "Please run: python3.11 -m venv api_venv && source api_venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

source api_venv/bin/activate

# Check if port 8000 is already in use
PID=$(lsof -ti tcp:8000)
if [ ! -z "$PID" ]; then
  echo "Error: Port 8000 is already in use by PID $PID."
  echo "Run 'npm run stop:ml' to clear it first."
  exit 1
fi

echo "Starting ML API on port 8000..."
# Using --host and --port instead of --reload for normal documented local startup
# --reload spawns multiple processes which makes process management confusing.
python -m uvicorn api:app --host 127.0.0.1 --port 8000
