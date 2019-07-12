import React from 'react';
import { CreatePostForm } from '../posts';

import { connect } from 'react-redux';
import { fetchPosts, storePost } from '../store/actions/posts';
import { initWeb3 } from '../store/actions/bc';

class Posts extends React.Component {

  componentWillMount() {
    this.props.initWeb3();
  }

  storePost(title, content) {
    this.props.storePost({
      web3: this.props.web3,
      currentAccount: this.props.currentAccount,
      postsContract: this.props.postsContract
    }, {
      title: title,
      content: content,
    });
  }

  handleNewPost = (newPost) => {
    this.storePost(newPost.title, newPost.content);
  }

  render() {
    if (this.props.accounts === null) {
      return (<div>Connecting with blockchain...</div>);
    }
    return (
      <div>
        <h2>Hello, {this.props.currentAccount}</h2>
        Accounts registered: {this.props.accounts.length}
        <CreatePostForm onSubmit={this.handleNewPost} />
        <button className="btn btn-primary" onClick={this.props.fetchPosts}>Show all posts</button>
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
})

export default connect(mapStateToProps, {
  fetchPosts,
  initWeb3,
  storePost,
})(Posts);