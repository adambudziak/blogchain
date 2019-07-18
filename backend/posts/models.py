from django.db import models

import logging


class Tag(models.Model):
    name = models.CharField(max_length=40)

class BcModelMixin(models.Model):
    class Meta:
        abstract = True

    creation_datetime = models.DateTimeField('Post creation datetime')
    data_hash = models.CharField(max_length=66) # Two characters for the 0x
    verified = models.BooleanField(default=False)

class Post(BcModelMixin):
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
    tags = models.ManyToManyField(Tag, blank=True)


class Comment(BcModelMixin):
    author = models.ForeignKey('auth.User', related_name='comments', on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField('Comment content')
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)


class Vote(BcModelMixin):
    author = models.ForeignKey('auth.User', related_name='votes', on_delete=models.SET_NULL, null=True, blank=True)
    is_upvote = models.BooleanField('Is this upvote?', default=False, null=False)
    post = models.ForeignKey(Post, related_name='votes', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('author', 'post',)

