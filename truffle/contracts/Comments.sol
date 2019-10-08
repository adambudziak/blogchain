pragma solidity >=0.5.8 < 0.6.0;

import "./Posts.sol";
import "./Ownable.sol";

contract Comments is Ownable {
    uint public addCommentFee = 0.002 ether;
    uint public postAuthorBonus = 0.002 ether;

    event CommentAdded(bytes32 indexed hash, bytes32 indexed postHash, address indexed author);
    event PostsAddressChanged(address indexed oldAddress, address indexed newAddress);

    address private postsAddress = address(0);
    Posts private posts;

    struct Comment {
        address author;
        bytes32 postHash;
    }

    bytes32[] public comments;
    mapping (bytes32 => Comment) public hashToComment;

    mapping (address => uint) public balances;
    mapping (bytes32 => uint) public totalBalances;

    constructor(address _postsAddress) public {
        postsAddress = _postsAddress;
        posts = Posts(postsAddress);
    }

    function getCommentCount() external view returns(uint) {
        return comments.length;
    }

    function getTotalFee() external view returns(uint) {
        return addCommentFee + postAuthorBonus;
    }

    function addComment(bytes32 _hash, bytes32 _postHash) external payable {
        require(msg.value == addCommentFee + postAuthorBonus,
            "Not enough funds to add a comment!");

        address postAuthor = posts.postToAuthor(_postHash);
        require(balances[postAuthor] + postAuthorBonus > balances[postAuthor]);
        require(totalBalances[_postHash] + postAuthorBonus > totalBalances[_postHash]);

        emit CommentAdded(_hash, _postHash, msg.sender);
        comments.push(_hash);
        hashToComment[_hash] = Comment(msg.sender, _postHash);
        balances[postAuthor] += postAuthorBonus;
        balances[owner()] += addCommentFee;
        totalBalances[_postHash] += postAuthorBonus;
    }

    function setPostsAddress(address _newPostsAddress) external onlyOwner {
        require(_newPostsAddress != address(0), "Posts contract's address cannot be 0");
        emit PostsAddressChanged(postsAddress, _newPostsAddress);
        postsAddress = _newPostsAddress;
        posts = Posts(_newPostsAddress);
    }

    function withdraw(uint amount) external {
        require(amount <= balances[msg.sender], "Not enough balance to withdraw");
        balances[msg.sender] -= amount;
        msg.sender.transfer(amount);
    }
}
