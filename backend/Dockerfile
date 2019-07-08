FROM python:3.7.3-slim-stretch

COPY . /app
WORKDIR /app

RUN pip install -r requirements.txt
ENTRYPOINT ["python", "manage.py", "runserver", "0.0.0.0:8000"]
# ENTRYPOINT ["gunicorn", "blogchain.wsgi:application", "-w 2", "-b :8000"]