pragma solidity >=0.4.21 < 0.6.0;

import "./Ownable.sol";

contract Posts is Ownable {
    struct Post {
        uint id;
        string date;
        string contentHash;
    }

    Post[] public posts;

    function addPost(string calldata _date, string calldata _contentHash) external payable {
        posts.push(Post(posts.length + 1, _date, _contentHash));
    }

    function getPostsCount() public view returns (uint) {
        return posts.length;
    }

    function withdraw() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }
}