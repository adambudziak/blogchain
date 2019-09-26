Install
=======

Build Docker images and run Docker in background:

.. code-block:: bash

    $ docker-compose build
    $ docker-compose up -d

Run Django migrations:

.. code-block:: bash

    $ docker-compose run --rm app ./manage.py migrate

You can also view Django logs:

.. code-block:: bash

    $ docker-compose logs -f app
