import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../store/actions/auth';

const { Header, Content, Footer } = Layout;

class LayoutWrapper extends React.Component {

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

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(actions.logout())
  }
}

export default withRouter(connect(null, mapDispatchToProps)(LayoutWrapper));