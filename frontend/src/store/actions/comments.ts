import {
    FETCH_COMMENTS,
    SUBMIT_COMMENT_START,
    FETCH_UPVOTES_FOR_COMMENT,
    FETCH_DOWNVOTES_FOR_COMMENT,
} from './types';

import axios from 'axios';

import { API_URLS } from '../../api';
import {Dispatch} from "redux";
import {Web3Context} from "../reducers/bc";

export type CommentData = {postId: number, content: string}
export type ApiComment = {
    author: string,
    id: number,
    post: string,
    url: string,
    verified: boolean,
    creation_datetime: string,
    data_hash: string,
    content: string,
}

export const fetchComments = (dispatch: Dispatch) => {
    axios.get(API_URLS.COMMENTS).then(response => dispatch({
        type: FETCH_COMMENTS,
        payload: response.data.results,
    }));
};

export const submitComment = (web3Context: Web3Context, comment: CommentData, postHash: string) => ({
    type: SUBMIT_COMMENT_START,
    payload: { web3Context, comment, postHash }
});

const fetchCommentDetails = (commentId: number, apiUrl: string, type: string, dispatch: Dispatch) => {
    axios.get(apiUrl.replace('<pk>', String(commentId)))
        .then(response => dispatch({
            type,
            payload: response.data,
            commentId
        }))
        .catch(error => {
            if (error.message.indexOf('404') === -1) {
                console.error(error);
            }
        })
};

export const fetchUpvotesForComment = (commentId: number) => (dispatch: Dispatch) => {
    return fetchCommentDetails(
        commentId,
        API_URLS.COMMENT_UPVOTES,
        FETCH_UPVOTES_FOR_COMMENT,
        dispatch,
    );
};

export const fetchDownvotesForComment = (commentId: number) => (dispatch: Dispatch) => {
    return fetchCommentDetails(
        commentId,
        API_URLS.COMMENT_DOWNVOTES,
        FETCH_DOWNVOTES_FOR_COMMENT,
        dispatch,
    );
};
