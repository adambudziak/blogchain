from datetime import datetime
import pytz

from ..models import Post, Comment, PostVote, CommentVote
from ..bc.hash import compute_post_hash, compute_comment_hash, compute_vote_hash


def make_post_factory(title, content):
    """
    Factory returning a function that makes the process of creating
    a new instance of a Post easier.

    Used mostly for testing.

    It assumes that all posts have the same title and content
    (this is usually the case while testing).

    The new instances are immediately saved in the database.

    :param title: Post title used for all generated posts.
    :param content: Post content used for all generated posts.
    :return: Function taking an author and a timestamp of a post and
             returning a Post instance.
    """
    def inner(author=None, timestamp: datetime=None):
        timestamp = timestamp or datetime.now(pytz.UTC)
        author_name = author.username if author else 'anonymous'
        post_hash = compute_post_hash(author_name, timestamp, title, content)
        return Post.objects.create(
            author=author,
            content=content,
            title=title,
            creation_datetime=timestamp,
            data_hash=post_hash,
        )
    return inner


def make_comment_factory(post, content):
    """
    Factory analogous to `post_factory`.

    :param post: Post used for all generated comments.
    :param content: Comment content used for all generated comments.
    :return: Function taking an author and a timestamp of a comment
             and returning a Comment instance.
    """
    def inner(author=None, timestamp: datetime=None):
        timestamp = timestamp or datetime.now(pytz.UTC)
        author_name = author.username if author else 'anonymous'
        comment_hash = compute_comment_hash(author_name, timestamp, content)
        return Comment.objects.create(
            author=author,
            content=content,
            post=post,
            creation_datetime=timestamp,
            data_hash=comment_hash,
        )
    return inner


def make_vote_factory(target, is_upvote):
    def inner(author=None, timestamp: datetime = None):
        author_name = author.username if author else 'anonymous'
        vote_hash = compute_vote_hash(author_name, timestamp, is_upvote)
        if isinstance(target, Post):
            return PostVote.objects.create(
                author=author,
                is_upvote=is_upvote,
                creation_datetime=timestamp,
                post=target,
                data_hash=vote_hash
            )
        else:
            return CommentVote.objects.create(
                author=author,
                is_upvote=is_upvote,
                creation_datetime=timestamp,
                comment=target,
                data_hash=vote_hash
            )
    return inner


def model_to_dict(model, keys):
    """
    Utility function that transforms an instance of a django model
    into a dictionary by getting attributes listed in the keys iterable.

    It is used mostly for testing.

    :param model: An instance whose attributes will be taken.
    :param keys: A list of names of the attributes to take.
    :return: Dictionary mapping all the keys in the `keys` parameter to
             the values of the attributes in the model.
    """
    return {k: getattr(model, k) for k in keys}
