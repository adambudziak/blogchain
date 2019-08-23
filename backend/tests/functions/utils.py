from box import Box


def save_count(response):
    return Box({
        'current_count': response.json()['count'],
        'next_count': response.json()['count'] + 1,
    })
