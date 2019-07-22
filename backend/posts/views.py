from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, action
from rest_framework.response import Response 
from rest_framework.reverse import reverse

from rest_framework import renderers, viewsets, mixins, permissions

from .models import (
    Post,
    Comment,
    Vote
)
from .serializers import (
    UserSerializer,
    PostSerializer,
    CommentSerializer,
    VoteSerializer,
)
from .bc import PostsContract, get_contract_abi, get_contract_address, default_web3

from django.contrib.auth.models import User, AnonymousUser

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

    @action(detail=True, methods=['GET'])
    def comments(self, request, pk=None):
        post = get_object_or_404(Post, pk=pk)
        comments = post.comments.all()
        serializer = CommentSerializer(comments, many=True, context={
            'request': request
        })
        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def verified_comments(self, request, pk=None):
        """
        Returns a list of verified comments of the post.
        """
        post = get_object_or_404(Post, pk=pk)
        comments = post.comments.filter(verified=True)
        serializer = CommentSerializer(comments, many=True, context={
            'request': request
        })
        return Response(serializer.data)


    # TODO maybe those methods using querysets of other models
    # should be moved somewhere else.
    @action(detail=False, methods=['GET'])
    def verified(self, request):
        queryset = Post.objects.filter(verified=True)
        serializer = self.serializer_class(queryset, many=True, context={
            'request': request
        })

        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def votes(self, request, pk=None):
        queryset = Vote.objects.filter(post__pk=pk)
        serializer = VoteSerializer(queryset, many=True, context={
            'request': request
        })
        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def upvotes(self, request, pk=None):
        queryset = Vote.objects.filter(post__pk=pk).filter(is_upvote=True)
        serializer = VoteSerializer(queryset, many=True, context={
            'request': request
        })
        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def downvotes(self, request, pk=None):
        queryset = Vote.objects.filter(post__pk=pk).filter(is_upvote=False)
        serializer = VoteSerializer(queryset, many=True, context={
            'request': request
        })
        return Response(serializer.data)


class VoteViewSet(CreateListRetrieveViewSet):
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer


class CommentViewSet(CreateListRetrieveViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer