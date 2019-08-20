import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { withPolling } from "src/polling";

import { ApiPost, fetchPosts, PostData, submitPost } from 'actions/posts';
import { CommentData, submitComment } from 'actions/comments';
import { PostVoteData, submitPostVote } from 'actions/votes';
import { initWeb3 } from 'actions/bc';
import CreatePostForm from 'components/PostForm';
import CreateCommentForm from 'components/CommentForm';
import PostVotes from 'components/PostVotes';
import PostComments from 'containers/PostComments';
import { Web3Context } from "reducers/bc";
import { State } from "reducers/index";

interface StateToProps {
    web3Context: Web3Context | null,
    posts: ApiPost[],
    submitPost: {error: Error | null, loading: boolean},
}

interface DispatchToProps {
    initWeb3: () => void,
    fetchPosts: () => void,
    submitPost: (web3Context: Web3Context, post: PostData) => void,
    submitComment: (web3Context: Web3Context, comment: any, postHash: string) => void,
    submitPostVote: (web3Context: Web3Context, vote: any, postHash: string) => void,
}

type Props = StateToProps & DispatchToProps;

const Posts = (props: Props) => {
    useEffect(withPolling(props.fetchPosts), []);

    if (!props.web3Context) {
        props.initWeb3();
        return (<div>Connecting with blockchain...</div>)
    }
    const web3Context = props.web3Context;

    const submitComment = (comment: CommentData) => {
        const post = props.posts.find(p => p.id === comment.postId);
        if (!post) {
            console.error('Comment.post is undefined?'); // TODO maybe an exception
            return;
        }
        props.submitComment(web3Context, comment, post.data_hash);
    };

    const submitPostVote = (vote: PostVoteData) => {
        const post = props.posts.find(p => p.id === vote.postId);
        if (!post) {
            console.error('Vote.post is undefined?');
            return;
        }
        props.submitPostVote(web3Context, vote, post.data_hash);
    };

    return (
        <div>
            <h2>Hello, {web3Context.account}</h2>
            Accounts registered: {web3Context.accounts.length}
            {/* TODO for some reason TSLint doesnt see that CreatePostForm uses onSubmit (TS2322)*/}
            //@ts-ignore
            <CreatePostForm onSubmit={(post) => props.submitPost(web3Context, post)} />
            {props.submitPost.error ?
                <div>Error: {String(props.submitPost.error)}</div>
                : <div></div>
            }
            {props.posts.map((p, i) => {
                return (
                    <div key={i}>
                        <hr/>
                        <h3>{p.title} <span style={{fontStyle: "italic", fontWeight: "lighter"}}>verified? {
                            p.verified
                                ? <span style={{color: "green"}}>Yes</span>
                                : <span style={{color: "red"}}>No</span>
                        }</span><span><PostVotes post={p} submitVote={submitPostVote} /></span>
                        </h3>
                        <p>{p.content}</p>
                        <PostComments postId={p.id} />
                        {/* TODO here the same as for CreatePostForm */}
                        //@ts-ignore
                        <CreateCommentForm postId={p.id} onSubmit={submitComment} />
                    </div>
                );
            })}
        </div>
    )
};

const mapStateToProps = (state: State): StateToProps => ({
    posts: state.posts.items,
    web3Context: state.bc.web3Context,
    submitPost: {
        error: state.posts.submitError,
        loading: state.posts.submitLoading,
    },
});

const mapDispatchToProps: DispatchToProps = {
    fetchPosts,
    initWeb3,
    submitPost,
    submitComment,
    submitPostVote,
};

export default connect(mapStateToProps, mapDispatchToProps)(Posts);
