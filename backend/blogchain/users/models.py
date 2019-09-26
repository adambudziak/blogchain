from django.contrib.auth.models import AbstractUser
from django.urls import reverse
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from django_prometheus.models import ExportModelOperationsMixin


@python_2_unicode_compatible
class User(ExportModelOperationsMixin('user'), AbstractUser):  # By adding this mixin you can monitor with Prometheus
                                                               # the creation/deletion/update rate for your model

    # First Name and Last Name do not cover name patterns
    # around the globe.
    name = models.CharField(_('Name of User'), blank=True, max_length=255)

    def __str__(self):
        return self.username
