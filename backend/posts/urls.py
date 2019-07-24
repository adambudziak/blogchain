from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('posts', views.PostViewSet)
router.register('users', views.UserViewSet)
router.register('comments', views.CommentViewSet)
router.register('votes', views.VoteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
