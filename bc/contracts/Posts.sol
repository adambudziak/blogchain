pragma solidity >=0.4.21 < 0.6.0;

import "./Ownable.sol";

contract Posts is Ownable {
    uint addPostFee = 0.005 ether;

    struct Post {
        string date; // TODO the date is probably useless
        bytes32 contentHash;
    }

    Post[] public posts;

    function addPost(string calldata _date, bytes32 _contentHash) external payable {
        require(msg.value == addPostFee, "Not enough funds to add a post!");
        posts.push(Post(_date, _contentHash));
    }

    function getPostsCount() public view returns (uint) {
        return posts.length;
    }

    function withdraw() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }
}