import React, {ReactNode} from 'react';
import { Layout, Menu } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { logout } from 'actions/auth';

const { Header, Content, Footer } = Layout;

interface OwnProps {
    isAuthenticated: boolean,
    children: ReactNode,
}

interface DispatchToProps {
    logout: () => void,
}

type Props = OwnProps & DispatchToProps;

const LayoutWrapper = (props: Props) => {
    return (
        <Layout className="layout">
            <Header>
                <Menu theme="dark" mode="horizontal"
                      defaultSelectedKeys={['1']}
                      style={{ lineHeight: '64px' }}>
                    <Menu.Item key="1">
                        <Link to="/"><span style={{ fontSize: "1.2em", fontWeight: "bold"}}>BlogChain</span></Link>
                    </Menu.Item>
                    {
                        props.isAuthenticated ?
                            <Menu.Item key="2" onClick={props.logout}>
                                Logout
                            </Menu.Item>
                            :
                            <Menu.Item key="2">
                                <Link to="/login">Login</Link>
                            </Menu.Item>
                    }
                </Menu>
            </Header>
            <Content style={{ padding: '50px', width: '80%', margin: 'auto'}}>
                <div>{props.children}</div>
            </Content>
            <Footer>
            </Footer>
        </Layout>
    );
};

const mapDispatchToProps = {
    logout,
};


// TODO this also seems broken (TS2345) "Types of property propTypes are incompatible"
// @ts-ignore
export default withRouter(connect(null, mapDispatchToProps)(LayoutWrapper));
