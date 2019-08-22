from django.urls import path, include
from django.conf.urls import url
from rest_framework.routers import DefaultRouter
from .views import posts, votes

router = DefaultRouter()
router.register('posts', posts.PostViewSet)
router.register('users', posts.UserViewSet)
router.register('comments', posts.CommentViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('posts/<int:post_pk>/comments/', posts.post_comments_view),
    url(r'^posts/(?P<post_pk>\d+)/(?P<vote_type>up|down)?votes/$', votes.post_votes),
    url(r'^comments/(?P<comment_pk>\d+)/(?P<vote_type>up|down)?votes/$', votes.comment_votes),
]
