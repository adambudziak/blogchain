#!/usr/bin/env bash

set -e

python3 manage.py migrate
python3 manage.py loaddata tests/fixtures/users.json
python3 manage.py loaddata tests/fixtures/posts.json
python3 manage.py loaddata tests/fixtures/comments.json
python3 manage.py runserver 0.0.0.0:8000
