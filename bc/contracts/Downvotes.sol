pragma solidity >=0.4.21 < 0.6.0;

import "./Votes.sol";

contract Downvotes is Votes {

    function getDownvoteCount() public view returns(uint) {
        return Votes.getVoteCount();
    }

    function getDownvoteCountForPost(bytes32 post_hash) external view returns(uint) {
        return Votes.getVoteCountForPost(post_hash);
    }
}