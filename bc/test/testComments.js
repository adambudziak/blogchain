const CommentStore = artifacts.require('CommentStore');


contract('CommentStore', async accounts => {
    it('Should store a comment correctly', async () => {
        let commentStore = await CommentStore.deployed();
        let commentCountBefore = await commentStore.getCommentCount();
        assert.equal(commentCountBefore, 0);

        let commentHash = web3.utils.keccak256('some comment');
        let postHash = web3.utils.keccak256('some post');

        await commentStore.addComment(commentHash, postHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });

        let commentCountAfter = await commentStore.getCommentCount();
        assert.equal(commentCountAfter, 1);

        let firstComment = await commentStore.comments(0);
        assert.equal(firstComment[0], commentHash);
        assert.equal(firstComment[1], postHash);
    })
})