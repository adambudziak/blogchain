import axios from 'axios';

const API_URLS = {
    POST: 'http://localhost:8000/api/posts/',
}

function createPost(post) {
    const config = {
      headers: {
        'Authorization': 'Token ' + localStorage.getItem('token')
      }
    };
    return axios.post(API_URLS.POST, {
        title: post.title,
        content: post.content,
        creation_datetime: post.datetime,
        data_hash: post.hash,
    }, config);
}

export { createPost };