const Posts = artifacts.require('Posts');


contract('Posts', async accounts => {
    it('Should add a post correctly', async () => {
        let posts = await Posts.deployed();
        let postsCountBefore = await posts.getPostCount.call();
        assert.equal(postsCountBefore, 0);

        const fee = await posts.addPostFee.call();

        // the contract  doesn't care whether the hash was computer properly
        const postHash = web3.utils.keccak256('Test content');
        await posts.addPost(postHash, {value: fee});
        let postsCountAfter = await posts.getPostCount.call();
        assert.equal(postsCountAfter, 1);

        let newPost = await posts.posts.call(0);
        assert.equal(newPost, postHash);

        let postAuthor = await posts.postToAuthor.call(postHash);
        assert.equal(postAuthor, accounts[0]);
    });
});
