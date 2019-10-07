import json
import logging
from collections import namedtuple
from typing import Iterable, Union

import requests
from rest_framework import status
from web3 import Web3

from ..models import Post, Comment, PostVote, CommentVote

CONTRACT_ABI_URL = 'http://nginx:8000/assets/abi/{contract_name}.json'
CONTRACT_ADDRESS_STORE_URL = 'http://nginx:8000/assets/contracts.json'


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

    _Post = namedtuple('_Post', 'hash')
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
        return self.contract.functions.getPostCount().call()

    def get_post(self, index):
        return PostsContract._Post(self.contract.functions.posts(index).call())

    def iter_posts(self):
        """
        Iterate all posts on the blockchain ordered from the newest
        to the oldest.

        Each post is cast to the internal _Post type.

        :return: an iterator over all Posts in the contract.
        """
        for i in reversed(range(self.posts_count())):
            yield self.get_post(i)

    def verify_posts(self, posts: Iterable[Post]):
        """
        Verify an iterable of Posts by checking which of them
        have a confirmation on the blockchain.

        Posts which have been successfully verified are updated
        in the database one-by-one.
        TODO check if it's possible to update them all at once,
             and maybe delegate this back to the celery task.

        TODO make it O(n+m) instead O(n*m)

        :param posts: an iterable of posts to verify.
        :return: The number of positively verified posts.
        """
        verified = 0
        for stored_post in self.iter_posts():
            for post in posts:
                if Web3.toHex(stored_post.hash) == post.data_hash:
                    post.verified = True
                    post.save()
                    verified += 1
        return verified


class CommentsContract:
    name = 'Comments'

    _Comment = namedtuple('_Comment', 'hash, post_hash')
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

    def _get_comment(self, index):
        comment_hash = Web3.toHex(self.contract.functions.comments(index).call())
        _, post_hash = self.contract.functions.hashToComment(comment_hash).call()
        post_hash = Web3.toHex(post_hash)
        return CommentsContract._Comment(comment_hash, post_hash)

    def comments_count(self):
        return self.contract.functions.getCommentCount().call()

    def get_comment(self, index):
        return self._get_comment(index)

    def get_post_balance(self, post_hash):
        return self.contract.functions.totalBalances(post_hash).call()

    def iter_comments(self):
        """
        Iterate all comments on the blockchain ordered from the newest
        to the oldest.

        Each post is cast to the internal _Comment type.

        :return: an iterator over all Posts in the contract.
        """
        for i in reversed(range(self.comments_count())):
            yield self._get_comment(i)

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


class VotesContract:

    _Vote = namedtuple('_Vote', 'hash')

    def __init__(self, contract):
        self.contract = contract

    @classmethod
    def default(cls):
        web3 = default_web3()
        address = get_contract_address(cls.name)
        abi = get_contract_abi(cls.name)
        return cls(web3.eth.contract(abi=abi, address=address))

    def votes_count(self) -> int:
        return self.contract.functions.getVoteCount().call()

    @classmethod
    def get_vote(cls, index: int, contract):
        return cls._Vote(contract.functions.votes(index).call())

    def iter_votes(self):
        for i in reversed(range(self.votes_count())):
            yield self.get_vote(i, self.contract)

    def verify_votes(self, votes: Union[Iterable[PostVote], Iterable[CommentVote]]):
        votes = {v.data_hash: v for v in votes}
        verified = 0

        for stored_vote in self.iter_votes():
            vote_hash = Web3.toHex(stored_vote.hash) 
            if vote_hash in votes:
                votes[vote_hash].verified = True
                votes[vote_hash].save()
                verified += 1

        return verified


class PostVotesContract(VotesContract):
    name = 'PostVotes'


class CommentVotesContract(VotesContract):
    name = 'CommentVotes'
