from blogchain.taskapp.celery import app

from blogchain.posts.models import (
    Post,
    Comment,
    PostVote,
    CommentVote,
)

from blogchain.posts.bc.contracts import (
    PostsContract,
    CommentsContract,
    PostVotesContract,
    CommentVotesContract,
)

import logging


@app.task(name="blogchain.taskapp.tasks.verify_posts", bind=True)
def verify_posts(self):
    posts_to_verify = Post.objects.filter(verified=False)

    posts_contract = PostsContract.default()
    verified = posts_contract.verify_posts(posts_to_verify)

    logging.info('Verified %d posts out of %d.' % (verified, posts_to_verify.count()))
    return verified


@app.task(name="blogchain.taskapp.tasks.verify_comments", bind=True)
def verify_comments(self):
    comments_to_verify = Comment.objects.filter(verified=False)
    comments_contract = CommentsContract.default()
    verified = comments_contract.verify_comments(comments_to_verify)

    logging.info('Verified %d comments out of %d.' % (verified, comments_to_verify.count()))
    return verified


@app.task(name="blogchain.taskapp.tasks.verify_post_votes", bind=True)
def verify_post_votes(self):
    post_votes_to_verify = PostVote.objects.filter(verified=False)
    post_votes_contract = PostVotesContract.default()
    verified = post_votes_contract.verify_votes(post_votes_to_verify)

    logging.info('Verified %d post votes out of %d.' % (verified, post_votes_to_verify.count()))
    return verified


@app.task(name="blogchain.taskapp.tasks.verify_comment_votes", bind=True)
def verify_comment_votes(self):
    comment_votes_to_verify = CommentVote.objects.filter(verified=False)
    comment_votes_contract = CommentVotesContract.default()
    verified = comment_votes_contract.verify_votes(comment_votes_to_verify)

    logging.info('Verified %d comment votes out of %d.' % (verified, comment_votes_to_verify.count()))
    return verified
