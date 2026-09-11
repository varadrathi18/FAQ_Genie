#!/bin/bash

# Utility to start the Frontend cleanly.
cd Frontend

# Check if port 3000 is already in use
PID=$(lsof -ti tcp:3000)
if [ ! -z "$PID" ]; then
  echo "Error: Port 3000 is already in use by PID $PID."
  echo "Run 'npm run stop:frontend' to clear it first."
  exit 1
fi

echo "Starting Frontend on port 3000..."
npm run dev
