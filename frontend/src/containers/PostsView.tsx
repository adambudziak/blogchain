import React from 'react';
import CreatePostForm from '../components/PostForm';
import CreateCommentForm from '../components/CommentForm';
import PostComments from '../containers/PostComments';
import PostVotes from '../components/PostVotes';


import {connect} from 'react-redux';
import {ApiPost, fetchPosts, PostData, submitPost} from '../store/actions/posts';
import {CommentData, submitComment} from '../store/actions/comments';
import {PostVoteData, submitPostVote} from '../store/actions/votes';
import { initWeb3 } from '../store/actions/bc';
import {Web3Context} from "../store/reducers/bc";
import {State} from "../store/reducers";

interface StateToProps {
    web3Context: Web3Context | null,
    posts: ApiPost[],
    submitPost: {error: Error | null, loading: boolean},
    comments: any[],
}

interface DispatchToProps {
    initWeb3: () => void,
    fetchPosts: () => void,
    submitPost: (web3Context: Web3Context, post: PostData) => void,
    submitComment: (web3Context: Web3Context, comment: any, postHash: string) => void,
    submitPostVote: (web3Context: Web3Context, vote: any, postHash: string) => void,
}

type Props = StateToProps & DispatchToProps;

class Posts extends React.Component<Props> {

    componentWillMount() {
        this.props.initWeb3();
        this.props.fetchPosts();
        setInterval(this.props.fetchPosts, 5000);
    }

    submitPost = (post: PostData) => {
        if (this.props.web3Context === null) {  // TODO find a better way
            return;
        }
        this.props.submitPost(this.props.web3Context, post);
    };

    submitComment = (comment: CommentData) => {
        if (this.props.web3Context === null) {
            return;
        }
        const post = this.props.posts.find(p => p.id === comment.postId);
        if (post === undefined) {
            console.error('Comment.post is undefined?');
            return;
        }
        this.props.submitComment(this.props.web3Context, comment, post.data_hash);
    };

    submitPostVote = (vote: PostVoteData) => {
        if (this.props.web3Context === null) {
            return;
        }
        const post = this.props.posts.find(p => p.id === vote.postId);
        if (post === undefined) {
            console.error('Vote.post is undefined?');
            return;
        }
        this.props.submitPostVote(this.props.web3Context, vote, post.data_hash);
    };

    render() {
        if (this.props.web3Context === null) {
            return (<div>Connecting with blockchain...</div>);
        }
        return (
            <div>
                <h2>Hello, {this.props.web3Context.account}</h2>
                Accounts registered: {this.props.web3Context.accounts.length}
                {/* TODO for some reason TSLint doesnt see that CreatePostForm uses onSubmit (TS2322)*/}
                //@ts-ignore
                <CreatePostForm onSubmit={this.submitPost} />
                {this.props.submitPost.error ?
                    <div>Error: {String(this.props.submitPost.error)}</div>
                    : <div></div>
                }
                {this.props.posts.map((p, i) => {
                    return (
                        <div key={i}>
                            <hr/>
                            <h3>{p.title} <span style={{fontStyle: "italic", fontWeight: "lighter"}}>verified? {
                                p.verified
                                    ? <span style={{color: "green"}}>Yes</span>
                                    : <span style={{color: "red"}}>No</span>
                            }</span><span><PostVotes postId={p.id} submitVote={this.submitPostVote} /></span>
                            </h3>
                            <p>{p.content}</p>
                            <PostComments postId={p.id} />
                            {/* TODO here the same as for CreatePostForm */}
                            //@ts-ignore
                            <CreateCommentForm postId={p.id} onSubmit={this.submitComment} />
                        </div>
                    );
                })}
            </div>
        )
    }
}

const mapStateToProps = (state: State): StateToProps => ({
    posts: state.posts.items,
    web3Context: state.bc.web3Context,
    submitPost: {
        error: state.posts.submitError,
        loading: state.posts.submitLoading,
    },
    comments: state.comments.items,
});

const mapDispatchToProps: DispatchToProps = {
    fetchPosts,
    initWeb3,
    submitPost,
    submitComment,
    submitPostVote,
};

export default connect(mapStateToProps, mapDispatchToProps)(Posts);
