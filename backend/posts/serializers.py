from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Tag, Comment, Vote
from .bc import compute_post_hash, compute_comment_hash, compute_vote_hash

import base64
from datetime import datetime

# TODO a better solution would be nice
# (the frontend measures the time only to milliseconds it seems)
def _format_datetime_with_millis(_datetime: datetime):
    return _datetime.isoformat()[:-3]


class HashValidatorMixin():

    @staticmethod
    def compute_hash(author, datetime, data):
        raise NotImplementedError('You need to override this method.')

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

        computed_hash = self.compute_hash(
            author,
            _datetime,
            data,
            )

        if computed_hash != data_hash:
            raise serializers.ValidationError('The data-hash is invalid.')

        return data



class PostSerializer(HashValidatorMixin, serializers.HyperlinkedModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    class Meta:
        model = Post
        fields = ('url', 'id', 'creation_datetime', 'author', 'verified',
                  'tags', 'title', 'content', 'data_hash',)
        read_only_fields = ('verified',)

    @staticmethod
    def compute_hash(author, datetime, data):
        return compute_post_hash(
            author, datetime, data['title'], data['content']
        )

    def validate(self, data):
        return super(PostSerializer, self).validate(data)


class CommentSerializer(HashValidatorMixin, serializers.HyperlinkedModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        read_only_fields = ('verified',)
        fields = ('url', 'id', 'author', 'creation_datetime', 'content', 'data_hash', 'post') + read_only_fields

    @staticmethod
    def compute_hash(author, datetime, data):
        return compute_comment_hash(
            author, datetime, data['content']
        )

    def validate(self, data):
        return super(CommentSerializer, self).validate(data)


class VoteSerializer(HashValidatorMixin, serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Vote
        fields = ('id', 'author', 'creation_datetime', 'data_hash', 'post', 'is_upvote')

    @staticmethod
    def compute_hash(author, datetime, data):
        return compute_vote_hash(author, datetime, data['is_upvote'])

    def validate(self, data):
        if Vote.objects.filter(author=self.context['request'].user, post=data['post']).exists():
            raise serializers.ValidationError('You have already voted on this post.')
        
        return super(VoteSerializer, self).validate(data)



class UserSerializer(serializers.HyperlinkedModelSerializer):
    posts = serializers.HyperlinkedRelatedField(many=True, view_name='post-detail', read_only=True)

    class Meta:
        model = User
        fields = ('url', 'id', 'username', 'posts')

    def validate(self, data):
        return super(UserSerializer, self).validate(data)