import os

from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views import defaults as default_views

from rest_framework import permissions, authentication
from drf_yasg.views import get_schema_view
from drf_yasg import openapi


schema_view = get_schema_view(
    openapi.Info(
        title="blogchain API",
        default_version='v1',
        description="API documentation for blogchain",
    ),
    validators=['flex', 'ssv'],
    public=False,
    permission_classes=(permissions.IsAdminUser,),
    authentication_classes=(authentication.TokenAuthentication,
                            authentication.SessionAuthentication),
)


urlpatterns = [
    # Django Admin, use {% url 'admin:index' %}
    url(settings.ADMIN_URL, admin.site.urls),
    url(r'^healthz/', include('health_check.urls')),
    # User management
    url(r'^users/', include('blogchain.users.urls')),
    
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^rest-auth/registration/', include('rest_auth.registration.urls')),
    url(r'^api-auth/', include('rest_framework.urls')),
    url(r'^docs/$', schema_view.with_ui('redoc', cache_timeout=None), name='schema-redoc'),
    # Your stuff: custom urls includes go here
    url(r'^', include('blogchain.posts.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        url(r'^400/$', default_views.bad_request, kwargs={'exception': Exception('Bad Request!')}),
        url(r'^403/$', default_views.permission_denied, kwargs={'exception': Exception('Permission Denied')}),
        url(r'^404/$', default_views.page_not_found, kwargs={'exception': Exception('Page not Found')}),
        url(r'^500/$', default_views.server_error),
    ]
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            url(r'^__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns

if os.environ.get('DJANGO_SETTINGS_MODULE') == 'config.settings.production':
    urlpatterns += [
        url(r'^prometheus/', include('django_prometheus.urls')),
    ]

urlpatterns = [
    url(r'^api/', include(urlpatterns))
]
