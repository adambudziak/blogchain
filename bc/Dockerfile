FROM node:8.16.0-jessie

COPY ./bc /app
WORKDIR /app

RUN mkdir /assets

RUN npm install -g truffle

ENTRYPOINT ["truffle", "deploy"]
