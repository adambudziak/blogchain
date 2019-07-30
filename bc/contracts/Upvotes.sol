pragma solidity >=0.4.21 < 0.6.0;

import "./Votes.sol";

contract Upvotes is Votes {

    function getPostsUpvoteCount() public view returns(uint) {
        return Votes.getPostsVoteCount();
    }

    function getCommentsUpvoteCount() public view returns(uint) {
        return Votes.getCommentsVoteCount();
    }

    function getUpvoteCountForPost(bytes32 post_hash) external view returns(uint) {
        return Votes.getVoteCountForPost(post_hash);
    }

    function getUpvoteCountForComment(bytes32 comment_hash) external view returns(uint) {
        return Votes.getVoteCountForComment(comment_hash);
    }
}
