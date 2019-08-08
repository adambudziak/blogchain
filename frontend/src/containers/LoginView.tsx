import React from 'react';
import { Form, Spin, Icon, Input, Button } from 'antd';
import { connect } from 'react-redux';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import * as actions from '../store/actions/auth';
import { Dispatch } from "redux";
import { FormComponentProps } from "antd/lib/form";
import { State } from "../store/reducers";

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

interface OwnProps {
    onAuth: (username: string, password: string) => void,
}

interface StateToProps {
  loading: boolean,
  error: Error,
}

type Props = RouteComponentProps & OwnProps & StateToProps & FormComponentProps;

class NormalLoginForm extends React.Component<Props> {
  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onAuth(values.username, values.password);
      }
    });
    this.props.history.push('/');
  };

  render() {
    let errorMessage = null;
    if (this.props.error) {
      errorMessage = (
        <p>{this.props.error.message}</p>
      );
    }

    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        {errorMessage}
        {
          this.props.loading ?
          <Spin indicator={antIcon} />
          :
          <Form onSubmit={this.handleSubmit} className="login-form">

            <Form.Item>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: 'Please input your username!' }],
            })(
              <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username"
              />,
            )}
            </Form.Item>

            <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password"
              />,
            )}
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{marginRight: '10px'}} >
                Login
              </Button>
              Or
              <NavLink
              style={{marginRight: '10px'}} to='/signup'
              > signup
              </NavLink>
            </Form.Item>
          </Form>
        }
      </div>
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);

const mapStateToProps = (state: State) => {
  return state.auth;
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onAuth: (username: string, password: string) => actions.authLogin(username, password)(dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(WrappedNormalLoginForm);
