from taskapp.celery import app

from posts.models import Post
from posts.bc import (
    default_web3,
    get_contract_abi,
    get_contract_address,
    PostsContract,
)

import logging


@app.task(bind=True)
def verify_posts(self):
    posts_to_verify = Post.objects.filter(verified=False)
    web3 = default_web3()
    posts_address = get_contract_address('Posts')
    posts_abi = get_contract_abi('Posts')
    posts_contract = PostsContract(web3, posts_abi, posts_address)
    verified_count = 0
    for post in posts_to_verify:
        if posts_contract.verify_post(post):
            verified_count += 1

    logging.info('Verified %d out of %d' % (verified_count, posts_to_verify.count()))