FROM node:12.9-slim

RUN apt-get update && apt-get install -yy git python make g++

COPY --chown=node ./frontend /app
WORKDIR /app

USER node

RUN npm install

ENTRYPOINT [ "npm", "start" ]
