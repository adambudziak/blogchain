import pytest
from datetime import datetime

from posts.bc.hash import compute_post_hash, compute_comment_hash, compute_vote_hash

BASE_DATETIME = datetime.fromisoformat('2019-08-23T08:09:29.381000')


@pytest.mark.parametrize('hash_fn, args, expected_hash', (
    (
        compute_post_hash,
        ('somebody', BASE_DATETIME, 'post title', 'post content'),
        '0xbbbe5c6891eefeffecaedf090cf49a1d0d99d2f1514dc901e322ab0fc07ab95a'
    ),
    (
        compute_comment_hash,
        ('that I', BASE_DATETIME, 'comment content'),
        '0x9ef4c0afc6ed69f0bdb3d18f52627e38f26cb65a7a5eb64ea12da3aa1e11a987'
    ),
    (
        compute_vote_hash,
        ('used to', BASE_DATETIME, True),
        '0xf78f916529b6ca6b19afb40b6eddc52bf9f5984f73929e8f33e08509b7c4fa0d'
    ),
    (
        compute_vote_hash,
        ('know', BASE_DATETIME, False),
        '0x82825eaaa32313104816c6f7bcd56e2a30a8bae139bb18829d8ca9df243f622b'
    )
))
def test_hash_functions(hash_fn, args, expected_hash):
    assert hash_fn(*args) == expected_hash
