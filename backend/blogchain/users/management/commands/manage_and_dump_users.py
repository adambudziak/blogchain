import pickle

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = 'Manages and dumps users. Command needed for load tests.'

    def add_arguments(self, parser):
        parser.add_argument('-q', '--quantity', type=int, dest='quantity', default=2, help="Number of users to create")
        parser.add_argument('-c', '--create', action='store_true', dest='create', default=False,
                            help="Should create users")
        parser.add_argument('-d', '--delete', action='store_true', dest='delete', default=False,
                            help="Should delete users")
        parser.add_argument('-u', '--username', type=str, dest='username', required=True,
                            help="User username prefix -> prefix[number]")
        parser.add_argument('-e', '--email_domain', type=str, dest='email_domain', required=True,
                            help="Email domain of created user")
        parser.add_argument('-f', '--filename', type=str, dest='filename', required=True,
                            help="Filename to dump users")
        parser.add_argument('-s', '--start_number', type=int, dest='start', required=True,
                            help="Starting number of user to create - this number will be added to username")
        parser.add_argument('--force', action='store_true', dest='force', default=False, help="Force delete users")

    def handle(self, *args, **kwargs):
        username = kwargs['username']
        email_domain = kwargs['email_domain']
        filename = kwargs['filename']
        quantity = kwargs['quantity']
        delete = kwargs.get('delete')
        create = kwargs.get('create')
        force = kwargs.get('force')
        start_number = kwargs['start']

        if delete:
            if not force:
                self.delete_users(filename=filename)
            else:
                self.delete_common_users(username)

        if create:
            self.create_users(username, email_domain, quantity, start_number, filename)

    @classmethod
    def create_user(cls, username: str, email: str, *args, **kwargs) -> dict:
        """
        This function should generate single user with all permissions that are needed by load test testcase.
        Function should return dictionary of single user data that can be pickled. Preferably email, username and
        jwt token
        :param username: user username
        :param email: user email
        :return: user data dictionary of created user
        """
        raise NotImplementedError

    def delete_users(self, filename: str):
        """
        Deletes users that are pickled via this script
        :param filename: filename of pickled user data
        """
        try:
            # load pickled file and delete all users extracted from it
            with open(filename, 'rb') as fp:
                user_data = pickle.load(fp)
        except OSError:
            self.stdout.write(f'{filename}: no such file')
            return

        usernames = []
        for user in user_data:
            usernames.append(user.get('username'))
        User.objects.filter(username__in=usernames).delete()
        self.stdout.write(f'Removed users in bulk')


    def delete_common_users(self, username: str):
        """
        Deletes users whose username starts with given name
        :param username: name
        """
        User.objects.filter(username__startswith=username).delete()
        self.stdout.write('Removed users in bulk with force')

    def create_users(self, username: str, email_domain: str, quantity: int, start_number: int, filename: str):
        """
        Function generates users and pickles them to a file
        :param username: username of test user that will be next followed by test user number
        :param email_domain: domain of user email -> emails will be created such way: username@domain
        :param quantity: number of users to generate
        :param start_number: user starting number
        :param filename: filename to dump user data
        """
        user_data = []

        for number in range(start_number, start_number+quantity):
            _number = f'{number:05d}'  # format number with leading zeros
            _username = f'{username}{_number}'
            _email = f'{_username}@{email_domain}'

            user_data.append(self.create_user(_username, _email))

        # pickle user data
        with open(filename, 'wb') as fp:
            pickle.dump(user_data, fp, protocol=pickle.HIGHEST_PROTOCOL)
        self.stdout.write('Users created')
