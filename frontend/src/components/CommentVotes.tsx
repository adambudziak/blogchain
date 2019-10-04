import React from 'react';

import { ApiComment } from "actions/comments";

interface Props {
  comment: ApiComment;
  submitVote: (comment: {commentId: number; isUpvote: boolean}) => void;
}

const CommentVotes = (props: Props) => (
  <div>
    <div>{props.comment.upvotes} upvotes</div>
    <div>{props.comment.downvotes} downvotes</div>
    <button onClick={() => {props.submitVote({commentId: props.comment.id, isUpvote: true})}}>Upvote</button>
    <button onClick={() => {props.submitVote({commentId: props.comment.id, isUpvote: false})}}>Downvote</button>
  </div>

);

export default CommentVotes;
