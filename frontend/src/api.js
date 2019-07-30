import axios from 'axios';

const API_URLS = {
    POSTS: 'http://localhost:8000/api/posts/',
    POST_COMMENTS: 'http://localhost:8000/api/posts/<pk>/comments/',
    POST_VOTES: 'http://localhost:8000/api/posts/<pk>/votes/',
    POST_UPVOTES: 'http://localhost:8000/api/posts/<pk>/upvotes/',
    POST_DOWNVOTES: 'http://localhost:8000/api/posts/<pk>/downvotes/',
    COMMENTS: 'http://localhost:8000/api/comments/',
    COMMENT_VOTES: 'http://localhost:8000/api/comments/<pk>/votes/',
    COMMENT_UPVOTES: 'http://localhost:8000/api/comments/<pk>/upvotes/',
    COMMENT_DOWNVOTES: 'http://localhost:8000/api/comments/<pk>/downvotes/',
};

function defaultConfig() {
  return {
    headers: {
      'Authorization': 'Token ' + localStorage.getItem('token')
    }
  };
}

function createPost(post) {
  return axios.post(API_URLS.POSTS, {
      title: post.title,
      content: post.content,
      creation_datetime: post.datetime,
      data_hash: post.hash,
  }, defaultConfig());
}

function createComment(comment) {
  return axios.post(API_URLS.COMMENTS, {
    content: comment.content,
    creation_datetime: comment.datetime,
    data_hash: comment.hash,
    post: comment.post,
  }, defaultConfig());
}

function createPostVote(vote) {
  return axios.post(API_URLS.POST_VOTES.replace('<pk>', vote.postId), {
    post: vote.postId,
    is_upvote: vote.isUpvote,
    data_hash: vote.hash,
    creation_datetime: vote.datetime,
  }, defaultConfig());
}

function createCommentVote(vote) {
    return axios.post(API_URLS.COMMENT_VOTES.replace('<pk>', vote.commentId), {
        comment: vote.commentId,
        is_upvote: vote.isUpvote,
        data_hash: vote.hash,
        creation_datetime: vote.datetime,
    }, defaultConfig());
}

export { API_URLS, createPost, createComment, createPostVote, createCommentVote };
