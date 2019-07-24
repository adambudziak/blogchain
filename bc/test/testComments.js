const Comments = artifacts.require('Comments');


contract('Comments', async accounts => {
    it('Should store a comment correctly', async () => {
        let comments = await Comments.deployed();
        let commentCountBefore = await comments.getCommentCount();
        assert.equal(commentCountBefore, 0);

        let commentHash = web3.utils.keccak256('some comment');
        let postHash = web3.utils.keccak256('some post');

        await comments.addComment(commentHash, postHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });

        let commentCountAfter = await comments.getCommentCount();
        assert.equal(commentCountAfter, 1);

        let firstComment = await comments.comments(0);
        assert.equal(firstComment[0], commentHash);
        assert.equal(firstComment[1], postHash);
    })
});
