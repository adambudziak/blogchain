from locust.clients import HttpSession
from load_tests.utils import handle_if_error_response


class LoadTestClient(HttpSession):
    """
    Class extends HTTPSession class normally used by locust with logging error responses and raising error if it is
    error response
    """

    def get(self, url, **kwargs):
        response = super().get(url, **kwargs)
        handle_if_error_response(response)
        return response

    def post(self, url, data=None, json=None, **kwargs):
        response = super().post(url, data, json, **kwargs)
        handle_if_error_response(response)
        return response

    def put(self, url, data=None, **kwargs):
        response = super().put(url, data, **kwargs)
        handle_if_error_response(response)
        return response

    def patch(self, url, data=None, **kwargs):
        response = super().patch(url, data, **kwargs)
        handle_if_error_response(response)
        return response

    def delete(self, url, **kwargs):
        response = super().delete(url, **kwargs)
        handle_if_error_response(response)
        return response

    def head(self, url, **kwargs):
        response = super().head(url, **kwargs)
        handle_if_error_response(response)
        return response

    def options(self, url, **kwargs):
        response = super().options(url, **kwargs)
        handle_if_error_response(response)
        return response
