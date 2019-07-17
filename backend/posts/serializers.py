from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Tag, Comment
from .bc import compute_post_hash, compute_comment_hash

import logging
import base64
from datetime import datetime

DATETIME_FORMAT = '%Y-%m-%dT%H:%M:%S.%f'

def _format_datetime_with_millis(_datetime: datetime):
    return _datetime.strftime(DATETIME_FORMAT)[:-3]


class PostSerializer(serializers.HyperlinkedModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    class Meta:
        model = Post
        fields = ('url', 'id', 'creation_datetime', 'author', 'verified',
                  'tags', 'title', 'content', 'data_hash',)
        read_only_fields = ('verified',)

    def validate(self, data):
        """
        Validates whether the request contains a valid hash of the post contents.

        This is used to ensure that the hash was computed properly and can
        be recomputed when necessary.

        When this check passes, the client can safely put his post
        on the BlockChain without a risk of wasting a transaction.

        (Note: we cannot just take the hash the client passes because
               it may be malicious.)
        """

        data_hash = self.context['request'].data['data_hash']  # TODO not sure why it's excluded in data
        author = self.context['request'].user
        author = author.username if isinstance(author, User) else 'anonymous'

        _datetime = _format_datetime_with_millis(data['creation_datetime'])

        computed_hash = compute_post_hash(
            author,
            _datetime,
            data['title'],
            data['content']
            )

        if computed_hash != data_hash:
            raise serializers.ValidationError('The data-hash is invalid.')

        computed_hash = bytes.fromhex(computed_hash[2:])  # remove 0x

        data['data_hash'] = computed_hash
        return data


class CommentSerializer(serializers.HyperlinkedModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ('url', 'id', 'author', 'creation_datetime', 'content', 'data_hash', 'post')
        read_only_fields = ('verified',)

    def validate(self, data):
        """
        Validates whether the request contains a valid hash of the comment contents.

        See PostSerializer.validate for more details.
        """

        data_hash = self.context['request'].data['data_hash']  # TODO not sure why it's excluded in data
        author = self.context['request'].user
        author = author.username if isinstance(author, User) else 'anonymous'

        _datetime = _format_datetime_with_millis(data['creation_datetime'])

        computed_hash = compute_comment_hash(
            author,
            _datetime,
            data['content']
            )

        if computed_hash != data_hash:
            raise serializers.ValidationError('The data-hash is invalid.')

        computed_hash = bytes.fromhex(computed_hash[2:])  # remove 0x

        data['data_hash'] = computed_hash
        return data

class UserSerializer(serializers.HyperlinkedModelSerializer):
    posts = serializers.HyperlinkedRelatedField(many=True, view_name='post-detail', read_only=True)

    class Meta:
        model = User
        fields = ('url', 'id', 'username', 'posts')