from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import CreateAPIView, GenericAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from ..filters import BcObjectsFilter
from ..models import Post, Comment
from ..serializers import PostVoteSerializer, CommentVoteSerializer


class VotesViewMixin:
    filter_backends = [DjangoFilterBackend]
    filterset_class = BcObjectsFilter

    def filter_queryset(self, request, instance, vote_type):
        queryset = instance.votes
        if vote_type is not None:
            queryset = queryset.filter(is_upvote=(vote_type == 'up'))
        queryset = DjangoFilterBackend().filter_queryset(request, queryset, self)
        return queryset

    def get_votes(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True, context={
            'request': request
        })
        return Response(serializer.data)


class PostVotesView(VotesViewMixin, CreateAPIView):
    serializer_class = PostVoteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        ctx = self.request.parser_context['kwargs']
        post_pk, vote_type = ctx['post_pk'], ctx['vote_type']
        instance = get_object_or_404(Post, pk=post_pk)
        return super().filter_queryset(self.request, instance, vote_type)

    def get(self, request, post_pk, vote_type=None):
        return super().get_votes(request)


class CommentVotesView(VotesViewMixin, CreateAPIView, GenericAPIView):
    serializer_class = CommentVoteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        ctx = self.request.parser_context['kwargs']
        comment_pk, vote_type = ctx['comment_pk'], ctx['vote_type']
        instance = get_object_or_404(Comment, pk=comment_pk)
        return super().filter_queryset(self.request, instance, vote_type)

    def get(self, request, comment_pk, vote_type=None):
        return super().get_votes(request)
