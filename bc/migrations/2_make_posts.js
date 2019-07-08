const Posts = artifacts.require("Posts");

module.exports = function(deployer) {
    deployer.deploy(Posts);
}