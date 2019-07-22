pragma solidity >=0.4.21 < 0.6.0;

import "./Ownable.sol";

contract Comments is Ownable {

    uint addCommentFee = 0.001 ether;

    struct Comment {
        bytes32 content_hash;
        bytes32 post_hash;
    }

    Comment[] public comments;

    function addComment(bytes32 _content_hash, bytes32 _post_hash) external payable {
        require(msg.value == addCommentFee, "Not enough funds to add a comment!");
        comments.push(Comment(_content_hash, _post_hash));
    }

    function getCommentCount() external view returns(uint) {
        return comments.length;
    }

    function withdraw() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }
}
