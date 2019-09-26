from unittest.mock import patch

from rest_framework.test import force_authenticate, APIRequestFactory
from rest_framework import status

from test_plus.test import TestCase

from .factories import UserFactory
from .. import views, serializers


class BaseUserTestCase(TestCase):

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin_user = UserFactory.build(is_superuser=True, is_active=True)
        self.view = views.UserViewSet



class TestUserViewSet(BaseUserTestCase):

    def test_serializer_list_of_users(self):
        view = self.view.as_view({'get': 'list'})

        users = UserFactory.build_batch(5)
        views.UserViewSet.queryset = users
        request = self.factory.get('/users/')
        force_authenticate(request, user=self.admin_user)
        response = view(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("count"), len(users))
        self.assertEqual(response.data.get("results"), serializers.UserSerializer(users, many=True).data)

    @patch.object(views.UserViewSet, 'get_object')
    def test_serializer_detail_of_users(self, mock_views):
        view = self.view.as_view({'get': 'retrieve'})

        mock_views.return_value = self.admin_user
        request = self.factory.get('/users/1/')
        force_authenticate(request, user=self.admin_user)
        response = view(request, pk=1)

        self.assertTrue(mock_views.called)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            serializers.UserSerializer(self.admin_user).data
        )

