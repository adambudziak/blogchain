import logging

log = logging.getLogger(__name__)


class UserApiMixin:

    def on_stop(self) -> None:
        """
        On stop test should logout user, if credential is assigned to user
        """
        if self.parent.AUTH and self.credential:
            self.logout()

    def login(self) -> bool:
        """
        Login is just a method that takes a credential ( preferably a token ) from list and assign to hatched user
        :return:
        """
        try:
            self.credential = self.parent.CREDENTIALS.pop()  # take credential from list from parent
            return True
        except IndexError:
            self.credential = None
            log.debug('No available credentials')  # no available credentials, close and wait for respawn
            return False

    def logout(self) -> None:
        """
        Method should returns user credential to credentials pool
        :return:
        """
        self.parent.CREDENTIALS.append(self.credential)  # return credential to pool
        self.credential = None


class TestCaseBase:

    def test_flow(self) -> None:
        """
        This method should implement load test case flow
        """
        raise NotImplementedError
