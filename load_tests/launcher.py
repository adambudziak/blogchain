from logging import config, getLogger

from locust import main as locust_main

from .config import LOGGER_CONFIG


def main():
    """
    Running locust main function
    """
    locust_main.main()


if __name__ == '__main__':
    # loading logger configuration
    config.dictConfig(LOGGER_CONFIG)
    getLogger('urllib3').setLevel('INFO')
    main()
