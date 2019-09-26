#!/usr/bin/env bash
# https://gunicorn-docs.readthedocs.io/en/stable/settings.html

set -o errexit
set -o pipefail
set -o nounset

python /app/manage.py migrate --noinput
python /app/manage.py collectstatic --clear --noinput

/usr/local/bin/gunicorn config.wsgi:application \
        --bind ${GUNICORN_HOST:-0.0.0.0}:${GUNICORN_PORT:-8000} \
        --timeout ${GUNICORN_TIMEOUT:-300} \
        --workers ${GUNICORN_WORKERS:-4} \
        --threads ${GUNICORN_THREADS:-12} \
        --worker-class ${GUNICORN_WORKER_CLASS:-sync} \
        --name blogchain \
        --access-logfile ${GUNICORN_ACCESS_LOGFILE:--} \
        --error-logfile ${GUNICORN_ERROR_LOGFILE:--} \
        --chdir /app
