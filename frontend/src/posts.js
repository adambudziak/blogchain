import React from 'react';

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

export { CreatePostForm };