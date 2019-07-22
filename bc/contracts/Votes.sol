pragma solidity >=0.4.21 < 0.6.0;

import "./Ownable.sol";

contract Votes is Ownable {

    uint voteFee = 0.001 ether;

     struct Vote {
         bytes32 vote_hash;
         bytes32 post_hash;
     }

    Vote[] public votes;

    function vote(bytes32 _vote_hash, bytes32 _post_hash) external payable {
        require(msg.value == voteFee, "Not enough funds to vote!");
        votes.push(Vote(_vote_hash, _post_hash));
    }

    function getVoteCount() internal view returns(uint) {
        return votes.length;
    }

    function getVoteCountForPost(bytes32 post_hash) internal view returns(uint) {
        uint count = 0;
        for (uint index = 0; index < votes.length; index++) {
            if (votes[index].post_hash == post_hash) {
                count++;
            }
        }
        return count;
    }

    function withdraw() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }
}