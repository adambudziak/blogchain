#!/usr/bin/env bash

while ! curl http://backend:8000/api/ >/dev/null 2>&1; do
  echo "Couldn't connect with the backend... Waiting 5s"
  sleep 5
done

echo "Running backend API tests"
cd /backend && PYTHONPATH=$PYTHONPATH:tests pytest tests/
