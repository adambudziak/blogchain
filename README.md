# BlogChain

## Dependencies
* `docker` and `docker-compose`
* something to deploy and test the contracts (e.g. `Truffle`)


To run:
* run `docker-compose up`;
* run `truffle deploy` inside `./bc`;
* if you have a fresh database, you need to manually run the migrations in backend. Also, no
  superuser account is created automatically;

Visit http://localhost:8000


## TODOs

### Features
* allow submitting posts while logged-out (it worked but it doesn't now);
* implement comments, tags and stars;
* allow getting only these posts/comments/stars which have been confirmed by the blockchain;
* implement creating accounts and bind them with the private keys used for txs on blockchain;
* make the frontend pretty;


### Misc
* Add celery so all the logic that is not a part of request handling can be moved there
* prepare UT environment (Django UTs, Frontend UTs), CI;
* add TypeScript to the frontend;
* prepare production-like environment;
* add django-rest-knox for better security;
* improve the development environment by automating the process of finding the addresses of contracts
    (maybe use truffle for this and store them in Redis which will be accessible by the API)
    For the frontend we could use Drizzle, but it won't work in the backend, so we need another
    solution anyway.