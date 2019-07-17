const Posts = artifacts.require("Posts");
const Comments = artifacts.require("Comments");
const fs = require('fs');

const globalConfig = require('./config/global');

module.exports = async (deployer) => {
    await deployer.deploy(Posts);
    await deployer.deploy(Comments);

    fs.writeFileSync(globalConfig.deploymentFile, JSON.stringify({
        Posts: Posts.address,
        Comments: Comments.address,
    }));
}