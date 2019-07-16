from rest_framework import permissions

from rest_framework.decorators import api_view
from rest_framework.response import Response 
from rest_framework.reverse import reverse

from rest_framework import renderers
from rest_framework import viewsets
from rest_framework.decorators import action

from .models import Post, Comment
from .serializers import PostSerializer, UserSerializer, CommentSerializer
from .permissions import IsOwnerOrReadCreateOnly
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


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = (IsOwnerOrReadCreateOnly,)

    def perform_create(self, serializer):
        author = self.request.user
        if isinstance(author, AnonymousUser):
            logging.debug('Got anonymous user! Changing to None')
            author = None
        else:
            logging.debug('Got authenticated user! (%s)' % author)
        serializer.save(author=author)

    def list(self, request):
        serializer = self.serializer_class(self.queryset, many=True, context={
            'request': request
        })

        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = (IsOwnerOrReadCreateOnly,)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer