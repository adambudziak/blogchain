import os

LOG_LEVEL = 'DEBUG' if os.environ.get('DJANGO_DEBUG', '') == 'True' else 'INFO'
LOGGER_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': ('%(asctime)s [%(levelname)s] %(name)s:%(lineno)d '
                       'from %(thread)d: %(message)s')
        },
    },
    'handlers': {
        'default': {
            'level': 'DEBUG',
            'formatter': 'standard',
            'class': 'logging.StreamHandler',
        }
    },
    'loggers': {
        '': {
            'handlers': ['default'],
            'level': LOG_LEVEL,
            'propagate': True
        },
    }
}


