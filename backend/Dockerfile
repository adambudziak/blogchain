FROM python:3.7.3-slim-stretch

COPY . /app
WORKDIR /app

RUN apt-get update && apt-get -yy install gcc

RUN pip install -r requirements.txt
ENTRYPOINT ["./start.sh"]
# ENTRYPOINT ["gunicorn", "blogchain.wsgi:application", "-w 2", "-b :8000"]