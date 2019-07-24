const Posts = artifacts.require("Posts");
const Comments = artifacts.require("Comments");
const Upvotes = artifacts.require("Upvotes");
const Downvotes = artifacts.require("Downvotes");
const fs = require('fs');

const globalConfig = require('./config/global');

module.exports = async (deployer) => {
    await deployer.deploy(Posts);
    await deployer.deploy(Comments);
    await deployer.deploy(Upvotes);
    await deployer.deploy(Downvotes);

    fs.writeFileSync(globalConfig.deploymentFile, JSON.stringify({
        Posts: Posts.address,
        Comments: Comments.address,
        Upvotes: Upvotes.address,
        Downvotes: Downvotes.address,
    }));
};
