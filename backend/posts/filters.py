from django import forms
from django.core.exceptions import ValidationError
from django_filters import widgets, filters, rest_framework as rest_filters


class StrictBooleanWidget(widgets.BooleanWidget):
    """
    Widget with functionality similar to BooleanWidget provided with django_filters
    but that allows to handle invalid values instead of just ignoring them.

    It's compatible with BooleanWidget, meaning that when it's passed to
    BooleanFilter from django_filters, the behavior doesn't change.
    """

    def value_from_datadict(self, data, files, name):
        try:
            value = data[name]
        except KeyError:
            return None
        if isinstance(value, str):
            value = value.lower()

        if value in ('1', 'true', True):
            return True
        if value in ('0', 'false', False):
            return False
        return 'error'


class StrictBooleanField(forms.Field):
    """
    BooleanField that allows only True, False, "0", "1",
    and "true", "false" (case insensitive).

    Raises ValidationError for all other values.
    """
    widget = StrictBooleanWidget

    def to_python(self, value):
        if value in (True, 'True', 'true', '1'):
            return True
        if value in (False, 'False', 'false', '0'):
            return False
        if value is not None:
            return 'error'

    def validate(self, value):
        if value == 'error':
            raise ValidationError(message='Enter a valid boolean value')

    def has_changed(self, initial, data):
        if self.disabled:
            return False
        # Sometimes data or initial may be a string equivalent of a boolean
        # so we should run it through to_python first to get a boolean value
        return self.to_python(initial) != self.to_python(data)


class StrictBooleanFilter(filters.Filter):
    field_class = StrictBooleanField


class BcObjectsFilter(rest_filters.FilterSet):
    verified = StrictBooleanFilter(field_name='verified')
    author = rest_filters.NumberFilter(field_name='author')
