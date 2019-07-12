import React from 'react';
import Web3 from 'web3';
import axios from 'axios';
import moment from 'moment';

import { createPost } from '../api';
import { CreatePostForm } from '../posts';

import { connect } from 'react-redux';
import { fetchPosts } from '../store/actions/posts';

class HomePage extends React.Component {

  constructor(props) {
    super(props);
    this.web3 = new Web3('http://localhost:8545');
    this.state = {
      accounts: null,
      currentAccount: null,
      postsContract: null,
      posts: [],
    };
    this.web3.eth.getAccounts().then(accounts => {
      this.web3.eth.currentAccount = accounts[0];
      this.setState({
        accounts,
        currentAccount: accounts[0],
      });
      this.loadPostsStorageABI();
    });
  }

  loadPostsStorageABI = async () => {
    const addresses = await axios.get('http://localhost:8000/assets/contracts.json');
    const postsAddress = addresses.data.posts;
    console.log(addresses);
    axios.get('http://localhost:8000/assets/abi/Posts.json')
    .then(response => {
      if (response.status !== 200) {
        console.error(response);
      }
      const contract = this.web3.eth.Contract(
        response.data.abi,
        postsAddress,
      );
      this.setState({ postsContract: contract });
    });
  }

  addPost(title, content) {
    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
    const contract = this.state.postsContract;
    const storedAuthor = localStorage.getItem('user');
    const author = (storedAuthor === undefined || storedAuthor == null) ? 'anonymous' : storedAuthor;
    const hash = this.hashPost(now, author, title, content);
    console.log(hash.length)
    createPost({
      title: title,
      content: content,
      datetime: now,
      hash: hash,
    })
    .then(_response => {
      contract.methods.addPost(String(now), hash)
        .send({
          from: this.state.currentAccount,
          value: this.web3.utils.toWei('0.005', 'ether')
        })
        .on('confirmation', () => {console.log('Submitted!')})
        .on('error', console.error);
    })
    .catch(console.error);
  }

  loadPosts = () => {
    console.log(this.props.fetchPosts);
    this.props.fetchPosts();
  }

  hashPost(author, now, title, content) {
    const digest = now + author + title + content;
    console.log(digest);
    return this.web3.utils.keccak256(digest);
  }

  handleNewPost = (newPost) => {
    this.addPost(newPost.title, newPost.content);
  }

  render() {
    if (this.state.accounts === null) {
      return (<div>Connecting with blockchain...</div>);
    }
    console.log(this.props.posts);
    return (
      <div>
        <h2>Hello, {this.state.currentAccount}</h2>
        Accounts registered: {this.state.accounts.length}
        <CreatePostForm onSubmit={this.handleNewPost} />
        <button className="btn btn-primary" onClick={this.loadPosts}>Show all posts</button>
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
})

export default connect(mapStateToProps, { fetchPosts })(HomePage);