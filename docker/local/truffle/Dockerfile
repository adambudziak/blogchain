FROM node:12.9-slim

RUN npm install -g truffle

RUN mkdir /assets && chown -R 1000:1000 /assets

COPY --chown=node ./truffle /app
WORKDIR /app

USER node

ENTRYPOINT ["truffle", "deploy"]
