#!/bin/bash

if [ -f server.pid ]; then
  pid=$(cat server.pid)
  if ps -p $pid > /dev/null; then
    echo "Stopping server with PID $pid"
    kill $pid
    rm server.pid
    echo "Server stopped"
  else
    echo "Server process not running, cleaning up PID file"
    rm server.pid
  fi
else
  echo "No server PID file found"
fi