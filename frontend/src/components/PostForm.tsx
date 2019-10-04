import { Form, Input, Button } from 'antd';
import { FormComponentProps } from "antd/lib/form";
import React from 'react';
import {PostData} from "actions/posts";

interface OwnProps {
  onSubmit: (post: PostData) => void;
}

type Props = OwnProps & FormComponentProps;

class CreatePostForm extends React.Component<Props> {

  handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onSubmit({
          title: values.title,
          content: values.content,
        });
      }
    })
  };


  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="post-form">
        <Form.Item>
          {getFieldDecorator('title')(<Input name="title" placeholder="Title"/>)}
        </Form.Item>

        <Form.Item>
          {getFieldDecorator('content')(<Input.TextArea placeholder="Post..."/>)}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{marginRight: '10px'}}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    )
  }
}

const WrappedPostForm = Form.create<Props>({ name: 'create_post' })(CreatePostForm);

export default WrappedPostForm;
