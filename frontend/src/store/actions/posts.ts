import {
    FETCH_POSTS,
    STORE_POST_START,
    FETCH_COMMENTS_FOR_POST_START,
    FETCH_UPVOTES_FOR_POST_START,
    FETCH_DOWNVOTES_FOR_POST_START,
} from './types';

import { Web3Context } from "../reducers/bc";

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

export const fetchPosts = () => ({
    type: FETCH_POSTS,
});

export const fetchPostComments = (postId: number) => ({
    type: FETCH_COMMENTS_FOR_POST_START,
    payload: { postId },
});

export const fetchPostUpvotes = (postId: number) => ({
    type: FETCH_UPVOTES_FOR_POST_START,
    payload: { postId },
});

export const fetchPostDownvotes = (postId: number) => ({
    type: FETCH_DOWNVOTES_FOR_POST_START,
    payload: { postId },
});

export const submitPost = (web3Context: Web3Context, post: PostData) => ({
    type: STORE_POST_START,
    payload: { web3Context, post }
});
