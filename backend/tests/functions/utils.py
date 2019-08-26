from box import Box


def save_count(response):
    return Box({
        'current_count': response.json()['count'],
        'next_count': response.json()['count'] + 1,
    })


def assert_all_not_verified(response):
    response_json = response.json()
    assert response_json['count'] > 0, 'There are no objects in the response.'
    objects = response_json['results']
    assert not any(obj['verified'] for obj in objects), 'Some objects are verified'


def assert_all_verified(response):
    response_json = response.json()
    assert response_json['count'] > 0, 'There are no objects in the response.'
    objects = response_json['results']
    assert all(obj['verified'] for obj in objects), 'Not all objects are verified.'
