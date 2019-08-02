import React from 'react';
import { Form, Input, Button } from 'antd';
import { connect } from 'react-redux';


class CreateCommentForm extends React.Component {
  handleSubmit = event => {
    event.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onSubmit({
          content: values.content,
          postId: this.props.postId,
        })
      }
    })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="comment-form">
        <Form.Item>
          {getFieldDecorator('content')(<Input name="content" placeholder="Write your comment..."/>)}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{marginRight: '10px'}}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const WrappedCommentForm = Form.create({ name: 'create_comment' })(CreateCommentForm);

export default connect(null, null)(WrappedCommentForm);