from django.core.management.base import BaseCommand
from blogchain.users.models import User


class Command(BaseCommand):
    help = 'Command for create new user'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            action='store',
            dest='username',
            help='Username for new user',
        )
        parser.add_argument(
            '--email',
            action='store',
            dest='email',
            help='Email for new user',
        )
        parser.add_argument(
            '--password',
            action='store',
            dest='password',
            help='Password for new user',
        )

    def handle(self, *args, **options):
        exist = User.objects.filter(email=options['email']).exists()
        if not exist:
            User.objects.create_superuser(options['username'], options['email'], options['password'])
            print('User ', options['email'], ' was created.')
        else:
            print('User ', options['email'], ' exist.')
