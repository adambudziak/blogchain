from datetime import datetime

from web3 import Web3


def compute_post_hash(username, date: datetime, title, content):
    date = date.replace(tzinfo=None).isoformat()[:-3]
    return Web3.sha3(text=(username + date + title + content)).hex()


def compute_comment_hash(username, date: datetime, content):
    date = date.replace(tzinfo=None).isoformat()[:-3]
    return Web3.sha3(text=(username + date + content)).hex()


def compute_vote_hash(username, date: datetime, is_upvote):
    date = date.replace(tzinfo=None).isoformat()[:-3]
    return Web3.sha3(text=(username + date + str(is_upvote.real))).hex()
