FROM python:3.7-slim-buster

RUN apt-get update && apt-get install -yy curl

RUN pip install tavern[pytest]
COPY ./backend /backend
COPY ./tavern /app

# in the future we might want test different apis, but for now we'll just run tests for the backend
WORKDIR /backend/tests
ENTRYPOINT /app/run_tavern.sh

