from datetime import datetime, timedelta
import pytz

from django.test import TestCase
from django.contrib.auth.models import User
from django.db.utils import IntegrityError

from ..models import Vote, Post
from ..bc import compute_post_hash, compute_vote_hash


class TestVoteModel(TestCase):

    def setUp(self):
        User.objects.create_user('admin')
        now = datetime.now(pytz.UTC) 
        post_date = (now - timedelta(1)).isoformat()
        post_title = 'Post title'
        post_content = 'Post content'
        post_hash = compute_post_hash('anonymous', post_date, post_title, post_content)
        Post.objects.create(
            author=None,
            title=post_title,
            content=post_content,
            creation_datetime=post_date,
            data_hash=post_hash,
        )

        vote_hash = compute_vote_hash('admin', now.isoformat(), True)
        
        Vote.objects.create(
            author=User.objects.get(username='admin'),
            creation_datetime=now.isoformat(),
            data_hash=vote_hash,
            is_upvote=True,
            post=Post.objects.first(),
        )

    def test_second_vote_is_forbidden(self):
        now = datetime.now(pytz.UTC)
        vote_hash = compute_vote_hash('admin', now.isoformat(), True)
        with self.assertRaises(IntegrityError):
            Vote.objects.create(
                author=User.objects.get(username='admin'),
                creation_datetime=now.isoformat(),
                data_hash=vote_hash,
                is_upvote=True,
                post=Post.objects.first(),
            )