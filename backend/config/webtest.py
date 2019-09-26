from rest_framework.compat import authenticate
from rest_framework.authentication import BaseAuthentication


class WebtestAuthentication(BaseAuthentication):
    """
    Auth backend for tests that use webtest with Django Rest Framework.
    """
    header = 'WEBTEST_USER'

    def authenticate(self, request):
        value = request.META.get(self.header)
        if value:
            user = authenticate(django_webtest_user=value)
            if user and user.is_active:
                return user, None
