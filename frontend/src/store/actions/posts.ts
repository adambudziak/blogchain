import {
    FETCH_POSTS,
    STORE_POST_START,
    FETCH_COMMENTS_FOR_POST_START, FETCH_POST_DETAILS,
} from 'actions/types';

import { Web3Context } from "reducers/bc";

// TODO where should we define types like these?
export type PostData = {title: string, content: string}
export interface BaseApiPost {
    author: string,
    title: string,
    id: number,
    verified: boolean,
    url: string,
    tags: string[],
    creation_datetime: string,
    data_hash: string,
    upvotes: number,
    downvotes: number,
    comments: number,
}

export interface ApiPost extends BaseApiPost {
    content_preview: string,
}

export interface ApiPostDetail extends BaseApiPost {
    content: string,
}

export type PostDetail = {
    loading: boolean,
    id: number | null,
    result: Error | ApiPostDetail | null,
}

export const fetchPosts = () => ({
    type: FETCH_POSTS,
});

export const fetchPostDetails = (postId: number) => ({
    type: FETCH_POST_DETAILS,
    payload: { postId },
});

export const fetchPostComments = (postId: number) => ({
    type: FETCH_COMMENTS_FOR_POST_START,
    payload: { postId },
});

export const submitPost = (web3Context: Web3Context, post: PostData) => ({
    type: STORE_POST_START,
    payload: { web3Context, post }
});
