FROM python:3.7-slim-buster

RUN apt-get update && apt-get install -yy curl

RUN pip install tavern[pytest]
COPY ./backend /backend
COPY ./tavern /app

WORKDIR /backend
ENTRYPOINT /app/run_tavern.sh

