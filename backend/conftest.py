import pytest
from pytest_django.lazy_django import skip_if_no_django
from requests_mock import MockerCore
from faker import config
from rest_framework.test import APIRequestFactory


config.DEFAULT_LOCALE = 'pl_PL'


@pytest.fixture(scope='session')
def faker_locale():
    return 'pl_PL'


@pytest.fixture(scope='session')
def setup_view():
    """Returns function able to setup Django's view.

    Mimic as_view() returned callable, but returns view instance.
    args and kwargs are the same you would pass to ``reverse()``

    Examples
    ========
    `setup_view` should be used as normal pytest's fixture::

        def test_hello_view(setup_view):
            name = 'django'
            request = RequestFactory().get('/fake-path')
            view = HelloView(template_name='hello.html')
            view = setup_view(view, request, name=name)

            # Example test ugly dispatch():
            response = view.dispatch(view.request, *view.args, **view.kwargs)
    """
    def _inner_setup_view(view, request, *args, **kwargs):
        view.request = request
        view.args = args
        view.kwargs = kwargs
        return view

    return _inner_setup_view


@pytest.fixture(scope='session')
def api_setup_view():
    """Returns function able to setup DRF's view.

    Examples
    ========
    `api_setup_view` should be used as normal pytest's fixture::

        def test_profile_info_view(api_setup_view):
            request = HttpRequest()
            view = views.ProfileInfoView()
            view = api_setup_view(view, request, 'list')
            assert view.get_serializer_class() == view.serializer_class
    """
    def _inner_api_setup_view(view, request, action, *args, **kwargs):
        view.request = request
        view.action = action
        view.args = args
        view.kwargs = kwargs
        return view

    return _inner_api_setup_view


@pytest.fixture()
def api_rf():
    """APIRequestFactory instance"""
    skip_if_no_django()
    return APIRequestFactory()


@pytest.yield_fixture(scope="session")
def requests_mock():
    mock = MockerCore()
    mock.start()
    yield mock
    mock.stop()
