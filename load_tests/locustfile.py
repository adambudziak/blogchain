import os

from locust import HttpLocust, TaskSet, task
from locust.exception import LocustError

from load_tests.client import LoadTestClient
from load_tests.utils import ErrorResponse, load_users_credentials
from load_tests.mixins import TestCaseBase, UserApiMixin


class LoadTestTaskSet(TestCaseBase, UserApiMixin, TaskSet):


    @task
    def main_task(self):

        # login user
        if self.parent.AUTH and not self.login():
            return

        try:
            # executes main flow
            self.test_flow()

        except ErrorResponse:
            # handling error response

            # if any error happens, should logout user and wait for respawn
            if self.parent.AUTH:
                self.logout()
            return
        except Exception:
            # handling unexpected error

            # if any error happens, should logout user and wait for respawn
            if self.parent.AUTH:
                self.logout()
            raise

        # after whole test case flow, user should logout
        if self.parent.AUTH:
            self.logout()


class LoadTests(HttpLocust):

    def __init__(self):
        super(HttpLocust, self).__init__()
        if self.host is None:
            raise LocustError(
                "You must specify the base host. "
                "Either in the host attribute in the Locust class, or on the command line using the --host option."
            )

        self.client = LoadTestClient(base_url=self.host)  # override normal client class with our extended one

    AUTH, CREDENTIALS = load_users_credentials()  # load user credentials from user dump file
    task_set = LoadTestTaskSet  # our class with test case
    min_wait = int(os.environ.get('LOAD_TEST_MIN_WAIT', default=5000))
    max_wait = int(os.environ.get('LOAD_TEST_MAX_WAIT', default=9000))
