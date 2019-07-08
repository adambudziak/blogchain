from django.db import models
from eth_hash.auto import keccak

import logging

# class BlockchainProof(models.Model):
#     tx_address = models.BinaryField(max_length=32)
#     commitment - models.BinaryField(max_length=32)


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
    # bc_proof = models.OneToOneField(BlockchainProof, null=True, blank=True, on_delete=models.SET_NULL)
    data_hash = models.BinaryField(max_length=32, editable=False)
    tags = models.ManyToManyField(Tag, blank=True)

    def save(self, *args, **kwargs):
        logging.warn(self.author)

        date = str(self.creation_datetime)
        username = self.author.username if self.author is not None else 'anonymous'

        self.data_hash = keccak((date + username + self.title + self.content).encode('utf-8'))
        return super(Post, self).save(*args, **kwargs)


class Comment(models.Model):
    author = models.ForeignKey('auth.User', related_name='comments', on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField('Comment content')
    creation_datetime = models.DateTimeField('Comment creation datetime')
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
