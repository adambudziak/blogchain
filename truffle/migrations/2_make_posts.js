const Posts = artifacts.require("Posts");
const Comments = artifacts.require("Comments");
const PostVotes = artifacts.require("PostVotes");
const CommentVotes = artifacts.require("CommentVotes");
const fs = require('fs');

const globalConfig = require('./config/global');

module.exports = async (deployer) => {
    await deployer.deploy(Posts);
    await deployer.deploy(Comments, Posts.address);
    await deployer.deploy(PostVotes, Posts.address);
    await deployer.deploy(CommentVotes, Posts.address, Comments.address);

    fs.writeFileSync(globalConfig.deploymentFile, JSON.stringify({
        Posts: Posts.address,
        Comments: Comments.address,
        PostVotes: PostVotes.address,
        CommentVotes: CommentVotes.address,
    }));
};
