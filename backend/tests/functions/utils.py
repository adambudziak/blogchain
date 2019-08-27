from box import Box


def save_count(response):
    return Box({
        'current_count': response.json()['count'],
        'next_count': response.json()['count'] + 1,
    })


def with_response_objects(fn):
    def inner(response, *args, **kwargs):
        response_json = response.json()
        assert response_json['count'] > 0, 'There are no objects in the response.'
        return fn(response_json['results'], *args, **kwargs)
    return inner


@with_response_objects
def assert_all_not_verified(objects):
    assert not any(obj['verified'] for obj in objects), 'Some objects are verified'


@with_response_objects
def assert_all_verified(objects):
    assert all(obj['verified'] for obj in objects), 'Not all objects are verified.'


@with_response_objects
def assert_all_by(objects, author):
    assert all(obj['author'] == author for obj in objects), "The author doesn't match for some of the objects"

