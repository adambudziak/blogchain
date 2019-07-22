import React from 'react';
import CreatePostForm from '../components/PostForm';
import CreateCommentForm from '../components/CommentForm';
import PostComments from '../containers/PostComments';

import { connect } from 'react-redux';
import { fetchPosts, storePost } from '../store/actions/posts';
import { fetchComments, submitComment } from '../store/actions/comments';
import { initWeb3 } from '../store/actions/bc';

class Posts extends React.Component {

  componentWillMount() {
    this.props.initWeb3();
    this.props.fetchPosts();
    this.props.fetchComments();
    setInterval(this.props.fetchPosts, 5000);
  }

  storePost = (post) => {
    this.props.storePost({
      web3: this.props.web3,
      currentAccount: this.props.currentAccount,
      postsContract: this.props.postsContract,
    }, post);
  }

  submitComment = (comment) => {
    const postHash = this.props.posts.find(p => p.id === comment.postId).data_hash;
    this.props.submitComment({
      web3: this.props.web3,
      currentAccount: this.props.currentAccount,
      commentsContract: this.props.commentsContract,
    }, comment, postHash);
  }

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
                }</span>
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

const mapStateToProps = state => ({
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
})

export default connect(mapStateToProps, {
  fetchPosts,
  initWeb3,
  storePost,
  fetchComments,
  submitComment,
})(Posts);