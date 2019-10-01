#!/usr/bin/env bash

while ! curl http://backend:8000/api/ >/dev/null 2>&1; do
  echo "Couldn't connect with the backend... Waiting 5s"
  sleep 5
done

echo "Running backend API tests"
# TODO this is a hack to force pytest to not use init file for backend
rm /backend/pytest.ini
cd /backend && PYTHONPATH=$PYTHONPATH:tests pytest --noconftest tests/
