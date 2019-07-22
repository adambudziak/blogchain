import os
from datetime import datetime, timedelta
import pytz

from django.test import TestCase
from django.contrib.auth.models import User

from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

from ..views import CommentViewSet
from ..models import Post, Comment
from ..bc import compute_comment_hash, compute_post_hash


class TestCommentViews(TestCase):

    def setUp(self):
        User.objects.create_user('admin')
        self.user = User.objects.get(username='admin')
        self.now = datetime.now()
        self.factory = APIRequestFactory()
        post_date = (self.now - timedelta(1)).isoformat()[:-3]
        post_hash = compute_post_hash('anonymous', post_date, 'Post content', 'Post title')
        Post.objects.create(
            author=None,
            content='Post content',
            title='Post title',
            creation_datetime=(self.now - timedelta(1)).replace(tzinfo=pytz.UTC).isoformat(),
            data_hash=post_hash,
        )
        comment_hash = compute_comment_hash('admin', self.now.isoformat()[:-3], 'Comment content')
        self.comment_data = {
            'content': 'Comment content',
            'creation_datetime': self.now.isoformat(),
            'post': 'http://testserver/api/posts/2/',  # TODO why 2?
            'data_hash': comment_hash,
        }

    def _assert_post_response_status(self, request, status):
        response = CommentViewSet.as_view({'post': 'create'})(request)
        self.assertEqual(response.status_code, status)

    def test_create_comment(self):
        request = self.factory.post('/api/comments/', self.comment_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_201_CREATED)

        stored_hash = self.comment_data['data_hash']
        self.assertEqual(Comment.objects.filter(data_hash=stored_hash).count(), 1)
        stored_comment = Comment.objects.get(data_hash=stored_hash)

        self.assertEqual(stored_comment.content, self.comment_data['content'])
        self.assertEqual(stored_comment.author.username, 'admin')
        self.assertEqual(stored_comment.post.pk, 2)
        self.assertEqual(stored_comment.creation_datetime, self.now.replace(tzinfo=pytz.UTC))

    def test_create_comment_invalid_hash(self):
        comment_hash = compute_comment_hash('admin', self.now.isoformat()[:-3], 'Different content')
        self.comment_data['data_hash'] = comment_hash

        request = self.factory.post('/api/comments/', self.comment_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_400_BAD_REQUEST)

    def test_create_comment_missing_field(self):
        del self.comment_data['creation_datetime']

        request = self.factory.post('/api/comments/', self.comment_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_400_BAD_REQUEST)


