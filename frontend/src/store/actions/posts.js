import { FETCH_POSTS } from '../actions/actionTypes';
import axios from 'axios';
import { API_URLS } from '../../api';

export const fetchPosts = () => dispatch => {
    axios.get(API_URLS.POSTS).then(response => dispatch({
        type: FETCH_POSTS,
        payload: response.data
    }));
}