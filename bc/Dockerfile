FROM node:8.16.0-jessie

COPY . /app
WORKDIR /app

RUN npm install -g truffle

ENTRYPOINT ["truffle", "deploy"]