#!/bin/bash

rm -f './celerybeat.pid'

celery --app=taskapp beat --loglevel=INFO