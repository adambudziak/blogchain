import requests
import json
from collections import namedtuple
from typing import Iterable
from datetime import datetime
import logging

from web3 import Web3
from rest_framework import status

from .models import Post, Comment


CONTRACT_ABI_URL = 'http://nginx:8000/assets/abi/{contract_name}.json'
CONTRACT_ADDRESS_STORE_URL = 'http://nginx:8000/assets/contracts.json'


def compute_post_hash(username, date: datetime, title, content):
    date = date.replace(tzinfo=None).isoformat()[:-3]
    return Web3.sha3(text=(username + date + title + content)).hex()


def compute_comment_hash(username, date: datetime, content):
    date = date.replace(tzinfo=None).isoformat()[:-3]
    return Web3.sha3(text=(username + date + content)).hex()


def compute_vote_hash(username, date: datetime, is_upvote):
    date = date.replace(tzinfo=None).isoformat()[:-3]
    is_upvote = '1' if is_upvote else '0'
    return Web3.sha3(text=(username + date + is_upvote)).hex()


def default_web3():
    return Web3(Web3.HTTPProvider('http://ganache:8545'))


def get_contract_abi(contract_name):
    """
    Load the ABI of a contract form a shared static config file.
    """
    response = requests.get(CONTRACT_ABI_URL.format(contract_name=contract_name))
    if response.status_code != status.HTTP_200_OK:
        logging.error("Couldn't load contract ABI for %s. Response code %s, %s"
                      % (contract_name, response.status_code, response.data))
        return
    return json.loads(response.content)['abi']
    

def get_contract_address(contract_name: str):
    """
    Load the address of a contract from a shared static config file.
    """
    response = requests.get(CONTRACT_ADDRESS_STORE_URL)
    if response.status_code != status.HTTP_200_OK:
        logging.error("Couldn't load contract address for %s. Response code %s, %s"
                      % (contract_name, response.status_code, response.data))
        return
    contracts = json.loads(response.content)
    return contracts[contract_name]


class PostsContract:
    name = 'Posts'

    _Post = namedtuple('Post', 'datetime, data_hash')

    def __init__(self, web3: Web3, abi, address):
        self.contract = web3.eth.contract(abi=abi, address=address)

    @classmethod
    def default(cls):
        web3 = default_web3()
        address = get_contract_address(cls.name)
        abi = get_contract_abi(cls.name)
        return cls(web3, abi, address)


    def posts_count(self):
        return self.contract.functions.getPostsCount().call()

    def get_post(self, index):
        return self.contract.functions.posts(index).call()

    def iter_posts(self):
        for i in reversed(range(self.posts_count())):
            yield PostsContract._Post(*self.get_post(i))

    def verify_posts(self, posts: Iterable[Post]):
        """
        Takes an iterable of unverified posts and checks whether any
        of them has a proof on the blockchain.
        """
        verified = 0
        for stored_post in self.iter_posts():
            for post in posts:
                if Web3.toHex(stored_post.data_hash) == post.data_hash:
                    post.verified = True
                    post.save()
                    verified += 1
        return verified


class CommentsContract:
    name = 'Comments'

    _Comment = namedtuple('Comment', 'data_hash, post_hash')

    def __init__(self, web3: Web3, abi, address):
        self.contract = web3.eth.contract(abi=abi, address=address)

    @classmethod
    def default(cls):
        web3 = default_web3()
        address = get_contract_address(cls.name)
        abi = get_contract_abi(cls.name)
        return cls(web3, abi, address)


    def comments_count(self):
        return self.contract.functions.getCommentCount().call()

    def get_comment(self, index):
        return self.contract.functions.comments(index).call()

    def iter_comments(self):
        """
        Returns an iterator over all comments on the blockchain
        ordered from the newest to the oldest.
        """
        for i in reversed(range(self.comments_count())):
            yield CommentsContract._Comment(*map(Web3.toHex, self.get_comment(i)))

    def verify_comments(self, comments: Iterable[Comment]):
        """
        Takes an iterable of unverified comments and checks whether any
        of them has a proof on the blockchain.
        """
        verified = 0
        for stored_comment in self.iter_comments():
            for comment in comments:
                parsed_comment = CommentsContract._Comment(comment.data_hash,
                                                           comment.post.data_hash)
                if stored_comment == parsed_comment:
                    comment.verified = True
                    comment.save()
                    verified += 1
                    break
        return verified