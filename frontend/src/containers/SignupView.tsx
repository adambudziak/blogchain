import { Form, Input, Icon, Button } from 'antd';
import { FormComponentProps } from "antd/lib/form";
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, NavLink } from 'react-router-dom';

import { authSignup } from "actions/auth";
import { State } from "reducers/index";

interface StateToProps {
  loading: boolean,
  error: Error | null,
}

interface DispatchToProps {
  authSignup: (username: string, email: string, password1: string, password2: string) => void,
}

type Props = RouteComponentProps & StateToProps & DispatchToProps & FormComponentProps;

class RegistrationForm extends React.Component<Props> {
  state = {
    confirmDirty: false,
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.authSignup(
          values.username,
          values.email,
          values.password,
          values.confirm
        );
        this.props.history.push('/login');
      }
    });
  };

  compareToFirstPassword = (rule: any, value: any, callback: any) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule: any, value: any, callback: any) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
        {getFieldDecorator('username', {
          rules: [{ required: true, message: 'Please input your username!' }],
        })(
          <Input
          prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="Username"
          />
        )}
        </Form.Item>

        <Form.Item>
          {getFieldDecorator('email', {
            rules: [{ required: true, message: 'Please input your E-mail!'}],
          })(
          <Input
          prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="Email"
          />,
          )}
        </Form.Item>

        <Form.Item hasFeedback>
          {getFieldDecorator('password', {
            rules: [{required: true, message: 'Please input your password!'},
                    { validator: this.validateToNextPassword }],
          })(<Input.Password
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="Password"
          />)}
        </Form.Item>

        <Form.Item hasFeedback>
          {getFieldDecorator('confirm', {
            rules: [{required: true, message: 'Please confirm your password!'},
                    {validator: this.compareToFirstPassword}],
          })(<Input.Password
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="Confirm password"
          />)}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{marginRight: '10px'}} >
            Signup
          </Button>
          Or
          <NavLink
          style={{marginRight: '10px'}} to='/login'
          > login
          </NavLink>
        </Form.Item>
      </Form>
    );
  }
}

const WrappedRegistrationForm = Form.create({ name: 'register' })(RegistrationForm);

const mapStateToProps = (state: State): StateToProps => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,  // TODO unused?
  }
};

const mapDispatchToProps: DispatchToProps = {
  authSignup
};

export default connect(mapStateToProps, mapDispatchToProps)(WrappedRegistrationForm);
