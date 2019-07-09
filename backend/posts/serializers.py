from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Tag, Comment
from .bc import compute_post_hash

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
        fields = ('url', 'id', 'creation_datetime', 'author',
                  'tags', 'title', 'content', 'data_hash')

    def validate(self, data):
        data_hash = self.context['request'].data['data_hash']
        data_hash = base64.b64encode(bytes.fromhex(data_hash)).decode('utf-8')
        author = self.context['request'].user
        if isinstance(author, User):
            author = author.username

        logging.warn('Got user: ' + author)

        _datetime = _format_datetime_with_millis(data['creation_datetime'])
        digest = _datetime + author + data['title'] + data['content']
        logging.warn('Digest: X' + digest + 'X')

        computed_hash = base64.b64encode(compute_post_hash(
            author,
            _datetime,
            data['title'],
            data['content']
            )).decode('utf-8')
        
        logging.warn('hash in request: ' + data_hash)
        logging.warn('computed hash: ' + computed_hash)

        if computed_hash != data_hash:
            raise serializers.ValidationError('The data-hash is invalid.')
        return data


class UserSerializer(serializers.HyperlinkedModelSerializer):
    posts = serializers.HyperlinkedRelatedField(many=True, view_name='post-detail', read_only=True)

    class Meta:
        model = User
        fields = ('url', 'id', 'username', 'posts')