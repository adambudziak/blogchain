from datetime import datetime
import pytz

from ..models import Post, Comment
from ..bc import compute_post_hash, compute_comment_hash


def post_factory(title, content):
    def inner(author=None, timestamp: datetime=None):
        timestamp = timestamp or datetime.now(pytz.UTC)
        author_name = author or 'anonymous'
        post_hash = compute_post_hash(author_name, timestamp, title, content)
        return Post.objects.create(
            author=author,
            content=content,
            title=title,
            creation_datetime=timestamp,
            data_hash=post_hash,
        )
    return inner


def comment_factory(post, content):
    def inner(author=None, timestamp: datetime=None):
        timestamp = timestamp or datetime.now(pytz.UTC)
        author_name = author or 'anonymous'
        comment_hash = compute_comment_hash(author_name, timestamp, content)
        return Comment.objects.create(
            author=author,
            content=content,
            post=post,
            creation_datetime=timestamp,
            data_hash=comment_hash,
        )
    return inner


def model_to_dict(model, dict_schema):
    return {k: getattr(model, k) for k in dict_schema}