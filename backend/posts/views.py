from rest_framework import permissions

from rest_framework.decorators import api_view
from rest_framework.response import Response 
from rest_framework.reverse import reverse

from rest_framework import renderers
from rest_framework import viewsets
from rest_framework.decorators import action

from .models import Post
from .serializers import PostSerializer, UserSerializer
from .permissions import IsOwnerOrReadCreateOnly

from django.contrib.auth.models import User, AnonymousUser

import logging


@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'users': reverse('user-list', request=request, format=format),
        'posts': reverse('post-list', request=request, format=format)
    })


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    # permission_classes = (permissions.IsAuthenticatedOrReadOnly,
    #                       IsOwnerOrReadOnly,)
    permission_classes = (IsOwnerOrReadCreateOnly,)

    def perform_create(self, serializer):
        author = self.request.user
        if type(author) == AnonymousUser:
            logging.warn('Got anonymous user! Changing to None')
            author = None
        else:
            logging.warn('Got authenticated user!')
        serializer.save(author=author)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer