from taskapp.celery import app

from posts.models import (
    Post,
    Comment,
)
from posts.bc import (
    PostsContract,
    CommentsContract,
)

import logging


@app.task(bind=True)
def verify_posts(self):
    posts_to_verify = Post.objects.filter(verified=False)

    posts_contract = PostsContract.default()
    verified = posts_contract.verify_posts(posts_to_verify)

    logging.info('Verified %d posts out of %d.' % (verified, posts_to_verify.count()))
    return verified


@app.task(bind=True)
def verify_comments(self):
    comments_to_verify = Comment.objects.filter(verified=False)
    comments_contract = CommentsContract.default()
    verified = comments_contract.verify_comments(comments_to_verify)

    logging.info('Verified %d comments out of %d.' % (verified, comments_to_verify.count()))
    return verified
