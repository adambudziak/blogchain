from django.urls import reverse, resolve
from test_plus.test import TestCase
from ..views import UserViewSet


class TestUserURLs(TestCase):
    """Test URL patterns for users app."""

    def setUp(self):
        self.user = self.make_user()
    
    def test_users_viewstet_resolve(self):
        found = resolve('/users/')
        assert found.func.cls == UserViewSet

    def test_list_model_resolve(self):
        self.assertEqual(
            reverse('users:user-list'),
            '/users/'
        )

    def test_detail_model_resolve(self):
        self.assertEqual(
            reverse('users:user-detail', kwargs={'pk': 1}),
            '/users/1/'
        )
    
