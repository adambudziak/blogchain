Testing
=======

.. code-block:: bash

    $ docker-compose run --rm app ./manage.py test

or

.. code-block:: bash

    $ docker-compose run --rm app pytest .


Coverage:
---------

.. code-block:: bash

    $ docker-compose run --rm app coverage run --source='.' manage.py test
    $ docker-compose run --rm app coverage report
    $ docker-compose run --rm app coverage xml

or

.. code-block:: bash

    $ docker-compose run --rm app pytest --cov-report xml --cov blogchain --verbose


Audit Code:
-----------

.. code-block:: bash

    $ docker-compose run --rm app pytest --pylama
