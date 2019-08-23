#!/usr/bin/env bash

set -e

python3 manage.py migrate
python3 manage.py loaddata fixtures/superuser.json
python3 manage.py loaddata tests/fixtures/integration.json
python3 manage.py runserver 0.0.0.0:8000
