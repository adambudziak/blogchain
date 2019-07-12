import axios from 'axios';

const API_URLS = {
    POSTS: 'http://localhost:8000/api/posts/',
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

export { API_URLS, createPost };