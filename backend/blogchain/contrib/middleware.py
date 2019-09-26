from django.conf import settings


class VersionMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.app_version = settings.APP_VERSION
        request.git_commit = settings.GIT_COMMIT
        response = self.get_response(request)
        response['X-APP-VERSION'] = settings.APP_VERSION
        response['X-GIT-COMMIT'] = settings.GIT_COMMIT
        return response
