const Comments = artifacts.require('Comments');
const Posts = artifacts.require('Posts');

contract('Comments', async accounts => {
    let posts;
    let firstPostHash;
    let comments;

    before('Deploy posts contract and add a post', async () => {
        posts = await Posts.deployed();
        firstPostHash = web3.utils.keccak256('Some post');
        const postAuthor = accounts[accounts.length-1];
        const fee = await posts.addPostFee.call();
        await posts.addPost(firstPostHash, {value: fee, from: postAuthor});
    });

    it('Should add a comment correctly', async () => {
        comments = await Comments.deployed(posts.address);

        const commentCountBefore = await comments.getCommentCount.call();
        assert.equal(commentCountBefore, 0);

        const fee = await comments.getTotalFee.call();

        const commentHash = web3.utils.keccak256('Some content');
        const result = await comments.addComment(commentHash, firstPostHash, { value: fee});
        const { event, args } = result.logs[0];
        assert.equal(event, 'CommentAdded');
        assert.equal(args.hash, commentHash);
        assert.equal(args.postHash, firstPostHash);
        assert.equal(args.author, accounts[0]);

        const commentCountAfter = await comments.getCommentCount.call();
        assert.equal(commentCountAfter, 1);

        const firstComment = await comments.comments.call(0);
        assert.equal(firstComment, commentHash);

        const { author, postHash } = await comments.hashToComment.call(commentHash);
        assert.equal(author, accounts[0]);
        assert.equal(firstPostHash, postHash);
    });

    it('Should store balances properly', async () => {
        const fee = await comments.getTotalFee.call();
        const postAuthorBonus = await comments.postAuthorBonus.call();

        const postAuthor = await posts.postToAuthor.call(firstPostHash);
        const postAuthorBalance = await comments.balances.call(postAuthor);
        assert.equal(Number(postAuthorBalance), Number(postAuthorBonus));

        const contractOwner = await comments.owner.call();
        const contractOwnerBalance = await comments.balances.call(contractOwner);
        assert.equal(Number(contractOwnerBalance), Number(fee - postAuthorBonus));
    });

    it('Should not allow withdrawal of amounts larger than the balance', async () => {
        const postAuthor = await posts.postToAuthor.call(firstPostHash);
        const balance = await comments.balances.call(postAuthor);
        const amount = balance + 1;
        comments.withdraw(amount, { from: postAuthor })
            .then(() => {
                return await.comments.withdraw(amount, { from: postAuthor })
            })
            .then(() => assert.fail("Comments: The withdrawal didn't fail"))
            .catch((e) => assert.include(e.reason, 'Not enough balance'));
    });

    it('Should not allow double withdrawal', async () => {
        const postAuthor = await posts.postToAuthor.call(firstPostHash);
        const balance = await comments.balances.call(postAuthor);

        await comments.withdraw(balance, { from: postAuthor });
        comments.withdraw(balance, { from: postAuthor })
            .then(() => assert.fail("Comments: double-withdrawal didn't fail"))
            .catch(() => {});
    });

    it("Should log every change to the Posts' address", async () => {
        comments.setPostsAddress(comments.address)
            .then(result => {
                const {event, args} = result.logs[0];
                assert.equal(event, 'PostsAddressChanged');
                assert.equal(args.oldAddress, posts.address);
                assert.equal(args.newAddress, comments.address);
            })
            .catch(console.error);
    });

    it("Doesn't allow to set Posts' address to 0", async () => {
        comments.setPostsAddress(0)
            .then(() => assert.fail("Comments: allowed to set Posts' address to 0"))
            .catch(() => {});
    });

    it("Should allow to change the Posts address only to the owner", async () => {
        comments.setPostsAddress(posts.address, { from: accounts[1] })
            .then(() => assert.fail("Comments: allowed non-owner to change Posts' address"))
            .catch(() => {});
    })
});
