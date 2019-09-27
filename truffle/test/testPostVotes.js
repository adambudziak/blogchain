const PostVotes = artifacts.require('PostVotes');
const Posts = artifacts.require('Posts');

contract('PostVotes', async accounts => {
    let posts;
    let postHash;
    let postVotes;

    before('Deploy posts contract and add a post', async () => {
        posts = await Posts.deployed();
        postHash = web3.utils.keccak256('Some post');
        const postAuthor = accounts[accounts.length-1];
        const fee = await posts.addPostFee.call();
        await posts.addPost(postHash, {value: fee, from: postAuthor});
    });

    it('Should add a postVote correctly', async () => {
        postVotes = await PostVotes.deployed(posts.address);

        const postVoteCountBefore = await postVotes.getVoteCount.call();
        assert.equal(postVoteCountBefore, 0);

        const fee = await postVotes.getTotalFee.call();

        const postVoteHash = web3.utils.keccak256('Some content');
        const result = await postVotes.addVote(postVoteHash, postHash, { value: fee});
        const { event, args } = result.logs[0];
        assert.equal(event, 'VoteAdded');
        assert.equal(args.hash, postVoteHash);
        assert.equal(args.postHash, postHash);
        assert.equal(args.author, accounts[0]);

        const postVoteCountAfter = await postVotes.getVoteCount.call();
        assert.equal(postVoteCountAfter, 1);

        const firstComment = await postVotes.votes.call(0);
        assert.equal(firstComment, postVoteHash);

        const postVoteAuthor = await postVotes.voteToAuthor.call(postVoteHash);
        assert.equal(postVoteAuthor, accounts[0]);

    });

    it('Should store balances properly', async () => {
        const fee = await postVotes.getTotalFee.call();
        const postAuthorBonus = await postVotes.postAuthorBonus.call();

        const postAuthor = await posts.postToAuthor.call(postHash);
        const postAuthorBalance = await postVotes.balances.call(postAuthor);
        assert.equal(Number(postAuthorBalance), Number(postAuthorBonus));

        const contractOwner = await postVotes.owner.call();
        const contractOwnerBalance = await postVotes.balances.call(contractOwner);
        assert.equal(Number(contractOwnerBalance), Number(fee - postAuthorBonus));
    });

    it('Should not allow withdrawal of amounts larger than the balance', async () => {
        const postAuthor = await posts.postToAuthor.call(postHash);
        const balance = await postVotes.balances.call(postAuthor);
        const amount = balance + 1;
        postVotes.withdraw(amount, { from: postAuthor })
            .then(() => {
                return await.postVotes.withdraw(amount, { from: postAuthor })
            })
            .then(() => assert.fail("PostVotes: The withdrawal didn't fail"))
            .catch((e) => assert.include(e.reason, 'Not enough balance'));
    });

    it('Should not allow double withdrawal', async () => {
        const postAuthor = await posts.postToAuthor.call(postHash);
        const balance = await postVotes.balances.call(postAuthor);

        await postVotes.withdraw(balance, { from: postAuthor });
        postVotes.withdraw(balance, { from: postAuthor })
            .then(() => assert.fail("PostVotes: double-withdrawal didn't fail"))
            .catch(() => {});
    });

    it("Should log every change to the Posts' address", async () => {
        postVotes.setPostsAddress(postVotes.address)
            .then(result => {
                const {event, args} = result.logs[0];
                assert.equal(event, 'PostsAddressChanged');
                assert.equal(args.oldAddress, posts.address);
                assert.equal(args.newAddress, postVotes.address);
            })
            .catch(console.error);
    });

    it("Doesn't allow to set Posts' address to 0", async () => {
        postVotes.setPostsAddress(0)
            .then(() => assert.fail("PostVotes: allowed to set Posts' address to 0"))
            .catch(() => {});
    });

    it("Should allow to change the Posts address only to the owner", async () => {
        postVotes.setPostsAddress(posts.address, { from: accounts[1] })
            .then(() => assert.fail("PostVotes: allowed non-owner to change Posts' address"))
            .catch(() => {});
    })
});
