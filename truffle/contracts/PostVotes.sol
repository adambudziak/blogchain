pragma solidity >=0.5.8 < 0.6.0;

import "./Posts.sol";
import "./Ownable.sol";

contract PostVotes is Ownable {
    uint public voteFee = 0.001 ether;
    uint public postAuthorBonus = 0.001 ether;

    event VoteAdded(bytes32 indexed hash, bytes32 indexed postHash, address indexed author);
    event PostsAddressChanged(address indexed oldAddress, address indexed newAddress);

    address private postsAddress;
    Posts private posts;

    struct Vote {
        bytes32 hash;
    }

    Vote[] public votes;
    mapping (bytes32 => address) public voteToAuthor;

    mapping (address => uint) public balances;
    mapping (bytes32 => uint) public totalBalances;

    constructor(address _postsAddress) public {
        postsAddress = _postsAddress;
        posts = Posts(postsAddress);
    }

    function getVoteCount() external view returns(uint) {
        return votes.length;
    }

    function getTotalFee() public view returns(uint) {
        return voteFee + postAuthorBonus;
    }

    function addVote(bytes32 _hash, bytes32 _postHash) external payable {
        require(msg.value == getTotalFee(),
                "Not enough funds to add a vote!");

        address postAuthor = posts.postToAuthor(_postHash);
        require(balances[postAuthor] + postAuthorBonus > balances[postAuthor]);
        require(totalBalances[_postHash] + postAuthorBonus > totalBalances[_postHash]);

        emit VoteAdded(_hash, _postHash, msg.sender);
        votes.push(Vote(_hash));
        voteToAuthor[_hash] = msg.sender;
        balances[postAuthor] += postAuthorBonus;
        balances[owner()] += voteFee;
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
