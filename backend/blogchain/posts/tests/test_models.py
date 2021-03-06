from datetime import datetime
import pytz

from django.test import TestCase
from django.db.utils import IntegrityError

from blogchain.posts.models import PostVote
from blogchain.posts.bc.hash import compute_vote_hash
from blogchain.users.models import User

from .utils import make_post_factory

post_factory = make_post_factory('Post title', 'Post content')


class TestVoteModel(TestCase):

    def setUp(self):
        User.objects.create_user('admin')
        self.post = post_factory()

        now = datetime.now(pytz.UTC) 
        vote_hash = compute_vote_hash('admin', now, True)
        
        PostVote.objects.create(
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
            PostVote.objects.create(
                author=User.objects.get(username='admin'),
                creation_datetime=now.isoformat(),
                data_hash=vote_hash,
                is_upvote=True,
                post=self.post,
            )
