# System load tests

To launch load tests you need to have `locustio` python package installed.

## Getting Started

### Running tests integrated with api

#### Preparation

Before launching load tests make sure that you have prepared pickled file
with user data.

To generate user data file run:
```bash
python manage.py manage_and_dump_users -u $USERNAME -e $DOMAIN -f $FILENAME -s $START_NUMBER -q $QUANTITY -c -d
```

where:
* USERNAME -> is user username -> script will create users consequently: USERNAME_00001, USERNAME_00002
* START_NUMBER -> is a start_number that will be embeded into username and email
* DOMAIN  -> is a user email domain -> script will create email in such way $USERNAME@$DOMAIN
* FILENAME -> is a dump filename
* QUANTITY -> is a number of users to generate
* -c -> is a flag that will create users
* -d -> is a flag that will delete users based on user dump file
* --force -> is a flag that will remove users started with $USERNAME


#### Launching tests

In order to simply launch load tests just type:
```bash
python -m load_tests.launcher -f load_tests/locustfile.py -H $HOST_ADDRESS
```

Launching tests on remote machine is recommended with `nohup` since they can be run in background after 
closing ssh connection.

```bash
nohup python -m load_tests.launcher -f load_tests/locustfile.py -H $HOST_ADDRESS &
```

After launching load tests you can check out `http://localhost:8089` to
start hatching fake load users.


#### User authentication

User authentication during load tests is based on generated user credentials.
These credentials are loaded into a pool (list) for hatched users to take and return as their work is done.

Such user pops from pool single credentials, run test flow and than returns back to pool this credentials so
next user can use it.


#### Implementing test flow

To implement test case flow just implement test_flow method in TestCaseMixin.
All API calls should be done via self.client http methods such as: 

```python
self.client.get('/healthz/')
```
