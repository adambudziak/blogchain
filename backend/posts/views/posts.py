from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User, AnonymousUser

from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.reverse import reverse

from rest_framework import viewsets, mixins

from django_filters.rest_framework import DjangoFilterBackend

from posts.models import (
    Post,
    Comment,
)
from posts.serializers import (
    UserSerializer,
    PostSerializer,
    CommentSerializer,
)

import logging


@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'users': reverse('user-list', request=request, format=format),
        'posts': reverse('post-list', request=request, format=format),
        'comments': reverse('comment-list', request=request, format=format),
    })


class CreateListRetrieveViewSet(mixins.CreateModelMixin,
                                mixins.ListModelMixin,
                                mixins.RetrieveModelMixin,
                                viewsets.GenericViewSet):
    """
    A viewset that provides `retrieve`, `create`, and `list` actions.

    To use it, override the class and set the `.queryset` and
    `.serializer_class` attributes.
    """
    filter_backends = [DjangoFilterBackend]

    def perform_create(self, serializer):
        author = self.request.user
        if isinstance(author, AnonymousUser):
            logging.debug('Got anonymous user! Changing to None')
            author = None
        else:
            logging.debug('Got authenticated user! (%s)' % author.username)
        serializer.save(author=author)


class PostViewSet(CreateListRetrieveViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filterset_fields = ['verified', 'author']


class CommentViewSet(CreateListRetrieveViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filterset_fields = ['verified', 'author']


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@api_view(['GET'])
def post_comments(request, post_pk):
    all_comments = Comment.objects.filter(post__pk=post_pk)
    queryset = DjangoFilterBackend().filter_queryset(request, all_comments, CommentViewSet)
    serializer = CommentViewSet.serializer_class(queryset, many=True, context={
        'request': request
    })
    return Response(serializer.data)
