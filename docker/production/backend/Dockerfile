FROM python:3.6.8-slim

ENV PYTHONUNBUFFERED 1


RUN apt-get -qq update \
    && apt-get -qq -y install libpq-dev gcc vim curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get -qq -y clean \
    && addgroup --system django \
    && adduser --system --ingroup django django


COPY ./docker/production/backend/gunicorn.sh /gunicorn.sh
RUN sed -i 's/\r//' /gunicorn.sh \
    && chmod +x /gunicorn.sh \
    && chown django /gunicorn.sh

COPY ./docker/entrypoint_backend.sh /entrypoint.sh
RUN sed -i 's/\r//' /entrypoint.sh \
    && chmod +x /entrypoint.sh \
    && chown django /entrypoint.sh


COPY ./docker/production/backend/celery/worker/start.sh /start-celeryworker.sh
RUN sed -i 's/\r//' /start-celeryworker.sh \
    && chmod +x /start-celeryworker.sh

COPY ./docker/production/backend/celery/beat/start.sh /start-celerybeat.sh
RUN sed -i 's/\r//' /start-celerybeat.sh \
    && chmod +x /start-celerybeat.sh

COPY ./docker/production/backend/celery/flower/start.sh /start-flower.sh
RUN sed -i 's/\r//' /start-flower.sh \
    && chmod +x /start-flower.sh

COPY ./backend/requirements /requirements
RUN pip install --no-cache-dir -r /requirements/production.txt \
    && rm -rf /requirements

COPY ./shared/ /app/shared/
COPY ./backend /app

# Special requirements file for testing production image on CI
RUN diff --changed-group-format='%>' --unchanged-group-format='' /app/requirements/production.txt /app/requirements/tests.txt | tee /production_tests.txt \
    && chown django:django /production_tests.txt

RUN chown -R django /app

USER django

# add directory with locally installed (via `pip install --user django`)
# Python modules to PATH
# https://docs.python.org/3/library/site.html#site.USER_BASE
ENV PATH "${PATH}:${PYTHONUSERBASE:-/home/django/.local}/bin"

WORKDIR /app

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/gunicorn.sh"]
