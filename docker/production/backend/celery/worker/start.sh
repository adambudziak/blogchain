#!/usr/bin/env bash
# https://docs.celeryproject.org/en/latest/userguide/workers.html

set -o errexit
set -o pipefail
set -o nounset

celery -A blogchain.taskapp worker \
        --loglevel=${CELERY_LEVEL:-INFO} \
        --concurrency=${CELERY_CONCURRENCY:-2}
