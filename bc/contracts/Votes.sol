pragma solidity >=0.4.21 < 0.6.0;

import "./Ownable.sol";

contract Votes is Ownable {

    uint voteFee = 0.001 ether;

     struct Vote {
         bytes32 vote_hash;
         bytes32 target_hash;
     }

    Vote[] public posts_votes;
    Vote[] public comments_votes;

    function voteForPost(bytes32 _vote_hash, bytes32 _target_hash) external payable {
        require(msg.value == voteFee, "Not enough funds to vote!");
        posts_votes.push(Vote(_vote_hash, _target_hash));
    }

    function voteForComment(bytes32 _vote_hash, bytes32 _target_hash) external payable {
        require(msg.value == voteFee, "Not enough funds to vote!");
        comments_votes.push(Vote(_vote_hash, _target_hash));
    }

    function getPostsVoteCount() internal view returns(uint) {
        return posts_votes.length;
    }

    function getCommentsVoteCount() internal view returns(uint) {
        return comments_votes.length;
    }

    function getVoteCountForPost(bytes32 post_hash) internal view returns(uint) {
        uint count = 0;
        for (uint index = 0; index < posts_votes.length; index++) {
            if (posts_votes[index].target_hash == post_hash) {
                count++;
            }
        }
        return count;
    }

    function getVoteCountForComment(bytes32 comment_hash) internal view returns(uint) {
        uint count = 0;
        for (uint index = 0; index < comments_votes.length; index++) {
            if (comments_votes[index].target_hash == comment_hash) {
                count++;
            }
        }
        return count;
    }

    function withdraw() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }
}
