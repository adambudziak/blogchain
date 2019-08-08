import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { connect } from 'react-redux';
import BaseRouter from './routes';
import 'antd/dist/antd.css';
import LayoutWrapper from './containers/Layout';

import * as actions from './store/actions/auth';
import { Dispatch } from "redux";
import { State } from "./store/reducers";

interface StateToProps {
  isAuthenticated: boolean,
}

interface DispatchToProps {
  onTryAutoSignup: () => void,
}

type Props = StateToProps & DispatchToProps;

class App extends React.Component<Props> {

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

const mapStateToProps = (state: State): StateToProps => {
  return {
    isAuthenticated: state.auth.token !== null
  }
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchToProps => {
  return {
    onTryAutoSignup: () => actions.authCheckState(dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
