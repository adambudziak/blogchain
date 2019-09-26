FROM python:3.6.8-slim

# User ID for the django user we're creating. The builder can set this to the
# host user's ID to avoid file permissions problems.
ARG USER_ID=1000

ENV PYTHONUNBUFFERED 1
ENV HOME=/home/django


RUN apt-get -qq update \
    && apt-get -qq -y install libpq-dev gcc vim gettext vim curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get -qq -y clean


# Create the user and group to run the Django application as
RUN addgroup --system --gid $USER_ID django \
    && adduser --system --home $HOME --uid $USER_ID --ingroup django django

COPY ./docker/entrypoint_backend.sh /entrypoint.sh
RUN sed -i 's/\r//' /entrypoint.sh \
    && chmod +x /entrypoint.sh

COPY ./docker/local/backend/start.sh /start.sh
RUN sed -i 's/\r//' /start.sh \
    && chmod +x /start.sh

COPY ./docker/local/backend/celery/worker/start.sh /start-celeryworker.sh
RUN sed -i 's/\r//' /start-celeryworker.sh \
    && chmod +x /start-celeryworker.sh

COPY ./docker/local/backend/celery/beat/start.sh /start-celerybeat.sh
RUN sed -i 's/\r//' /start-celerybeat.sh \
    && chmod +x /start-celerybeat.sh

COPY ./docker/local/backend/celery/flower/start.sh /start-flower.sh
RUN sed -i 's/\r//' /start-flower.sh \
    && chmod +x /start-flower.sh


COPY ./shared/ /app/shared/
COPY ./backend /app
RUN chown -R django /app

USER django
ENV PATH "${PATH}:${PYTHONUSERBASE:-/home/django/.local}/bin"

RUN pip install --no-cache-dir --user -r /app/requirements/local.txt

WORKDIR /app

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/start.sh"]
