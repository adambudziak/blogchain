FROM python:3.7.3-slim-stretch

RUN apt-get update && apt-get -yy install gcc curl

RUN useradd -m django
USER django
ENV PATH "${PATH}:/home/django/.local/bin"

COPY --chown=django:django . /app

WORKDIR /app

RUN pip install --user -r requirements.txt

ENTRYPOINT ["./start.sh"]
