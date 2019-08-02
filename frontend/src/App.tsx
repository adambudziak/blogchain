import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { connect } from 'react-redux';
import BaseRouter from './routes';
import 'antd/dist/antd.css';
import LayoutWrapper from './containers/Layout';

import * as actions from './store/actions/auth';
import {Dispatch} from "redux";
import PropTypes from 'prop-types';

class App extends React.Component {

  componentDidMount() {
    this.props.onTryAutoSignup();
  }

  render() {
    return (
      <div>
        <Router>
          <LayoutWrapper {...this.props}>
            <BaseRouter />
          </LayoutWrapper>
        </Router>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.token !== null
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onTryAutoSignup: () => dispatch(actions.authCheckState())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
