from taskapp.celery import app

from posts.models import (
    Post,
    Comment,
)
from posts.bc import (
    default_web3,
    get_contract_abi,
    get_contract_address,
    PostsContract,
    CommentsContract,
)

import logging


@app.task(bind=True)
def verify_posts(self):
    posts_to_verify = Post.objects.filter(verified=False)
    web3 = default_web3()
    posts_address = get_contract_address(PostsContract.name)
    posts_abi = get_contract_abi(PostsContract.name)
    posts_contract = PostsContract(web3, posts_abi, posts_address)
    verified = posts_contract.verify_posts(posts_to_verify)

    logging.info('Verified %d posts out of %d.' % (verified, posts_to_verify.count()))


@app.task(bind=True)
def verify_comments(self):
    comments_to_verify = Comment.objects.filter(verified=False)
    web3 = default_web3()
    comments_address = get_contract_address(CommentsContract.name)
    comments_abi = get_contract_abi(CommentsContract.name)
    comments_contract = CommentsContract(web3, comments_abi, comments_address)
    verified = comments_contract.verify_comments(comments_to_verify)

    logging.info('Verified %d comments out of %d.' % (verified, comments_to_verify.count()))