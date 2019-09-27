const CommentVotes = artifacts.require('CommentVotes');
const Posts = artifacts.require('Posts');
const Comments = artifacts.require('Comments');

contract('CommentVotes', async accounts => {
    let posts;
    let postHash;

    let comments;
    let commentHash;

    let commentVotes;

    before('Deploy posts contract and add a post', async () => {
        posts = await Posts.deployed();
        postHash = web3.utils.keccak256('Some post');
        const postAuthor = accounts[accounts.length-1];
        let fee = await posts.addPostFee.call();
        await posts.addPost(postHash, {value: fee, from: postAuthor});

        comments = await Comments.deployed();
        commentHash = web3.utils.keccak256('Some comment');
        const commentAuthor = accounts[accounts.length-2];
        fee = await comments.getTotalFee.call();
        await comments.addComment(commentHash, postHash, {value: fee, from: commentAuthor});
    });

    it('Should add a commentVote correctly', async () => {
        commentVotes = await CommentVotes.deployed(posts.address, comments.address);

        const commentVoteCountBefore = await commentVotes.getVoteCount.call();
        assert.equal(commentVoteCountBefore, 0);

        const fee = await commentVotes.getTotalFee.call();

        const commentVoteHash = web3.utils.keccak256('Some content');
        const result = await commentVotes.addVote(commentVoteHash, commentHash, { value: fee });
        const { event, args } = result.logs[0];
        assert.equal(event, 'VoteAdded');
        assert.equal(args.hash, commentVoteHash);
        assert.equal(args.commentHash, commentHash);
        assert.equal(args.author, accounts[0]);

        const commentVoteCountAfter = await commentVotes.getVoteCount.call();
        assert.equal(commentVoteCountAfter, 1);

        const firstComment = await commentVotes.votes.call(0);
        assert.equal(firstComment, commentVoteHash);

        const commentVoteAuthor = await commentVotes.voteToAuthor.call(commentVoteHash);
        assert.equal(commentVoteAuthor, accounts[0]);

    });

    it('Should store balances properly', async () => {
        const fee = await commentVotes.getTotalFee.call();
        const postAuthorBonus = await commentVotes.postAuthorBonus.call();
        const commentAuthorBonus = await commentVotes.commentAuthorBonus.call();

        const postAuthor = await posts.postToAuthor.call(postHash);
        const postAuthorBalance = await commentVotes.balances.call(postAuthor);
        assert.equal(Number(postAuthorBalance), Number(postAuthorBonus));

        const commentAuthor = (await comments.hashToComment.call(commentHash)).author;
        const commentAuthorBalance = await commentVotes.balances.call(commentAuthor);
        assert.equal(Number(commentAuthorBalance), Number(commentAuthorBonus));

        const contractOwner = await commentVotes.owner.call();
        const contractOwnerBalance = await commentVotes.balances.call(contractOwner);
        assert.equal(Number(contractOwnerBalance), Number(fee - postAuthorBonus - commentAuthorBonus));
    });

    it('Should not allow withdrawal of amounts larger than the balance', async () => {
        const postAuthor = await posts.postToAuthor.call(postHash);
        const balance = await commentVotes.balances.call(postAuthor);
        const amount = balance + 1;
        commentVotes.withdraw(amount, { from: postAuthor })
            .then(() => {
                return await.commentVotes.withdraw(amount, { from: postAuthor })
            })
            .then(() => assert.fail("CommentVotes: The withdrawal didn't fail"))
            .catch((e) => assert.include(e.reason, 'Not enough balance'));
    });

    it('Should not allow double withdrawal', async () => {
        const postAuthor = await posts.postToAuthor.call(postHash);
        const balance = await commentVotes.balances.call(postAuthor);

        await commentVotes.withdraw(balance, { from: postAuthor });
        commentVotes.withdraw(balance, { from: postAuthor })
            .then(() => assert.fail("CommentVotes: double-withdrawal didn't fail"))
            .catch(() => {});
    });

    it("Should log every change to the Posts' address", async () => {
        commentVotes.setPostsAddress(commentVotes.address)
            .then(result => {
                const {event, args} = result.logs[0];
                assert.equal(event, 'PostsAddressChanged');
                assert.equal(args.oldAddress, posts.address);
                assert.equal(args.newAddress, commentVotes.address);
            })
            .catch(console.error);
    });

    it("Doesn't allow to set Posts' address to 0", async () => {
        commentVotes.setPostsAddress(0)
            .then(() => assert.fail("CommentVotes: allowed to set Posts' address to 0"))
            .catch(() => {});
    });

    it("Should allow to change the Posts address only to the owner", async () => {
        commentVotes.setPostsAddress(posts.address, { from: accounts[1] })
            .then(() => assert.fail("CommentVotes: allowed non-owner to change Posts' address"))
            .catch(() => {});
    })
});
