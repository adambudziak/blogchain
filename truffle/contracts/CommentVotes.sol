pragma solidity >=0.5.8 < 0.6.0;

import "./Ownable.sol";
import "./Posts.sol";
import "./Comments.sol";

contract CommentVotes is Ownable {
    uint public voteFee = 0.001 ether;
    uint public postAuthorBonus = 0.0005 ether;
    uint public commentAuthorBonus = 0.0005 ether;

    event VoteAdded(bytes32 indexed hash, bytes32 indexed commentHash, address indexed author);
    event PostsAddressChanged(address indexed oldAddress, address indexed newAddress);
    event CommentsAddressChanged(address indexed oldAddress, address indexed newAddress);

    address private postsAddress;
    address private commentsAddress;

    Posts private posts;
    Comments private comments;

    struct Vote {
        bytes32 hash;
    }

    Vote[] public votes;
    mapping (bytes32 => address) public voteToAuthor;

    mapping (address => uint) public balances;
    mapping (bytes32 => uint) public totalBalances;

    constructor(address _postsAddress, address _commentsAddress) public {
        postsAddress = _postsAddress;
        posts = Posts(postsAddress);
        commentsAddress = _commentsAddress;
        comments = Comments(commentsAddress);
    }

    function getVoteCount() external view returns(uint) {
        return votes.length;
    }

    function getTotalFee() public view returns(uint) {
        return voteFee + postAuthorBonus + commentAuthorBonus;
    }

    function addVote(bytes32 _hash, bytes32 _commentHash) external payable {
        require(msg.value == getTotalFee(),
                "Not enough funds to add a vote!");

        (address commentAuthor, bytes32 postHash) = comments.hashToComment(_commentHash);
        address postAuthor = posts.postToAuthor(postHash);

        require(balances[postAuthor] + postAuthorBonus > balances[postAuthor]);
        require(balances[commentAuthor] + commentAuthorBonus > balances[commentAuthor]);
        require(totalBalances[_commentHash] + commentAuthorBonus > totalBalances[_commentHash]);

        emit VoteAdded(_hash, _commentHash, msg.sender);
        votes.push(Vote(_hash));
        voteToAuthor[_hash] = msg.sender;
        balances[postAuthor] += postAuthorBonus;
        balances[commentAuthor]  += commentAuthorBonus;
        balances[owner()] += voteFee;
        totalBalances[_commentHash] += commentAuthorBonus;
    }

    function setPostsAddress(address _newPostsAddress) external onlyOwner {
        require(_newPostsAddress != address(0), "Posts contract's address cannot be 0");
        emit PostsAddressChanged(postsAddress, _newPostsAddress);
        postsAddress = _newPostsAddress;
        posts = Posts(_newPostsAddress);
    }

    function setCommentsAddress(address _newCommentsAddress) external onlyOwner {
        require(_newCommentsAddress != address(0), "Posts contract's address cannot be 0");
        emit CommentsAddressChanged(commentsAddress, _newCommentsAddress);
        commentsAddress = _newCommentsAddress;
        comments = Comments(_newCommentsAddress);
    }

    function withdraw(uint amount) external {
        require(amount <= balances[msg.sender], "Not enough balance to withdraw");
        balances[msg.sender] -= amount;
        msg.sender.transfer(amount);
    }
}
