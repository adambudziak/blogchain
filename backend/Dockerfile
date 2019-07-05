FROM python:3.7.3-slim-stretch

COPY . /app
WORKDIR /app

RUN pip install -r requirements.txt
ENTRYPOINT ["python", "manage.py", "runserver", "backend:8000"]