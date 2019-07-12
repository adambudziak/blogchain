from django.db import models

import logging


class Tag(models.Model):
    name = models.CharField(max_length=40)


class Post(models.Model):
    """
    A simple representation of a blog post.

    The author may be null to allow anonymous entries.

    The data_hash should be a result of keccak256(creation_datetime | author | title | content).
    Where:
      * the creation_datetime is in format YYYY-MM-DDTHH:mm:ss.SSS,
      * the author's username is taken or 'anonymous' if null,
      * title and content are exactly as stated in the text, without any preformatting. 
    """
    author = models.ForeignKey('auth.User', related_name='posts', on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField('Post content')
    title = models.CharField('Post title', max_length=200)
    creation_datetime = models.DateTimeField('Post creation datetime')
    data_hash = models.BinaryField(max_length=32)
    tags = models.ManyToManyField(Tag, blank=True)
    verified = models.BooleanField(default=False)


class Comment(models.Model):
    author = models.ForeignKey('auth.User', related_name='comments', on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField('Comment content')
    creation_datetime = models.DateTimeField('Comment creation datetime')
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    data_hash = models.BinaryField(max_length=32)
    verified = models.BooleanField(default=False)