import React from 'react';
import { Layout, Menu } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { logout } from 'actions/auth';

const { Header, Content, Footer } = Layout;

interface OwnProps {
    isAuthenticated: boolean,
}

interface DispatchToProps {
    logout: () => void,
}

type Props = OwnProps & DispatchToProps;

class LayoutWrapper extends React.Component<Props> {

  render() {
    return (
      <Layout className="layout">
        <Header>
          <Menu theme="dark" mode="horizontal"
                defaultSelectedKeys={['2']}
                style={{ lineHeight: '64px' }}>
            {
              this.props.isAuthenticated ?
              <Menu.Item key="2" onClick={this.props.logout}>
                Logout
              </Menu.Item>
              :
              <Menu.Item key="2">
                <Link to="/login">Login</Link>
              </Menu.Item>
            }
            <Menu.Item key="1">
              <Link to="/">Home Page</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '50px', width: '80%', margin: 'auto'}}>
          <div>{this.props.children}</div>
        </Content>
        <Footer>
        </Footer>
      </Layout>
    );
  }
}

const mapDispatchToProps = {
    logout,
};


// TODO this also seems broken (TS2345) "Types of property propTypes are incompatible"
// @ts-ignore
export default withRouter(connect(null, mapDispatchToProps)(LayoutWrapper));
