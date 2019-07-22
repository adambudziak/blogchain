from datetime import datetime, timedelta
import pytz

from django.test import TestCase
from django.contrib.auth.models import User
from django.db.utils import IntegrityError

from ..models import Vote, Post
from ..bc import compute_post_hash, compute_vote_hash

from .utils import post_factory

post_factory = post_factory('Post title', 'Post content')

class TestVoteModel(TestCase):

    def setUp(self):
        User.objects.create_user('admin')
        self.post = post_factory()

        now = datetime.now(pytz.UTC) 
        vote_hash = compute_vote_hash('admin', now, True)
        
        Vote.objects.create(
            author=User.objects.get(username='admin'),
            creation_datetime=now.isoformat(),
            data_hash=vote_hash,
            is_upvote=True,
            post=self.post,
        )

    def test_second_vote_is_forbidden(self):
        now = datetime.now(pytz.UTC)
        vote_hash = compute_vote_hash('admin', now, True)
        with self.assertRaises(IntegrityError):
            Vote.objects.create(
                author=User.objects.get(username='admin'),
                creation_datetime=now.isoformat(),
                data_hash=vote_hash,
                is_upvote=True,
                post=self.post,
            )