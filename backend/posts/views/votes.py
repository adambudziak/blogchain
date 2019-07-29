from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from posts.models import PostVote, CommentVote
from posts.serializers import PostVoteSerializer, CommentVoteSerializer


def _get_votes(request, queryset, serializer_type):
    serializer = serializer_type(queryset, many=True, context={
        'request': request
    })
    return Response(serializer.data)


def _create_vote(request, serializer_type):
    # TODO temporary until find out how we want to design votes for
    #      anonymous users
    if not isinstance(request.user, User):
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    serializer = serializer_type(data=request.data, context={
        'request': request,
    })

    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response(status=status.HTTP_201_CREATED)

    return Response(serializer.errors,
                    status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def post_votes(request, post_pk, vote_type=None):
    if request.method == 'GET':
        queryset = PostVote.objects.filter(post__pk=post_pk)
        if vote_type is not None:
            queryset = queryset.filter(is_upvote=(vote_type == 'up'))
        return _get_votes(request, queryset, PostVoteSerializer)

    elif request.method == 'POST':
        return _create_vote(request, PostVoteSerializer)


@api_view(['GET', 'POST'])
def comment_votes(request, comment_pk, vote_type=None):
    if request.method == 'GET':
        queryset = CommentVote.objects.filter(comment__pk=comment_pk)
        if vote_type is not None:
            queryset = queryset.filter(is_upvote=(vote_type == 'up'))
        return _get_votes(request, queryset, CommentVoteSerializer)

    elif request.method == 'POST':
        return _create_vote(request, CommentVoteSerializer)
