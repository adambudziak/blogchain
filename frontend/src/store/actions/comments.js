import {
    FETCH_COMMENTS,
    SUBMIT_COMMENT_START,
    SUBMIT_COMMENT_SERVER_SUCCESS,
    SUBMIT_COMMENT_SERVER_FAIL,
    SUBMIT_COMMENT_BC_SUCCESS,
    SUBMIT_COMMENT_BC_FAIL,
} from './types';

import moment from 'moment';
import axios from 'axios';
import { API_URLS, createComment } from '../../api';
import { getUser } from '../utility';

export const fetchComments = () => dispatch => {
    axios.get(API_URLS.COMMENTS).then(response => dispatch({
        type: FETCH_COMMENTS,
        payload: response.data.results,
    }));
}

const submitCommentStart = () => {
    return {
        type: SUBMIT_COMMENT_START,
    }
}

const submitCommentServerFail = error => {
    return {
        type: SUBMIT_COMMENT_SERVER_FAIL,
        error,
    }
}

const submitCommentServerSuccess = () => {
    return {
        type: SUBMIT_COMMENT_SERVER_SUCCESS,
    }
}

const submitCommentBcSuccess = () => {
    return {
        type: SUBMIT_COMMENT_BC_SUCCESS,
    }
}

const submitCommentBcFail = error => {
    return {
        type: SUBMIT_COMMENT_BC_FAIL,
        error
    }
}

export const submitComment = (web3Context, comment, postHash) => dispatch => {
    dispatch(submitCommentStart());
    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    const author = getUser();
    const hash = hashComment(web3Context.web3, comment, author, now);
    const post_url = API_URLS.POSTS + comment.postId + '/';
    createComment({
        content: comment.content,
        datetime: now,
        hash,
        post: post_url,
    })
    .then(_response => {
        dispatch(submitCommentServerSuccess());
        web3Context.commentsContract.methods.addComment(hash, postHash)
        .send({
            from: web3Context.currentAccount,
            value: web3Context.web3.utils.toWei('0.001', 'ether')
        })
        .on('confirmation' , () => dispatch(submitCommentBcSuccess()))
        .on('error', error => dispatch(submitCommentBcFail(error)));
    })
    .catch(error => {
        console.error(error);
        dispatch(submitCommentServerFail(error));
    })
}

function hashComment(web3, comment, author, now) {
    const digest = author + now + comment.content;
    return web3.utils.keccak256(digest);
}