from action_serializer import ModelActionSerializer
from rest_framework import serializers

from blogchain.users.models import User
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


class HyperlinkedModelActionSerializer(serializers.HyperlinkedModelSerializer,
                                       ModelActionSerializer):
    """

    """


class PostSerializer(HashValidatorMixin, HyperlinkedModelActionSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    upvotes = serializers.SerializerMethodField()
    downvotes = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    content_preview = serializers.SerializerMethodField()

    class Meta:
        _common_fields = ('url', 'id', 'creation_datetime', 'author', 'verified',
                          'tags', 'title', 'data_hash', 'upvotes', 'downvotes', 'comments')

        model = Post
        fields = _common_fields + ('content', 'content_preview')
        read_only_fields = ('verified',)
        action_fields = {
            'list': {
                'fields': _common_fields + ('content_preview',)
            }
        }

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

    def get_comments(self, instance):
        return instance.comments.all().count()

    def get_content_preview(self, instance):
        return instance.content[:80] + ' ...'


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
    base_fields = ('id', 'author', 'creation_datetime', 'data_hash', 'is_upvote', 'verified')

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
        read_only_fields = ('verified',)

    def validate(self, data):
        data['author'] = self.context['request'].user
        if PostVote.objects.filter(author=self.context['request'].user, post=data['post']).exists():
            raise serializers.ValidationError('You have already voted on this post.')

        return super(PostVoteSerializer, self).validate(data)


class CommentVoteSerializer(BaseVoteSerializer, serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = CommentVote
        fields = BaseVoteSerializer.base_fields + ('comment',)
        read_only_fields = ('verified',)

    def validate(self, data):
        data['author'] = self.context['request'].user
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
