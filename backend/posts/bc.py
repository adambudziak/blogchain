import requests
import json
import logging
from collections import namedtuple

from web3 import Web3
from rest_framework import status

from .models import Post, Comment

CONTRACT_ABI_URL = 'http://nginx:8000/assets/abi/{contract_name}.json'
CONTRACT_ADDRESS_STORE_URL = 'http://nginx:8000/assets/contracts.json'


def compute_post_hash(username, date, title, content):
    return Web3.sha3(text=(username + date + title + content)).hex()


def default_web3():
    return Web3(Web3.HTTPProvider('http://ganache:8545'))


def get_contract_abi(contract_name):
    response = requests.get(CONTRACT_ABI_URL.format(contract_name=contract_name))
    return json.loads(response.content)['abi']
    

def get_contract_address(contract_name: str):
    response = requests.get(CONTRACT_ADDRESS_STORE_URL)
    if response.status_code != status.HTTP_200_OK:
        logging.error("Couldn't load contract address for %s. Reason: %s"
                      % (contract_name, response.status_code))
        return
    contracts = json.loads(response.content)
    return contracts.get(contract_name.lower())


class PostsContract:

    Post = namedtuple('Post', 'datetime, data_hash')

    def __init__(self, web3: Web3, abi, address):
        self.contract = web3.eth.contract(abi=abi, address=address)

    def posts_count(self):
        return self.contract.functions.getPostsCount().call()

    def get_post(self, index):
        return self.contract.functions.posts(index).call()

    def verify_post(self, post: Post):
        """
        Verifies that a post was registered on the blockchain.
        """
        posts_count = self.posts_count()
        logging.warn(f'The blockchain contains {posts_count} posts.')
        for post_index in reversed(range(posts_count)):
            stored_post = PostsContract.Post(*self.get_post(post_index))
            if stored_post.data_hash == post.data_hash.tobytes():
                post.verified = True
                post.save()
                return True
        return False


class CommentStoreContract:

    Comment = namedtuple('Comment', 'data_hash, post_hash')

    def __init__(self, web3: Web3, abi, address):
        self.contract = web3.eth.contract(abi=abi, address=address)

    def comments_count(self):
        return self.contract.functions.getCommentCount().call()

    def get_comment(self, index):
        return self.contract.functions.comments(index).call()

    def verify_comment(self, comment: Comment, post: Post):
        comments_count = self.comments_count()
        comment = CommentStoreContract.Comment(comment.data_hash, comment.post_hash)
        for comment_index in reversed(range(comments_count)):
            stored_comment = CommentStoreContract.Comment(*self.get_comment(comment_index))
            if stored_comment == comment:
                comment.verified = True
                comment.save()
                break