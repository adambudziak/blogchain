# http://stackoverflow.com/questions/10390244/
# Full-fledge class: https://stackoverflow.com/a/18046120/104731
from storages.backends.s3boto3 import S3Boto3Storage  # noqa E402
from storages.utils import setting


class StaticRootS3Boto3Storage(S3Boto3Storage):
    location = 'static'
    default_acl = setting("AWS_DEFAULT_ACL_STATIC", "public-read")


class MediaRootS3Boto3Storage(S3Boto3Storage):
    location = 'media'
    file_overwrite = False
    default_acl = setting("AWS_DEFAULT_ACL_MEDIA", "private")
