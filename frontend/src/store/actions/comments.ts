import {
    SUBMIT_COMMENT_START,
} from 'actions/types';

import { Web3Context } from "reducers/bc";

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
    upvotes: number,
    downvotes: number,
}

export const submitComment = (web3Context: Web3Context, comment: CommentData, postHash: string) => ({
    type: SUBMIT_COMMENT_START,
    payload: { web3Context, comment, postHash }
});
