const Upvotes = artifacts.require('Upvotes');
const Downvotes = artifacts.require('Downvotes');

contract('Upvotes', async accounts => {
    it('Should store a vote correctly', async () => {
        const upvotes = await Upvotes.deployed();
        const postHash = web3.utils.keccak256('some post');

        const upvoteCountBefore = await upvotes.getUpvoteCount();
        let upvoteHash = web3.utils.keccak256('upvote');
        assert.equal(upvoteCountBefore, 0);
        let upvoteCountForPost = await upvotes.getUpvoteCountForPost(postHash);
        assert.equal(upvoteCountForPost, 0);

        await upvotes.vote(upvoteHash, postHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });

        const upvoteCountAfter = await upvotes.getUpvoteCount();
        assert.equal(upvoteCountAfter, 1);
        upvoteCountForPost = await upvotes.getUpvoteCountForPost(postHash);
        assert.equal(upvoteCountForPost, 1);
    });

    it('Should not mix with downvotes', async () => {
        const upvotes = await Upvotes.deployed();
        const downvotes = await Downvotes.deployed();
        const upvoteCountBefore = await upvotes.getUpvoteCount();
        assert.equal(upvoteCountBefore, 1);
        const postHash = web3.utils.keccak256('some post');
        let upvoteCountForPost = await upvotes.getUpvoteCountForPost(postHash);
        let downvoteCountForPost = await downvotes.getDownvoteCountForPost(postHash);
        assert.equal(upvoteCountForPost, 1);
        assert.equal(downvoteCountForPost, 0);

        const upvoteHash = web3.utils.keccak256('upvote');
        const downvoteHash = web3.utils.keccak256('downvote');

        await upvotes.vote(upvoteHash, postHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });
        await downvotes.vote(downvoteHash, postHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });

        const upvoteCountAfter = await upvotes.getUpvoteCountForPost(postHash);
        assert.equal(upvoteCountAfter, 2);
        const downvoteCountAfter = await downvotes.getDownvoteCountForPost(postHash);
        assert.equal(downvoteCountAfter, 1);
    })
});
