from datetime import datetime

import pytz
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from .utils import make_post_factory, make_comment_factory, model_to_dict
from ..bc import (
    compute_comment_hash,
    compute_post_hash,
    compute_vote_hash
)
from ..models import Post, Comment, PostVote, CommentVote
from ..views.posts import PostViewSet, CommentViewSet
from ..views.votes import post_votes, comment_votes

post_factory = make_post_factory('Post title', 'Post content')


class TestPostViews(TestCase):

    def setUp(self):
        self.user = User.objects.create_user('admin')
        self.factory = APIRequestFactory()

        now = datetime.now(pytz.UTC)
        title = 'New post'
        content = 'Some content'
        post_hash = compute_post_hash('admin', now, title, content)

        self.post_data = {
            'title': title,
            'content': content,
            'data_hash': post_hash,
            'creation_datetime': now
        }

    def test_create_post(self):
        request = self.factory.post('/api/posts/', self.post_data)
        force_authenticate(request, user=self.user)
        response = PostViewSet.as_view({'post': 'create'})(request)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        stored_post = Post.objects.get(data_hash=self.post_data['data_hash'])
        expected_post = {
            **self.post_data,
            'author': self.user,
        }
        self.assertEqual(expected_post,
                         model_to_dict(stored_post, expected_post))

    def test_create_post_unauthenticated(self):
        self.post_data['data_hash'] = compute_post_hash(
            'anonymous',
            self.post_data['creation_datetime'],
            self.post_data['title'],
            self.post_data['content'])
        request = self.factory.post('/api/posts/', self.post_data)
        response = PostViewSet.as_view({'post': 'create'})(request)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        stored_post = Post.objects.get(data_hash=self.post_data['data_hash'])
        expected_post = {
            **self.post_data,
            'author': None
        }
        self.assertEqual(expected_post,
                         model_to_dict(stored_post, expected_post))


class TestCommentViews(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('admin')
        self.factory = APIRequestFactory()
        self.post = post_factory()

        self.now = datetime.now(pytz.UTC)
        comment_hash = compute_comment_hash('admin', self.now, 'Comment content')
        self.comment_data = {
            'content': 'Comment content',
            'creation_datetime': self.now,
            'post': 'http://testserver/api/posts/1/',
            'data_hash': comment_hash,
        }

    def _assert_post_response_status(self, request, status):
        response = CommentViewSet.as_view({'post': 'create'})(request)
        self.assertEqual(response.status_code, status)

    def test_create_comment(self):
        request = self.factory.post('/api/comments/', self.comment_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_201_CREATED)

        stored_comment = Comment.objects.get(data_hash=self.comment_data['data_hash'])

        expected_comment = {
            **self.comment_data,
            'post': self.post,
            'author': self.user,
        }

        self.assertEqual(expected_comment,
                         model_to_dict(stored_comment, expected_comment))

    def test_create_comment_unauthenticated(self):
        self.comment_data['data_hash'] = compute_comment_hash(
            'anonymous',
            self.now,
            self.comment_data['content']
        )
        request = self.factory.post('/api/comments/', self.comment_data)
        self._assert_post_response_status(request, status.HTTP_201_CREATED)

        stored_comment = Comment.objects.get(data_hash=self.comment_data['data_hash'])

        expected_comment = {
            **self.comment_data,
            'post': self.post,
            'author': None
        }

        self.assertEqual(expected_comment,
                         model_to_dict(stored_comment, expected_comment))

    def test_create_comment_invalid_hash(self):
        comment_hash = compute_comment_hash('admin', self.now, 'Different content')
        self.comment_data['data_hash'] = comment_hash

        request = self.factory.post('/api/comments/', self.comment_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_400_BAD_REQUEST)

    def test_create_comment_missing_field(self):
        del self.comment_data['creation_datetime']

        request = self.factory.post('/api/comments/', self.comment_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_400_BAD_REQUEST)


class TestPostVoteViews(TestCase):

    url = '/api/posts/1/votes'

    def setUp(self):
        self.user = User.objects.create_user('admin')
        self.factory = APIRequestFactory()

        self.post = post_factory()

        self.now = datetime.now(pytz.UTC)

        vote_hash = compute_vote_hash('admin', self.now, True)
        self.vote_data = {
            'is_upvote': True,
            'post': '1',
            'creation_datetime': self.now,
            'data_hash': vote_hash
        }

    def _assert_post_response_status(self, request, status_):
        response = post_votes(request, post_pk=1, vote_type='up')
        self.assertEqual(response.status_code, status_)

    def test_create_vote(self):
        request = self.factory.post(self.url, self.vote_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_201_CREATED)

        stored_vote = PostVote.objects.get(data_hash=self.vote_data['data_hash'])
        expected_vote = {
            **self.vote_data,
            'post': self.post,
            'author': self.user
        }
        self.assertEqual(expected_vote, model_to_dict(stored_vote, expected_vote))

    def test_create_vote_anonymously(self):
        # TODO it is not yet supported as we're not sure what's the best approach
        #      to handle this. If we want to allow anonymous voting, then limiting
        #      the number of votes for a logged-in user may not make much sense.
        self.vote_data['data_hash'] = compute_vote_hash(
            'anonymous',
            self.now,
            True
        )
        request = self.factory.post(self.url, self.vote_data)
        self._assert_post_response_status(request, status.HTTP_401_UNAUTHORIZED)

    def test_second_vote_is_forbidden(self):
        request = self.factory.post(self.url, self.vote_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_201_CREATED)
        self._assert_post_response_status(request, status.HTTP_400_BAD_REQUEST)

        # sending a downvote is also not possible
        self.vote_data['is_upvote'] = False
        self._assert_post_response_status(request, status.HTTP_400_BAD_REQUEST)
        votes_count = PostVote.objects.filter(post=self.vote_data['post'],
                                              author__username='admin').count()
        self.assertEqual(votes_count, 1)


class TestCommentVoteViews(TestCase):

    url = '/api/comments/1/votes'

    def setUp(self):
        self.user = User.objects.create_user('admin')
        self.factory = APIRequestFactory()

        self.post = post_factory()
        comment_factory = make_comment_factory(self.post, 'Some comment')
        self.comment = comment_factory()

        self.now = datetime.now(pytz.UTC)

        vote_hash = compute_vote_hash('admin', self.now, True)
        self.vote_data = {
            'is_upvote': True,
            'comment': 1,
            'creation_datetime': self.now,
            'data_hash': vote_hash
        }

    def _assert_post_response_status(self, request, status_):
        response = comment_votes(request, comment_pk=1, vote_type='up')
        self.assertEqual(response.status_code, status_)

    def test_create_vote(self):
        request = self.factory.post(self.url, self.vote_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_201_CREATED)

        stored_vote = CommentVote.objects.get(data_hash=self.vote_data['data_hash'])
        expected_vote = {
            **self.vote_data,
            'comment': self.comment,
            'author': self.user
        }
        self.assertEqual(expected_vote, model_to_dict(stored_vote, expected_vote))

    def test_create_vote_anonymously(self):
        # TODO it is not yet supported as we're not sure what's the best approach
        #      to handle this. If we want to allow anonymous voting, then limiting
        #      the number of votes for a logged-in user may not make much sense.
        self.vote_data['data_hash'] = compute_vote_hash(
            'anonymous',
            self.now,
            True
        )
        request = self.factory.post(self.url, self.vote_data)
        self._assert_post_response_status(request, status.HTTP_401_UNAUTHORIZED)

    def test_second_vote_is_forbidden(self):
        request = self.factory.post(self.url, self.vote_data)
        force_authenticate(request, user=self.user)
        self._assert_post_response_status(request, status.HTTP_201_CREATED)
        self._assert_post_response_status(request, status.HTTP_400_BAD_REQUEST)

        # sending a downvote is also not possible
        self.vote_data['is_upvote'] = False
        self._assert_post_response_status(request, status.HTTP_400_BAD_REQUEST)
        votes_count = CommentVote.objects.filter(comment=self.vote_data['comment'],
                                                 author__username='admin').count()
        self.assertEqual(votes_count, 1)
