from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from posts.models import Post, Comment
from posts.serializers import PostVoteSerializer, CommentVoteSerializer


class VotesViewMixin:

    def get_votes(self, request, instance, vote_type=None):
        queryset = instance.votes
        if vote_type is not None:
            queryset = queryset.filter(is_upvote=(vote_type == 'up'))
        serializer = self.serializer_class(queryset, many=True, context={
            'request': request
        })
        return Response(serializer.data)

    def create_vote(self, request):
        # TODO temporary until find out how we want to design votes for
        #      anonymous users
        if not isinstance(request.user, User):
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.serializer_class(data=request.data, context={
            'request': request,
        })

        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(status=status.HTTP_201_CREATED)

        return Response(serializer.errors,
                        status.HTTP_400_BAD_REQUEST)


class PostVotesView(VotesViewMixin, APIView):
    serializer_class = PostVoteSerializer

    def get(self, request, post_pk, vote_type=None):
        instance = get_object_or_404(Post, pk=post_pk)
        return super().get_votes(request, instance, vote_type)

    def post(self, request, post_pk, vote_type=None):
        return super().create_vote(request)


class CommentVotesView(VotesViewMixin, APIView):
    serializer_class = CommentVoteSerializer

    def get(self, request, comment_pk, vote_type=None):
        instance = get_object_or_404(Comment, pk=comment_pk)
        return super().get_votes(request, instance, vote_type)

    def post(self, request, comment_pk, vote_type=None):
        return super().create_vote(request)
