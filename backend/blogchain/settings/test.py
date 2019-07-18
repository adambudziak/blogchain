from .local import *

DATABASES.update({
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'blogchain_test'
    }
})