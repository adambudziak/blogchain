# BlogChain

## Dependencies
* `docker` and `docker-compose`


To run: `docker-compose up`.

Visit http://localhost:8000

By default, the application creates a superuser account `admin` with password `admin`.

## TODOs

### Features
* allow submitting posts while logged-out (it worked but it doesn't now);
* implement tags;
* allow getting only these posts/comments/stars which have been confirmed by the blockchain;
* implement creating accounts and bind them with the private keys used for txs on blockchain;
* make the frontend pretty;


### Misc
* prepare UT environment (Django UTs, Frontend UTs), CI;
* add TypeScript to the frontend;
* prepare production-like environment;
* add django-rest-knox for better security;
* improve the development environment by automating the process of finding the addresses of contracts
    (maybe use truffle for this and store them in Redis which will be accessible by the API)
    For the frontend we could use Drizzle, but it won't work in the backend, so we need another
    solution anyway.