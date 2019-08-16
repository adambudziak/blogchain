import os
import logging
import base64
import pytz
from datetime import datetime, timedelta

from django.test import TestCase
from django.contrib.auth.models import User

from ..bc import compute_comment_hash, compute_post_hash, compute_vote_hash
from ..serializers import PostSerializer, CommentSerializer, PostVoteSerializer
from ..models import Post, Comment, PostVote

from .utils import make_post_factory, model_to_dict

post_factory = make_post_factory('Post title', 'Post content')


class TestCommentSerializer(TestCase):
    
    def setUp(self):
        self.serializer = CommentSerializer
        post = post_factory()
        now = datetime.now(pytz.UTC)
        comment_content = 'Some text'
        comment_hash = compute_comment_hash('anonymous', now, comment_content)

        self.comment = Comment.objects.create(
            author=None,
            content=comment_content,
            creation_datetime=now,
            post=post,
            data_hash=comment_hash,
        )

    def test_serialize(self):
        serialized = self.serializer(self.comment, context={
            'request': None
        }).data
        expected_date = self.comment.creation_datetime.isoformat().replace('+00:00', 'Z')
        expected_comment = {
            **model_to_dict(self.comment,
                            ('id', 'content', 'data_hash', 'verified')),
            'post': '/api/posts/1/',
            'url': '/api/comments/1/',
            'creation_datetime': expected_date,
            'upvotes': 0,
            'downvotes': 0,
        }
        self.assertEqual(serialized, expected_comment)


class TestVoteSerializer(TestCase):

    def setUp(self):
        self.serializer = PostVoteSerializer
        self.post = post_factory()

        now = datetime.now(pytz.UTC)
        vote_hash = compute_vote_hash('admin', now, True)
        self.user = User.objects.create_user('admin', password=None)

        PostVote.objects.create(
            author=User.objects.get(username='admin'),
            is_upvote=True,
            post=self.post,
            data_hash=vote_hash,
            creation_datetime=now.isoformat()
        )

    def test_serialize(self):
        vote = PostVote.objects.first()
        serialized = self.serializer(PostVote.objects.first(), context={
            'request': None
        }).data
        expected_date = vote.creation_datetime.isoformat().replace('+00:00', 'Z')
        self.assertEqual(serialized, {
            'id': 1,
            'post': 1,
            'author': 'admin',
            'creation_datetime': expected_date,
            'is_upvote': True,
            'data_hash': vote.data_hash,
        })
