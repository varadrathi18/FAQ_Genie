#!/bin/bash

# Utility to stop a service running on a specific port safely.
# Usage: ./stop-service.sh <PORT> <EXPECTED_PROCESS_SIGNATURE> <SERVICE_NAME>

PORT=$1
SIGNATURE=$2
SERVICE_NAME=$3

if [ -z "$PORT" ] || [ -z "$SIGNATURE" ] || [ -z "$SERVICE_NAME" ]; then
  echo "Usage: ./stop-service.sh <PORT> <EXPECTED_PROCESS_SIGNATURE> <SERVICE_NAME>"
  exit 1
fi

PID=$(lsof -ti tcp:$PORT)

if [ -z "$PID" ]; then
  echo "$SERVICE_NAME is not running on port $PORT."
  exit 0
fi

# Get the full command line of the process
COMMAND=$(ps -p $PID -o args=)

if [[ "$COMMAND" == *"$SIGNATURE"* ]]; then
  echo "Stopping $SERVICE_NAME (PID: $PID) on port $PORT..."
  kill -9 $PID
  echo "$SERVICE_NAME stopped successfully."
else
  echo "WARNING: Port $PORT is occupied, but it does NOT match the expected $SERVICE_NAME process."
  echo "Process found: $COMMAND"
  echo "Refusing to kill unrelated process."
  exit 1
fi
