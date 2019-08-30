pragma solidity >=0.5.8 < 0.6.0;

import "./Ownable.sol";

contract Posts is Ownable {
    uint public addPostFee = 0.005 ether;

    struct Post {
        bytes32 hash;
    }

    event PostAdded(bytes32 indexed hash, address indexed author);

    Post[] public posts;
    mapping (bytes32 => address) public postToAuthor;

    function addPost(bytes32 _hash) external payable {
        require(msg.value == addPostFee, "Not enough funds to add a post!");
        emit PostAdded(_hash, msg.sender);
        posts.push(Post(_hash));
        postToAuthor[_hash] = msg.sender;
    }

    function getPostCount() public view returns(uint) {
        return posts.length;
    }

    function withdraw() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

}
