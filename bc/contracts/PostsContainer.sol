pragma solidity >=0.4.21 < 0.6.0;

contract PostsContainer {
    struct Post {
        string date;
        string contentHash;
    }

    Post[] public posts;

    function addPost(string memory _date, string memory _contentHash) public {
        posts.push(Post(_date, _contentHash));
    }

}