import os
from celery import Celery
from django.conf import settings
from django.apps import apps, AppConfig

if not settings.configured:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blogchain.settings')

app = Celery('blogchain')

class CeleryConfig(AppConfig):
    name = 'taskapp'
    verbose_name = 'Celery config'

    def ready(self):
        app.config_from_object('django.conf:settings', namespace='CELERY')
        installed_apps = [app_config.name for app_config in apps.get_app_configs()]
        app.autodiscover_tasks(lambda: installed_apps, force=True)


app.conf.beat_schedule = {
    'test': {
        'task': 'taskapp.tasks.verify_posts',
        'schedule': 60.0,
    }
}
