from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import CreateAPIView, GenericAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from posts.filters import BcObjectsFilter
from posts.models import Post, Comment
from posts.serializers import PostVoteSerializer, CommentVoteSerializer


class VotesViewMixin:
    filter_backends = [DjangoFilterBackend]
    filterset_class = BcObjectsFilter

    def get_votes(self, request, instance, vote_type=None):
        queryset = instance.votes
        if vote_type is not None:
            queryset = queryset.filter(is_upvote=(vote_type == 'up'))
        queryset = DjangoFilterBackend().filter_queryset(request, queryset, self)
        serializer = self.serializer_class(queryset, many=True, context={
            'request': request
        })
        return Response(serializer.data)


class PostVotesView(VotesViewMixin, CreateAPIView, GenericAPIView):
    serializer_class = PostVoteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, post_pk, vote_type=None):
        instance = get_object_or_404(Post, pk=post_pk)
        return super().get_votes(request, instance, vote_type)


class CommentVotesView(VotesViewMixin, CreateAPIView, GenericAPIView):
    serializer_class = CommentVoteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, comment_pk, vote_type=None):
        instance = get_object_or_404(Comment, pk=comment_pk)
        return super().get_votes(request, instance, vote_type)
