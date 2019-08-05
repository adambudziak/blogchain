import {
    FETCH_POSTS,
    STORE_POST_START,
    STORE_POST_SERVER_SUCCESS,
    STORE_POST_SERVER_FAIL,
    STORE_POST_BC_FAIL,
    STORE_POST_BC_SUCCESS,
    FETCH_COMMENTS_FOR_POST,
    FETCH_VOTES_FOR_POST,
    FETCH_UPVOTES_FOR_POST,
    FETCH_DOWNVOTES_FOR_POST,
} from './types';

import moment from 'moment';
import axios from 'axios';
import { getUser } from '../utility';
import { API_URLS, createPost } from '../../api';
import {Dispatch} from "redux";
import Web3 from 'web3';
import {Web3Context} from "../reducers/bc";

// TODO where should we define types like these?
export type PostData = {title: string, content: string}
export type ApiPost = {
    author: string,
    title: string,
    content: string,
    id: number,
    verified: boolean,
    url: string,
    tags: string[],
    creation_datetime: string,
    data_hash: string,
}

export const fetchPosts = (dispatch: Dispatch) => {
    axios.get(API_URLS.POSTS).then(response => dispatch({
        type: FETCH_POSTS,
        payload: response.data.results,
    }));
};

const fetchPostDetails = (postId: number, apiUrl: string, type: string, dispatch: Dispatch) => {
    axios.get(apiUrl.replace('<pk>', String(postId)))
    .then(response => dispatch({
        type,
        payload: response.data,
        postId
    }))
    .catch(error => {
        if (error.message.indexOf('404') === -1) {
            console.error(error);
        }
    })
};

export const fetchCommentsForPost = (postId: number) => (dispatch: Dispatch) => {
    return fetchPostDetails(
        postId,
        API_URLS.POST_COMMENTS,
        FETCH_COMMENTS_FOR_POST,
        dispatch
    );
};

export const fetchVotesForPost = (postId: number) => (dispatch: Dispatch) => {
    return fetchPostDetails(
        postId,
        API_URLS.POST_VOTES,
        FETCH_VOTES_FOR_POST,
        dispatch,
    );
};

export const fetchUpvotesForPost = (postId: number) => (dispatch: Dispatch) => {
    return fetchPostDetails(
        postId,
        API_URLS.POST_UPVOTES,
        FETCH_UPVOTES_FOR_POST,
        dispatch,
    );
};

export const fetchDownvotesForPost = (postId: number) => (dispatch: Dispatch) => {
    return fetchPostDetails(
        postId,
        API_URLS.POST_DOWNVOTES,
        FETCH_DOWNVOTES_FOR_POST,
        dispatch,
    );
};


const storePostStart = () => {
    return {
        type: STORE_POST_START,
    };
};

const storePostServerSuccess = () => {
    return {
        type: STORE_POST_SERVER_SUCCESS,
    };
};

const storePostServerFail = (error: Error) => {
    return {
        type: STORE_POST_SERVER_FAIL,
        error,
    };
};

const storePostBcSuccess = () => {
    return {
        type: STORE_POST_BC_SUCCESS,
    };
};

const storePostBcFail = (error: Error) => {
    return {
        type: STORE_POST_BC_FAIL,
        error,
    };
};

// TODO it's annoying to pass the dispatch here via an argument but I don't know
//      how to make it better.
export const storePost = (web3Context: Web3Context, post: PostData) => (dispatch: Dispatch) => {
    dispatch(storePostStart());
    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    const author = getUser();
    const hash = hashPost(web3Context.web3, post, author, now);
    createPost({
        title: post.title,
        content: post.content,
        datetime: now,
        hash,
    })
    .then(_response => {
        dispatch(storePostServerSuccess());
        web3Context.postsContract.methods.addPost(String(now), hash)
        .send({
            from: web3Context.account,
            value: web3Context.web3.utils.toWei('0.005', 'ether')
        })
        .on('confirmation', () => dispatch(storePostBcSuccess()))
        .on('error', (error: Error) => dispatch(storePostBcFail(error)));
    })
    .catch(error => dispatch(storePostServerFail(error)));
};


function hashPost(web3: Web3, post: PostData, author: string, now: string) {
    const digest = author + now + post.title + post.content;
    return web3.utils.keccak256(digest);
}
