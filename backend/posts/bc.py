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
    return Web3.sha3(text=(username + date + str(is_upvote.real))).hex()


def default_web3():
    return Web3(Web3.HTTPProvider('http://ganache:8545'))


def get_contract_abi(contract_name):
    """
    Load the ABI of a contract from a shared static config file.

    :param contract_name: name of the contract whose ABI will be loaded;
    :return dict: representing the ABI of the contract.
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

    :param contract_name: name of the contract whose address will be loaded;
    :return string: address of the contract encoded as hex with a `0x` prefix.
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
    """
    A namedtuple used to give names to the fields of the Posts
    stored on the blockchain.
    """

    def __init__(self, contract):
        """
        A simple wrapper around the PostsContract stored on the blockchain.

        It provides methods for all the accessible functions of the contract
        along with additional utilities.

        :param contract: the internal PostsContract on the blockchain.
        """
        self.contract = contract

    @classmethod
    def default(cls):
        """
        A class method simplifying the process of instantiating PostsContract
        by fetching a default Web3 provider, contract's address and its ABI.

        :return: a PostsContract instance.
        """
        web3 = default_web3()
        address = get_contract_address(cls.name)
        abi = get_contract_abi(cls.name)
        return cls(web3.eth.contract(abi=abi, address=address))

    def posts_count(self):
        return self.contract.functions.getPostsCount().call()

    def get_post(self, index):
        return self.contract.functions.posts(index).call()

    def iter_posts(self):
        """
        Iterate all posts on the blockchain ordered from the newest
        to the oldest.

        Each post is cast to the internal _Post type.

        :return: an iterator over all Posts in the contract.
        """
        for i in reversed(range(self.posts_count())):
            yield PostsContract._Post(*self.get_post(i))

    def verify_posts(self, posts: Iterable[Post]):
        """
        Verify an iterable of Posts by checking which of them
        have a confirmation on the blockchain.

        Posts which have been successfully verified are updated
        in the database one-by-one.
        TODO check if it's possible to update them all at once,
        TODO and maybe delegate this back to the celery task.

        :param posts: an iterable of posts to verify.
        :return: The number of positively verified posts.
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
    """
    A namedtuple used to give names to the fields of the Comments
    stored on the blockchain.
    """

    def __init__(self, contract):
        """
        A simple wrapper around the CommentsContract stored on the blockchain.

        It provides methods for all the accessible functions of the contract
        along with additional utilities.

        This class is analogous to the PostsContract.

        :param contract: the internal CommentsContract on the blockchain.
        """
        self.contract = contract

    @classmethod
    def default(cls):
        """
        A class method simplifying the process of instantiating CommentsContract
        by fetching a default Web3 provider, contract's address and its ABI.

        :return: a CommentsContract instance.
        """
        web3 = default_web3()
        address = get_contract_address(cls.name)
        abi = get_contract_abi(cls.name)
        return cls(web3.eth.contract(abi=abi, address=address))

    def comments_count(self):
        return self.contract.functions.getCommentCount().call()

    def get_comment(self, index):
        return self.contract.functions.comments(index).call()

    def iter_comments(self):
        """
        Iterate all comments on the blockchain ordered from the newest
        to the oldest.

        Each post is cast to the internal _Comment type.

        :return: an iterator over all Posts in the contract.
        """
        for i in reversed(range(self.comments_count())):
            yield CommentsContract._Comment(*map(Web3.toHex, self.get_comment(i)))

    def verify_comments(self, comments: Iterable[Comment]):
        """
        Verify an iterable of Comments by checking which of them
        have a confirmation on the blockchain.

        See PostsContract.verify_posts for more details.

        :param comments: an iterable of comments to verify.
        :return: The number of positively verified comments.
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
