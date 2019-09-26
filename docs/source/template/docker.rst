Docker command
==============
Database:
---------

Run migrate:

.. code-block:: bash

    $ docker-compose run --rm app ./manage.py migrate

Create migrations:

.. code-block:: bash

    $ docker-compose run --rm app ./manage.py makemigrations users

Install packages:
-----------------

.. code-block:: bash

    $ docker-compose run --rm app pip install requests


Run Jupyter:
------------

.. code-block:: bash

    $ docker-compose run --rm -p 8888:8888 app ./manage.py shell_plus --notebook


Run pudb:
---------

.. code-block:: bash

    $ docker-compose run --rm --service-ports app


Audit Tools:
------------

Base run:

.. code-block:: bash

    $ docker-compose run --rm app pylama

Run audit code with select specific linters:

.. code-block:: bash

    $ docker-compose run --rm app pylama -l pylint

Show Cyclomatic Complexity (CC):

.. code-block:: bash

    $ docker-compose run --rm app radon cc --no-assert --show-closures .

Show Maintainability Index (MI):

.. code-block:: bash

    $ docker-compose run --rm app radon mi -s .

Analyze the given Python modules and compute raw metrics:

.. code-block:: bash

    $ docker-compose run --rm app radon raw -s .


Documentations:
---------------

.. code-block:: bash

    $ docker-compose run --rm app sphinx-build -a -b html -d /docs/build/doctrees /docs/source /docs/build/html
