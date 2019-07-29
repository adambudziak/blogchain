from django.db import models


class Tag(models.Model):
    name = models.CharField(max_length=40)


class BcModelMixin(models.Model):
    """
    An abstract base class for all the objects that reside on the blockchain.

    It defines three columns which are common for all such objects:

     * `data_hash` field that identifies the object on the blockchain;
     * `creation_datetime` which is used while computing the hash on the
        client-side (hence it's not computed automatically by the database),
     * a `verified` field that marks whether an object has been successfully
        verified on the blockchain.
    """
    class Meta:
        abstract = True

    creation_datetime = models.DateTimeField('Post creation datetime')
    data_hash = models.CharField(max_length=66, null=False)  # Two characters for the 0x
    verified = models.BooleanField(default=False)


class Post(BcModelMixin):
    """
    A simple representation of a blog post.

    The author may be null to allow anonymous entries.

    The data_hash should be a result of
        keccak256(creation_datetime | author | title | content).
    Where:
      * the creation_datetime is in format YYYY-MM-DDTHH:mm:ss.SSS,
      * the author's username is taken or 'anonymous' if null,
      * title and content are exactly as stated in the text, without any preformatting. 
    """
    author = models.ForeignKey('auth.User', related_name='posts',
                               on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField('Post content')
    title = models.CharField('Post title', max_length=200)
    tags = models.ManyToManyField(Tag, blank=True)


class Comment(BcModelMixin):
    author = models.ForeignKey('auth.User', related_name='comments',
                               on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField('Comment content')
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)


class PostVote(BcModelMixin):
    author = models.ForeignKey('auth.User', related_name='post_votes',
                               on_delete=models.SET_NULL, null=True, blank=True)
    is_upvote = models.BooleanField('Is this upvote?', default=False, null=False)
    post = models.ForeignKey(Post, related_name='votes', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('author', 'post',)


class CommentVote(BcModelMixin):
    author = models.ForeignKey('auth.User', related_name='comment_votes',
                               on_delete=models.SET_NULL, null=True, blank=True)
    is_upvote = models.BooleanField('Is this upvote?', default=False, null=False)
    comment = models.ForeignKey(Comment, related_name='votes', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('author', 'comment',)



