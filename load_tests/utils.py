import json
import logging
import os
import pickle
import string
import typing

import requests

log = logging.getLogger(__name__)


class ErrorResponse(Exception):
    """
    Error response exception
    """


def load_users_credentials() -> typing.Tuple[bool, typing.List[str]]:
    """
    Function loads users from user data filename dump. Should return dictionary with authentication method parameters
    e.g. JWT token
    :return: list of credentials
    """
    filename = os.environ.get('LOAD_TEST_FILENAME', 'user_dump.txt')
    try:
        with open(filename, 'rb') as fp:
            user_data = pickle.load(fp)
            is_auth = True
    except FileNotFoundError:
        log.error('File not found. No auth credentials for users.')
        user_data = []
        is_auth = False
    return is_auth, [user.get('token') for user in user_data]


def log_response(response: requests.Response) -> str:
    try:
        response_body = response.json()
    except (AttributeError, json.JSONDecodeError):
        response_body = response.content

    template = string.Template(
        "request_url=$request_url; request_headers=$request_headers; request_body=$request_body; "
        "response_headers=$response_headers; response_status_code=$response_status_code response_body=$response_body"
    )
    return template.safe_substitute(
        request_url=response.request.url,
        request_headers=response.request.headers,
        request_body=response.request.body,
        response_headers=response.headers,
        response_status_code=response.status_code,
        response_body=response_body
    )

def handle_if_error_response(response: requests.Response) -> None:
    """
    Function helps debuging error responses during load tests. It logs every error response and interrupts testcase
    flow
    :param response: requests response
    """
    if response.status_code >= 400:

        log.error(f"Event=Error response; {log_response(response)}")
        raise ErrorResponse()
