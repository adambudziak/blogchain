from django.conf.urls import url
from rest_framework import routers

from . import views

app_name = 'users'

router = routers.DefaultRouter()
router.register('', views.UserViewSet)
urlpatterns = router.urls
