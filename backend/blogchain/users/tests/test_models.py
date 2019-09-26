from test_plus.test import TestCase


class TestUser(TestCase):

    def setUp(self):
        self.user = self.make_user()

    def test_string_representation(self):
        self.assertEqual(
            str(self.user),
            'testuser'  # This is the default username for self.make_user()
        )
    
