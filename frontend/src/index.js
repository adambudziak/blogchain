import React from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import sha3js from 'js-sha3';
import axios from 'axios';


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
    axios.get('http://localhost:8000/api/static/abi/PostsContainer.json')
    .then(response => {
      if (response.status !== 200) {
        console.error(response);
      }
      console.log(response.data.abi);
      const contract = response.data.abi;
      console.log(contract);
      this.setState({ postsContract: this.web3.eth.Contract(contract, '0xAdf81897D6a14807356a50Dc2cF9679293275e69') })
    });
  }

  addPost(title, content) {
    const contract = this.state.postsContract;
    contract.methods.addPost(title, this.hashPost(title, content))
      .send({from: this.state.currentAccount, gas: 1000000})
      .on('confirmation', () => {console.log('Submitted!')})
      .on('error', console.error);
    this.loadPosts();
  }

  loadPosts() {
    const contract = this.state.postsContract;
    // contract.methods.posts(0).call().then(console.log);
  }

  hashPost(title, content) {
    const now = new Date();
    const digest = now + title + content;
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
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));