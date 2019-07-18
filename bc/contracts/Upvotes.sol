pragma solidity >=0.4.21 < 0.6.0;

import "./Votes.sol";

contract Upvotes is Votes {

    function getUpvoteCount() public view returns(uint) {
        return Votes.getVoteCount();
    }

    function getUpvoteCountForPost(bytes32 post_hash) external view returns(uint) {
        return Votes.getVoteCountForPost(post_hash);
    }
}