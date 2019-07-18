import os
from datetime import datetime, timedelta
import pytz

from django.test import TestCase
from django.contrib.auth.models import User

from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

from ..views import CommentViewSet, VoteViewSet
from ..models import Post, Comment, Vote
from ..bc import (
    compute_comment_hash,
    compute_post_hash,
    compute_vote_hash
)


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
            'post': 'http://testserver/api/posts/3/',
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
        self.assertEqual(stored_comment.post.pk, 3)
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


class TestVoteViews(TestCase):

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

        vote_hash = compute_vote_hash('admin', self.now.isoformat()[:-3], True)
        self.vote_data = {
            'is_upvote': True,
            'post': '7',
            'creation_datetime': self.now.isoformat(),
            'data_hash': vote_hash
        }

    def _assert_post_response_status(self, request, status):
        response = VoteViewSet.as_view({'post': 'create'})(request)
        self.assertEqual(response.status_code, status)

    def test_create_vote(self):
        request = self.factory.post('/api/votes/', self.vote_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_201_CREATED)
        stored_vote = Vote.objects.get(data_hash=self.vote_data['data_hash'])
        self.assertEqual(stored_vote.is_upvote, True)
        self.assertEqual(stored_vote.author.username, 'admin')
        self.assertEqual(stored_vote.post.pk, 7)
        votes_count = Vote.objects.filter(post=self.vote_data['post'], author__username='admin').count()
        self.assertEqual(votes_count, 1)

    def test_second_vote_is_forbidden(self):
        self.vote_data['post'] = 8
        request = self.factory.post('/api/votes/', self.vote_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_201_CREATED)
        self._assert_post_response_status(request, status.HTTP_400_BAD_REQUEST)
        self.vote_data['is_upvote'] = False
        self._assert_post_response_status(request, status.HTTP_400_BAD_REQUEST)
        votes_count = Vote.objects.filter(post=self.vote_data['post'], author__username='admin').count()
        self.assertEqual(votes_count, 1)