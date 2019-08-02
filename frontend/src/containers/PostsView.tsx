import React from 'react';
import CreatePostForm from '../components/PostForm';
import CreateCommentForm from '../components/CommentForm';
import PostComments from '../containers/PostComments';
import PostVotes from '../components/PostVotes';

import { connect } from 'react-redux';
import { fetchPosts, storePost } from '../store/actions/posts';
import { fetchComments, submitComment } from '../store/actions/comments';
import { submitPostVote } from '../store/actions/votes';
import { initWeb3 } from '../store/actions/bc';
import Web3 from 'web3';
import Contract from "web3/eth/contract";
import {Dispatch} from "redux";

interface StateProps {
  posts: object[],
  accounts: string[],
  web3: Web3,
  currentAccount: string,
  postsContract: Contract,
  commentsContract: Contract,
  upvotesContract: Contract,
  downvotesContract: Contract,
  submitPost: any, // TODO temporary
  comments: any[],
}

interface DispatchProps {
  initWeb3: () => void,
  fetchPosts: () => void,
  storePost: (web3Context: any, post: any) => void,
  fetchComments: () => void,
  submitComment: (web3Context: any, comment: any, postHash: string) => void,
  submitPostVote: (web3Context:any, vote: any, postHash: string) => void,
}

type Props = StateProps & DispatchProps;

class Posts extends React.Component<Props> {

  componentWillMount() {
    this.props.initWeb3();
    this.props.fetchPosts();
    this.props.fetchComments();
    setInterval(this.props.fetchPosts, 5000);
  }

  // TODO this probably should go to the store
  defaultWeb3Context = () => {
    return {
      web3: this.props.web3,
      currentAccount: this.props.currentAccount,
      postsContract: this.props.postsContract,
      commentsContract: this.props.commentsContract,
      upvotesContract: this.props.upvotesContract,
      downvotesContract: this.props.downvotesContract,
    }
  };

  storePost = (post) => {
    this.props.storePost(this.defaultWeb3Context(), post);
  };

  submitComment = (comment) => {
    const postHash = this.props.posts.find(p => p.id === comment.postId).data_hash;
    this.props.submitComment(this.defaultWeb3Context(), comment, postHash);
  };

  submitPostVote = (vote) => {
    const postHash = this.props.posts.find(p => p.id === vote.postId).data_hash;
    this.props.submitPostVote(this.defaultWeb3Context(), vote, postHash);
  };

  render() {
    if (this.props.accounts === null) {
      return (<div>Connecting with blockchain...</div>);
    }
    return (
      <div>
        <h2>Hello, {this.props.currentAccount}</h2>
        Accounts registered: {this.props.accounts.length}
        <CreatePostForm onSubmit={this.storePost} />
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
              <CreateCommentForm postId={p.id} onSubmit={this.submitComment} />
            </div>
          );
        })}
      </div>
    )
  }
}

const mapStateToProps = (state: any): StateProps => ({
  posts: state.posts.items,
  accounts: state.bc.accounts,
  web3: state.bc.web3,
  currentAccount: state.bc.account,
  postsContract: state.bc.postsContract,
  submitPost: {
    error: state.posts.submitError,
    loading: state.posts.submitLoading,
  },
  comments: state.comments.items,
  commentsContract: state.bc.commentsContract,
  upvotesContract: state.bc.upvotesContract,
  downvotesContract: state.bc.downvotesContract,
});

const mapDispatchToProps = (_dispatch: Dispatch): DispatchProps => ({
  fetchPosts,
  initWeb3,
  storePost,
  fetchComments,
  submitComment,
  submitPostVote,
});


export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(Posts);
