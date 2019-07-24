#!/bin/bash

celery flower \
    --app=taskapp \
    --broker="${CELERY_BROKER_URL}"
