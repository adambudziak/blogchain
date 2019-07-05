const PostsContainer = artifacts.require("PostsContainer");

module.exports = function(deployer) {
    deployer.deploy(PostsContainer);
}