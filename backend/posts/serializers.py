from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Tag, Comment, PostVote, CommentVote
from .bc.hash import compute_post_hash, compute_comment_hash, compute_vote_hash


class HashValidatorMixin:
    """
    Mixin implementing the `validate` method that verifies the
    `data_hash` passed in the request.

    Each subclass must override the `compute_hash` method to provide
    a hash computed from fields passed in the request.
    """

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

        computed_hash = self.compute_hash(
            author,
            data['creation_datetime'],
            data,
            )

        if computed_hash != data_hash:
            raise serializers.ValidationError('The data-hash is invalid.')

        return data


class PostSerializer(HashValidatorMixin, serializers.HyperlinkedModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    upvotes = serializers.SerializerMethodField()
    downvotes = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('url', 'id', 'creation_datetime', 'author', 'verified',
                  'tags', 'title', 'content', 'data_hash', 'upvotes', 'downvotes')
        read_only_fields = ('verified',)

    @staticmethod
    def compute_hash(author, datetime, data):
        return compute_post_hash(
            author, datetime, data['title'], data['content']
        )

    def validate(self, data):
        return super(PostSerializer, self).validate(data)

    def get_upvotes(self, instance):
        return instance.votes.filter(is_upvote=True).count()

    def get_downvotes(self, instance):
        return instance.votes.filter(is_upvote=False).count()


class CommentSerializer(HashValidatorMixin, serializers.HyperlinkedModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    upvotes = serializers.SerializerMethodField()
    downvotes = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        read_only_fields = ('verified',)
        fields = ('url', 'id', 'author', 'creation_datetime', 'content', 'data_hash', 'post',
                  'upvotes', 'downvotes') + read_only_fields

    @staticmethod
    def compute_hash(author, datetime, data):
        return compute_comment_hash(
            author, datetime, data['content']
        )

    def validate(self, data):
        return super(CommentSerializer, self).validate(data)

    def get_upvotes(self, instance):
        return instance.votes.filter(is_upvote=True).count()

    def get_downvotes(self, instance):
        return instance.votes.filter(is_upvote=False).count()


class BaseVoteSerializer(HashValidatorMixin):
    base_fields = ('id', 'author', 'creation_datetime', 'data_hash', 'is_upvote')

    @staticmethod
    def compute_hash(author, datetime, data):
        return compute_vote_hash(author, datetime, data['is_upvote'])

    def validate(self, data):
        return super(BaseVoteSerializer, self).validate(data)


class PostVoteSerializer(BaseVoteSerializer, serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = PostVote
        fields = BaseVoteSerializer.base_fields + ('post',)

    def validate(self, data):
        if PostVote.objects.filter(author=self.context['request'].user, post=data['post']).exists():
            raise serializers.ValidationError('You have already voted on this post.')

        return super(PostVoteSerializer, self).validate(data)


class CommentVoteSerializer(BaseVoteSerializer, serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = CommentVote
        fields = BaseVoteSerializer.base_fields + ('comment',)

    def validate(self, data):
        if CommentVote.objects.filter(author=self.context['request'].user, comment=data['comment']).exists():
            raise serializers.ValidationError('You have already voted on this comment.')

        return super(CommentVoteSerializer, self).validate(data)


class UserSerializer(serializers.HyperlinkedModelSerializer):
    posts = serializers.HyperlinkedRelatedField(many=True, view_name='post-detail', read_only=True)

    class Meta:
        model = User
        fields = ('url', 'id', 'username', 'posts')

    def validate(self, data):
        return super(UserSerializer, self).validate(data)
