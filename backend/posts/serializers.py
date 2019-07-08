from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Tag, Comment


class PostSerializer(serializers.HyperlinkedModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    class Meta:
        model = Post
        fields = ('url', 'id', 'creation_datetime', 'author',
                  'tags', 'title', 'content', 'data_hash')

    def get_author(self, obj):
        if obj.author is None:
            return 'Anonymous'


class UserSerializer(serializers.HyperlinkedModelSerializer):
    posts = serializers.HyperlinkedRelatedField(many=True, view_name='post-detail', read_only=True)

    class Meta:
        model = User
        fields = ('url', 'id', 'username', 'posts')