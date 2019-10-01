#!/usr/bin/env bash

set -o errexit
set -o pipefail
# todo: turn on after #1295
# set -o nounset


cmd="$@"

# We only want to run pytest with an explicitly set django settings module
PYTEST="pytest --ds ${DJANGO_SETTINGS_MODULE_TEST}"
migrate() {
    python manage.py migrate --noinput
}

collectstatic() {
    python manage.py collectstatic --clear --no-input
}
postgres_ready() {
    python << END
import sys
import psycopg2

try:
    psycopg2.connect(
        dbname="${POSTGRES_DB}",
        user="${POSTGRES_USER}",
        password="${POSTGRES_PASSWORD}",
        host="${POSTGRES_HOST}",
        port="${POSTGRES_PORT}")
except psycopg2.OperationalError:
    sys.exit(-1)

sys.exit(0)
END
}

if [ "$cmd" != "runtest" ]; then
  counter=0
  until postgres_ready; do
    >&2 echo 'PostgreSQL is unavailable (sleeping)...'
    sleep 1
    if [ $counter -gt "60" ]; then
      echo "Can't connect to PostgreSQL. Exiting."
      exit 1
    fi
    counter=$(expr $counter + 1)
  done
fi

>&2 echo 'PostgreSQL is up - continuing...'


case "$cmd" in
    runtest)
        $PYTEST \
            --verbose \
            --ignore=tests
    ;;
    integration)
        python3 manage.py migrate
        python3 manage.py loaddata tests/fixtures/users.json
        python3 manage.py loaddata tests/fixtures/posts.json
        python3 manage.py loaddata tests/fixtures/comments.json
        python3 manage.py runserver 0.0.0.0:8000
    ;;
    runcitest)
        pip install -r /production_tests.txt --user django
        $PYTEST \
            --cov blogchain --cov-report xml \
            --verbose \
            --pylama
    ;;
    
    migrate)
        migrate
    ;;
    collectstatic)
        collectstatic
    ;;
    jupyter)
        python manage.py shell_plus --notebook
    ;;
    builddoc)
        sphinx-build -a -b html -d /docs/build/doctrees /docs/source /docs/build/html
    ;;
    *)
        $cmd  # usage start.sh or gunicorn.sh
    ;;
esac
