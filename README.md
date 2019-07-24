# BlogChain

## Dependencies
* `docker` and `docker-compose`


To run: `docker-compose up`.

Visit http://localhost:8000

By default, the application creates a superuser account `admin` with password `admin`.

## Testing

Currently, only the backend and Solidity contracts have glimpses of tests. To run them, use
`docker-compose -f docker-compose.tests.yml up`

## TODOs

### Features
* implement tags;
* allow getting only these posts/comments/stars which have been confirmed by the blockchain;
* implement creating accounts and bind them with the private keys used for txs on blockchain;
* make the frontend pretty;


### Misc
* prepare Frontend UTs, CI;
* add TypeScript to the frontend;
* prepare production-like environment;
* add django-rest-knox for better security;
