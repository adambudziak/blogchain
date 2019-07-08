import axios from 'axios';

const API_URLS = {
    POST: 'http://localhost:8000/api/posts/',
}

function createPost(post) {
    return axios.post(API_URLS.POST, {
        title: post.title,
        content: post.content,
        creation_datetime: post.datetime
    });
}

export { createPost };