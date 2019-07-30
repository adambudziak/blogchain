pragma solidity >=0.4.21 < 0.6.0;

import "./Votes.sol";

contract Downvotes is Votes {

    function getPostsDownvoteCount() public view returns(uint) {
        return Votes.getPostsVoteCount();
    }

    function getCommentsDownvoteCount() public view returns(uint) {
        return Votes.getCommentsVoteCount();
    }

    function getDownvoteCountForPost(bytes32 post_hash) external view returns(uint) {
        return Votes.getVoteCountForPost(post_hash);
    }

    function getDownvoteCountForComment(bytes32 comment_hash) external view returns(uint) {
        return Votes.getVoteCountForComment(comment_hash);
    }
}
