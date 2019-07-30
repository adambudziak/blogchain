const Upvotes = artifacts.require('Upvotes');
const Downvotes = artifacts.require('Downvotes');

contract('Upvotes', async accounts => {
    it('Should store a vote correctly', async () => {
        const upvotes = await Upvotes.deployed();
        const postHash = web3.utils.keccak256('some post');

        const upvoteCountBefore = await upvotes.getPostsUpvoteCount();
        let upvoteHash = web3.utils.keccak256('upvote');
        assert.equal(upvoteCountBefore, 0);
        let upvoteCountForPost = await upvotes.getUpvoteCountForPost(postHash);
        assert.equal(upvoteCountForPost, 0);

        await upvotes.voteForPost(upvoteHash, postHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });

        const upvoteCountAfter = await upvotes.getPostsUpvoteCount();
        assert.equal(upvoteCountAfter, 1);
        upvoteCountForPost = await upvotes.getUpvoteCountForPost(postHash);
        assert.equal(upvoteCountForPost, 1);
    });

    it('Should not mix with downvotes', async () => {
        const upvotes = await Upvotes.deployed();
        const downvotes = await Downvotes.deployed();
        const upvoteCountBefore = await upvotes.getPostsUpvoteCount();
        assert.equal(upvoteCountBefore, 1);
        const postHash = web3.utils.keccak256('some post');
        let upvoteCountForPost = await upvotes.getUpvoteCountForPost(postHash);
        let downvoteCountForPost = await downvotes.getDownvoteCountForPost(postHash);
        assert.equal(upvoteCountForPost, 1);
        assert.equal(downvoteCountForPost, 0);

        const upvoteHash = web3.utils.keccak256('upvote');
        const downvoteHash = web3.utils.keccak256('downvote');

        await upvotes.voteForPost(upvoteHash, postHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });
        await downvotes.voteForPost(downvoteHash, postHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });

        const upvoteCountAfter = await upvotes.getUpvoteCountForPost(postHash);
        assert.equal(upvoteCountAfter, 2);
        const downvoteCountAfter = await downvotes.getDownvoteCountForPost(postHash);
        assert.equal(downvoteCountAfter, 1);
    });

    it('Should not mix post votes and comment votes', async () => {
        const upvotes = await Upvotes.deployed();
        const downvotes = await Downvotes.deployed();

        const targetHash = web3.utils.keccak256('something');
        const upvoteHash = web3.utils.keccak256('vote');
        const downvoteHash = web3.utils.keccak256('vote'); // intentionally the same

        await upvotes.voteForPost(upvoteHash, targetHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });

        assert.equal(await upvotes.getPostsUpvoteCount(), 3);
        assert.equal(await upvotes.getCommentsUpvoteCount(), 0);

        await upvotes.voteForComment(upvoteHash, targetHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });

        assert.equal(await upvotes.getPostsUpvoteCount(), 3);
        assert.equal(await upvotes.getCommentsUpvoteCount(), 1);

        await downvotes.voteForComment(downvoteHash, targetHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });

        assert.equal(await downvotes.getPostsDownvoteCount(), 1);
        assert.equal(await downvotes.getCommentsDownvoteCount(), 1);

        await downvotes.voteForPost(downvoteHash, targetHash, {
            value: web3.utils.toWei('0.001', 'ether')
        });

        assert.equal(await downvotes.getPostsDownvoteCount(), 2);
        assert.equal(await downvotes.getCommentsDownvoteCount(), 1);
    })
});
