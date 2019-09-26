from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

from rest_framework import viewsets, mixins

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView

from django.contrib.auth.models import AnonymousUser
from blogchain.users.models import User

from ..models import (
    Post,
    Comment,
)
from ..serializers import (
    UserSerializer,
    PostSerializer,
    CommentSerializer,
)

from ..filters import BcObjectsFilter

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
    filterset_class = BcObjectsFilter


class CommentViewSet(CreateListRetrieveViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filterset_class = BcObjectsFilter


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class PostCommentsView(APIView):
    serializer_class = CommentSerializer
    filterset_class = BcObjectsFilter

    def get(self, request, post_pk):
        instance = get_object_or_404(Post, pk=post_pk)
        queryset = DjangoFilterBackend().filter_queryset(request, instance.comments, self)
        serializer = self.serializer_class(queryset, many=True, context={
            'request': request
        })
        return Response(serializer.data)

