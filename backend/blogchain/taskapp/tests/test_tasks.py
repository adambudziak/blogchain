from datetime import datetime, timedelta
import pytz

from django.test import TestCase
from unittest.mock import MagicMock, patch
from web3 import Web3

from blogchain.taskapp.tasks import verify_posts, verify_comments

from blogchain.posts.bc.contracts import PostsContract, CommentsContract
from blogchain.posts.tests.utils import make_post_factory, make_comment_factory
from blogchain.posts.models import Post, Comment

post_factory = make_post_factory('Some title', 'Some content')


def mock_contract_function(callback):
    """
    Helper function returning an object that can mock
    any function of a contract.

    The object stores arguments upon instantiation and
    passes them to the callback when the .call method
    is called.

    :param callback: Function to be called when Inner().call() is called
    :return: The Inner class that mocks the function.
    """
    class Inner:
        def __init__(self, *args):
            self.args = args

        def call(self):
            return callback(*self.args)

    return Inner


class TestVerifyPostsTask(TestCase):

    def setUp(self):
        self.now = datetime.now(pytz.UTC)
        self.posts = [post_factory(timestamp=(self.now + timedelta(i))) for i in range(5)]
        self.bc_posts = [
            bytes.fromhex(post.data_hash[2:])
            for post in self.posts
        ]
        self.contract_mock = MagicMock()
        self.contract_mock.functions.getPostCount = mock_contract_function(lambda: len(self.bc_posts))
        self.contract_mock.functions.posts = mock_contract_function(lambda i: self.bc_posts[i])

        self.posts_contract = PostsContract(self.contract_mock)

    @patch('blogchain.taskapp.tasks.PostsContract')
    def test_verify_all_correct(self, mock_posts_contract):
        mock_posts_contract.default = MagicMock(return_value=self.posts_contract)
        verified_count = verify_posts.s().apply().get()
        self.assertEqual(verified_count, len(self.posts))
        self.assertTrue(all(p.verified for p in Post.objects.all()))

    @patch('blogchain.taskapp.tasks.PostsContract')
    def test_verify_one_bad(self, mock_posts_contract):
        self.posts[0].data_hash = Web3.toHex(b'1' * 32)
        self.posts[0].save()

        mock_posts_contract.default = MagicMock(return_value=self.posts_contract)
        verified_count = verify_posts.s().apply().get()
        self.assertEqual(verified_count, len(self.posts) - 1)
        posts = Post.objects.all()
        self.assertFalse(posts[0].verified)
        self.assertTrue(all(p.verified for p in posts[1:]))


class TestVerifyCommentsTask(TestCase):

    def setUp(self):
        self.post = post_factory()
        self.now = datetime.now(pytz.UTC)
        comment_factory = make_comment_factory(self.post, 'Some comment')
        self.comments = [comment_factory(timestamp=(self.now + timedelta(i))) for i in range(5)]
        self.bc_comments = [
            [bytes.fromhex(comment.data_hash[2:]), bytes.fromhex(self.post.data_hash[2:])]
            for comment in self.comments
        ]
        self.hashes = {
            comment.data_hash: bc_comment
            for (comment, bc_comment) in zip(self.comments, self.bc_comments)
        }
        self.contract_mock = MagicMock()
        self.contract_mock.functions.getCommentCount = mock_contract_function(lambda: len(self.bc_comments))
        self.contract_mock.functions.comments = mock_contract_function(lambda i: self.bc_comments[i][0])
        self.contract_mock.functions.hashToComment = mock_contract_function(lambda _hash: self.hashes[_hash])

        self.comments_contract = CommentsContract(self.contract_mock)

    @patch('blogchain.taskapp.tasks.CommentsContract')
    def test_verify_all_correct(self, mock_comments_contract):
        mock_comments_contract.default = MagicMock(return_value=self.comments_contract)
        verified_count = verify_comments.s().apply().get()
        self.assertEqual(verified_count, len(self.comments))
        self.assertTrue(all(c.verified for c in Comment.objects.all()))

    @patch('blogchain.taskapp.tasks.CommentsContract')
    def test_verify_one_bad(self, mock_comments_contract):
        self.comments[0].data_hash = Web3.toHex(b'1' * 32)
        self.comments[0].save()

        mock_comments_contract.default = MagicMock(return_value=self.comments_contract)
        verified_count = verify_comments.s().apply().get()
        self.assertEqual(verified_count, len(self.comments) - 1)
        comments = Comment.objects.all()
        self.assertFalse(comments[0].verified)
        self.assertTrue(all(c.verified for c in comments[1:]))
