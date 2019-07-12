const Posts = artifacts.require("Posts");
const CommentStore = artifacts.require("CommentStore");
const fs = require('fs');

const globalConfig = require('./config/global');

module.exports = async (deployer) => {
    await deployer.deploy(Posts);
    await deployer.deploy(CommentStore);

    fs.writeFileSync(globalConfig.deploymentFile, JSON.stringify({
        posts: Posts.address,
        comment_store: CommentStore.address,
    }));
}