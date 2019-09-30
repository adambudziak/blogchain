blogchain
=========

# BlogChain

## Dependencies
* `docker` and `docker-compose`
* 

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
 
 
![Built with Cookiecutter Django https://github.com/pydanny/cookiecutter-django/](https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg)

Settings
--------

Moved to [settings](https://github.com/10clouds/project-template/master/docs/settings.md).


A note for Linux users
----------------------

On Linux, Docker runs as a system daemon with root privileges, and can actively create
files inaccessible to the host user. If you'd like to avoid that, you'll need to create
a docker-compose override file. Run 
```bash
cp docker-compose.override.yml.example docker-compose.override.yml
``` 
and edit the new file, replacing the `USER_ID` value with your current host user id -
 you can obtain it by running ``echo $UID`` in your shell.
 
#### *IMPORTANT*: Don't run compose as root
Your Linux user won't have permission to use docker by default. This can be fixed by
adding them to the `docker` group, as explained in the [official docs](https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user).

Running docker and compose commands with `sudo` will break the setup in this template
and re-introduce file permission problems we've worked hard to avoid. Please don't.
 
Basic Commands
--------------

#### Setting Up Your Users

* To create a **normal user account**, just go to Sign Up and fill out the form. 
Once you submit it, you'll see a "Verify Your E-mail Address" page. Go to your 
console to see a simulated email verification message. Copy the link into your 
browser. Now the user's email should be verified and ready to go.

* To create an **superuser account**, use this command:

```
    $ docker-compose run --rm app ./manage.py createsuperuser
```

For convenience, you can keep your normal user logged in on Chrome and your 
superuser logged in on Firefox (or similar), so that you can see how the site 
behaves for both kinds of users.


#### Test coverage

To run the tests, check your test coverage, and generate an HTML coverage report::

```
    $ docker-compose run --rm app pytest --cov-report html --cov . --verbose
    $ open backend/htmlcov/index.html
```

#### Running tests with py.test

```
  $ docker-compose run --rm app pytest .
```

#### Celery

This app comes with Celery. By default all tasks is run not async.
If you need work local with async you must change `CELERY_ALWAYS_EAGER` on `False`
in `backend/settings/local.py` then all tasks will use `redis`
and docker configurations.
 
```
CELERY_ALWAYS_EAGER = False
```


#### Sentry

Sentry is an error logging aggregator service. You can send email to DevOps 
team and asking about you account and project blogchain.

You must set the DSN url in production.


Deployment
----------

The following details how to deploy this application.


#### Docker

See detailed [project-template Docker documentation](https://github.com/10clouds/project-template/blob/master/docs/developing-locally-docker.md).
