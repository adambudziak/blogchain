from celery import Celery

app = Celery('blogchain_celery')


@app.task(bind=True)
def dummy_task(self):
    print('Request {0!r}'.format(self.request))