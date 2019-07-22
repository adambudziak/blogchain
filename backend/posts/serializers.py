from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Tag, Comment
from .bc import compute_post_hash, compute_comment_hash

import base64
from datetime import datetime

# TODO a better solution would be nice
# (the frontend measures the time only to microseconds it seems)
def _format_datetime_with_millis(_datetime: datetime):
    return _datetime.isoformat()[:-3]

# TODO think about a common base class for serializers which need to get
# the data_hash from the request and validate it.


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
        data_hash = data['data_hash']
        author = self.context['request'].user
        author = author.username if isinstance(author, User) else 'anonymous'

        _datetime = _format_datetime_with_millis(data['creation_datetime'].replace(tzinfo=None))

        computed_hash = compute_post_hash(
            author,
            _datetime,
            data['title'],
            data['content']
            )

        if computed_hash != data_hash:
            raise serializers.ValidationError('The data-hash is invalid.')

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
        data_hash = data['data_hash']
        author = self.context['request'].user
        author = author.username if isinstance(author, User) else 'anonymous'

        _datetime = _format_datetime_with_millis(data['creation_datetime'].replace(tzinfo=None))

        computed_hash = compute_comment_hash(
            author,
            _datetime,
            data['content']
            )

        if computed_hash != data_hash:
            raise serializers.ValidationError('The data-hash is invalid.')

        return data

class UserSerializer(serializers.HyperlinkedModelSerializer):
    posts = serializers.HyperlinkedRelatedField(many=True, view_name='post-detail', read_only=True)

    class Meta:
        model = User
        fields = ('url', 'id', 'username', 'posts')