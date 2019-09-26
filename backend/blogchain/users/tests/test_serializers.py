from test_plus.test import TestCase

from ..serializers import UserSerializer
from .factories import UserFactory


class TestUserSerializers(TestCase):

    def setUp(self):
        self.serializer = UserSerializer
        self.user = UserFactory.build()

    def test_serialize_data(self):
        self.assertEqual(
            self.serializer(self.user).data,
            {
                'username': self.user.username,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'email': self.user.email
            }
        )

    def test_required_field_in_serializers(self):
        serializer = self.serializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertSetEqual(
            set(serializer.errors),
            {'username'}
        )
