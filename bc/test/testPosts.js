const Posts = artifacts.require('Posts');


contract('Posts', async accounts => {
    it('Should add a post correctly', async () => {
        let posts = await Posts.deployed();
        let postsCountBefore = await posts.getPostsCount.call();
        assert.equal(postsCountBefore, 0);

        const date = '2019-07-11T10:05:11.367Z';
        const postHash = web3.utils.keccak256('Test content');
        await posts.addPost(date, postHash, {value: web3.utils.toWei('0.005', 'ether')});
        let postsCountAfter = await posts.getPostsCount.call();
        assert.equal(postsCountAfter, 1);

        let newPost = await posts.posts.call(0);
        assert.equal(newPost[0], date);
        assert.equal(newPost[1], postHash);
    })
});
