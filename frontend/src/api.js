import axios from 'axios';

const API_URLS = {
    POSTS: 'http://localhost:8000/api/posts/',
    POST_COMMENTS: 'http://localhost:8000/api/posts/<pk>/comments/',
    COMMENTS: 'http://localhost:8000/api/comments/',
}

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

export { API_URLS, createPost, createComment };