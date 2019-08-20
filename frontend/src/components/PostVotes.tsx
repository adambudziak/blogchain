import React from 'react';

import { ApiPost } from "actions/posts";

interface Props {
    post: ApiPost,
    submitVote: (post: {postId: number, isUpvote: boolean}) => void,
}

const PostVotes = (props: Props) => (
    <div>
        <div>{props.post.upvotes} upvotes</div>
        <div>{props.post.downvotes} downvotes</div>
        <button onClick={() => {props.submitVote({postId: props.post.id, isUpvote: true})}}>Upvote</button>
        <button onClick={() => {props.submitVote({postId: props.post.id, isUpvote: false})}}>Downvote</button>
    </div>
);

export default PostVotes;
