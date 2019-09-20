import { Form, Spin, Icon, Input, Button } from 'antd';
import { FormComponentProps } from "antd/lib/form";
import React from 'react';
import { connect } from 'react-redux';
import { NavLink, RouteComponentProps } from 'react-router-dom';

import { authLogin } from "actions/auth";
import { State } from "reducers/index";

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

interface DispatchToProps {
    authLogin: (username: string, password: string) => void,
}

interface StateToProps {
    loading: boolean,
    error: Error,
}

type Props = RouteComponentProps & DispatchToProps & StateToProps & FormComponentProps;

const LoginForm = (props: Props) => {
   const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const state = props.location.state;
        const next = (state !== undefined && state.next !== undefined) ? state.next : '/';
        props.form.validateFields((err, values) => {
            if (!err) {
                props.authLogin(values.username, values.password);
            }
        });
        props.history.push(next);
    };
    let errorMessage = null;
    if (props.error) {
        errorMessage = (
            <p>{props.error.message}</p>
        );
    }
    const { getFieldDecorator } = props.form;

    return (
        <div>
            <h2>Login</h2>
            {errorMessage}
            {
                props.loading ?
                    <Spin indicator={antIcon} />
                    :
                    <Form onSubmit={handleSubmit} className="login-form">

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
};


const WrappedLoginForm = Form.create({ name: 'normal_login' })(LoginForm);

const mapStateToProps = (state: State) => state.auth;

const mapDispatchToProps: DispatchToProps = {
    authLogin,
};

export default connect(mapStateToProps, mapDispatchToProps)(WrappedLoginForm);
