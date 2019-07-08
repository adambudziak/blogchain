import React from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import sha3js from 'js-sha3';
import axios from 'axios';
import moment from 'moment';

import {
  createPost 
} from './api';

class CreatePostForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      content: '',
    };
  }

  onTitleChange = (event) => {
    this.setState({
      title: event.target.value,
      content: this.state.content,
    })
  }

  onContentChange = (event) => {
    this.setState({
      title: this.state.title,
      content: event.target.value
    });
  }

  handleSubmit = (event) => {
    this.props.onSubmit(this.state);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className='form-group'>
          <label>Post title</label>
          <input type='text'
                 className='form-control'
                 id='postTitle'
                 placeholder="Enter title..."
                 value={this.state.title}
                 onChange={this.onTitleChange}/>
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea type='text'
                    className='form-control'
                    id='postContent'
                    placeholder='Content...'
                    value={this.state.content}
                    onChange={this.onContentChange}/>
        </div>
        <button type='submit' className='btn btn-primary'>Submit</button>
      </form>
    )
  }
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.web3 = new Web3('http://localhost:7545');
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

  loadPostsStorageABI() {
    axios.get('http://localhost:8000/assets/abi/Posts.json')
    .then(response => {
      if (response.status !== 200) {
        console.error(response);
      }
      const contract = this.web3.eth.Contract(
        response.data.abi,
        '0x8FCB54880bfB9229bFAe2Bc2435a14825a0cE1E8'
      );
      this.setState({ postsContract: contract });
    });
  }

  addPost(title, content) {
    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS)
    const contract = this.state.postsContract;
    const author = 'anonymous';
    createPost({
      title: title,
      content: content,
      datetime: now
    })
    .then(response => {
      if (response.status !== 200) {
        console.error(response);
      }
      console.log('Sent to server!');
      contract.methods.addPost(String(now), this.hashPost(now, author, title, content))
        .send({from: this.state.currentAccount, gas: 1000000})
        .on('confirmation', () => {console.log('Submitted!')})
        .on('error', console.error);
    })
  }

  loadPosts = async () => {
    const contract = this.state.postsContract;
    const postsCount = Number(await contract.methods.getPostsCount().call());
    const rawPosts = await Promise.all([...Array(postsCount).keys()].reverse().map(async (id) => {
      return await contract.methods.posts(id).call();
    }));
    const posts = rawPosts.map((p) => {
      return {
        date: new Date(p.date),
        contentHash: p.contentHash,
      };
    });
    this.setState({ posts });
  }

  hashPost(author, now, title, content) {
    const digest = now + author + title + content;
    console.log(digest);
    return sha3js.keccak_256(digest);
  }

  handleNewPost = (newPost) => {
    this.addPost(newPost.title, newPost.content);
  }

  render() {
    if (this.state.accounts === null) {
      return (<div>Connecting with blockchain...</div>);
    }
    return (
      <div>
        <h2>Hello, {this.state.currentAccount}</h2>
        Accounts registered: {this.state.accounts.length}
        <CreatePostForm onSubmit={this.handleNewPost} />
        <button className="btn btn-primary" onClick={this.loadPosts}>Show all posts</button>
        {this.state.posts.map((p) => {
          return (
            <div>Post: {p.contentHash} at {String(p.date)}</div>
          );
        })}
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));