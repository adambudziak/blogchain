import os
import logging
import base64
import pytz
from datetime import datetime, timedelta

from django.test import TestCase

from ..bc import compute_comment_hash, compute_post_hash, compute_vote_hash
from ..serializers import PostSerializer, CommentSerializer, VoteSerializer
from ..models import Post, Comment, Vote


class TestCommentSerializer(TestCase):
    
    def setUp(self):
        self.serializer = CommentSerializer

        now = datetime.now(pytz.UTC) 
        post_date = (now - timedelta(1)).isoformat()
        post_title = 'Post title'
        post_content = 'Post content'
        post_hash = compute_post_hash('anonymous', post_date, post_title, post_content)

        Post.objects.create(
            author=None,
            content=post_content,
            title=post_title,
            creation_datetime=post_date,
            data_hash=post_hash,
        )

        comment_content = 'Some text'
        comment_hash = compute_comment_hash('anonymous', now.isoformat(), comment_content)
        Comment.objects.create(
            author=None,
            content=comment_content,
            creation_datetime=now.isoformat(),
            post=Post.objects.first(),
            data_hash=comment_hash,
        )

    def test_serialize(self):
        comment = Comment.objects.first()
        serialized = self.serializer(Comment.objects.first(), context={
            'request': None
        }).data
        expected_date = comment.creation_datetime.isoformat().replace('+00:00', 'Z')
        self.assertEqual(serialized, {
            'url': '/api/comments/1/',
            'id': 1,
            'creation_datetime': expected_date,
            'content': comment.content,
            'data_hash': comment.data_hash,
            'post': '/api/posts/2/',
            'verified': False,
        })


class TestVoteSerializer(TestCase):
    def setUp(self):
        self.serializer = VoteSerializer
        now = datetime.now(pytz.UTC)
        post_date = (now - timedelta(1)).isoformat()
        post_title = 'Post title'
        post_content = 'Post content'
        post_hash = compute_post_hash('anonymous', now.isoformat(), post_title, post_content)

        Post.objects.create(
            author=None,
            content=post_content,
            title=post_title,
            creation_datetime=post_date,
            data_hash=post_hash,
        )
        
        vote_hash = compute_vote_hash('admin', now.isoformat()[:-3])

        Vote.objects.create(
            author='admin',
            is_upvote=True,
            post=Post.objects.first(),
            data_hash=vote_hash,
            creation_datetime=now.isoformat()
        )

    def test_serializer(self):
        pass # TODO this will be done after fixing the test db setup