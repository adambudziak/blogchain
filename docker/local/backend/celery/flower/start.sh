#!/usr/bin/env bash

set -o errexit
set -o nounset


celery flower \
    --app=blogchain.taskapp \
    --broker="${CELERY_BROKER_URL}"
