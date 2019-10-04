import { Form, Input, Icon, Button } from 'antd';
import { FormComponentProps } from "antd/lib/form";
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, NavLink } from 'react-router-dom';

import { authSignup } from "actions/auth";
import { AuthError } from "reducers/auth";
import { State } from "reducers/index";

interface StateToProps {
  loading: boolean;
  error: AuthError | null;
}

interface DispatchToProps {
  authSignup: (username: string, email: string, password1: string, password2: string) => void;
}

interface ErrorProps {
  error: AuthError;
};

const RegistrationError = ({ error }: ErrorProps) => {
  if (error.response.status !== 400) {
    return <div>{error.message}</div>;
  }
  const parsedErrors = [];
  let key = 0;
  for (const errors of Object.values(error.response.data)) {
    for (const error of errors) {
      parsedErrors.push(<li key={key}>{error}</li>);
      key++;
    }
  }
  return (
    <div>
      <ul>
        {parsedErrors}
      </ul>
    </div>
  )
}

type Props = RouteComponentProps & StateToProps & DispatchToProps & FormComponentProps;

const RegistrationForm = (props: Props) => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    if (props.loading) { return; }
    const error = submitted && (props.error != null);
    if (props.error !== null) {
      setError(props.error);
    }
    if (!error && submitted) {
      props.history.push('/login');
    }
    if (submitted) {
      setSubmitted(false);
    }
  }, [props.loading, props.error, props.history, error, submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        setSubmitted(true);
        props.authSignup(
          values.username,
          values.email,
          values.password,
          values.confirm
        );
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compareToFirstPassword = (rule: any, value: any, callback: any) => {
    const { form } = props;
    if (value && value !== form.getFieldValue('password')) {
      callback("Passwords don't match!");
    } else {
      callback();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateToNextPassword = (rule: any, value: any, callback: any) => {
    const { form } = props;
    if (value) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };


  const { getFieldDecorator } = props.form;

  return (
    <div>
      {error != null && <RegistrationError error={error}/>}
      <Form onSubmit={handleSubmit}>
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
              { validator: validateToNextPassword }],
          })(<Input.Password
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Password"
          />)}
        </Form.Item>
  
        <Form.Item hasFeedback>
          {getFieldDecorator('confirm', {
            rules: [{required: true, message: 'Please confirm your password!'},
              {validator: compareToFirstPassword}],
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
    </div>
  );
}

const WrappedRegistrationForm = Form.create({ name: 'register' })(RegistrationForm);

const mapStateToProps = (state: State): StateToProps => {
  return {
    loading: state.auth.loading,
    error: state.auth.error, 
  }
};

const mapDispatchToProps: DispatchToProps = {
  authSignup
};

export default connect(mapStateToProps, mapDispatchToProps)(WrappedRegistrationForm);
