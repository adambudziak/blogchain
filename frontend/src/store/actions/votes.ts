import {
  SUBMIT_COMMENT_VOTE,
  SUBMIT_POST_VOTE,
} from 'actions/types';

import { Web3Context } from "reducers/bc";

export type CommentVoteData = {
  commentId: number;
  isUpvote: boolean;
}

export type PostVoteData = {
  postId: number;
  isUpvote: boolean;
}

export type VoteData = CommentVoteData | PostVoteData;

export const submitPostVote = (web3Context: Web3Context, vote: PostVoteData, postHash: string) => ({
  type: SUBMIT_POST_VOTE.START,
  payload: { web3Context, vote, postHash }
});

export const submitCommentVote = (web3Context: Web3Context, vote: CommentVoteData, commentHash: string) => ({
  type: SUBMIT_COMMENT_VOTE.START,
  payload: { web3Context, vote, commentHash }
});

