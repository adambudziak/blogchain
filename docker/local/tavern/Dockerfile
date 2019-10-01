FROM python:3.7-slim-buster

RUN apt-get update && apt-get install -yy curl

RUN pip install tavern[pytest]==0.30.3
COPY ./backend /backend
COPY ./docker/local/tavern/run_tavern.sh /app/run_tavern.sh

WORKDIR /backend
ENTRYPOINT /app/run_tavern.sh

