import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { connect } from 'react-redux';
import BaseRouter from './routes';
import 'antd/dist/antd.css';
import LayoutWrapper from './containers/Layout';

import { authCheckState } from "./store/actions/auth";
import { State } from "./store/reducers";

interface StateToProps {
  isAuthenticated: boolean,
}

interface DispatchToProps {
  authCheckState: () => void,
}

type Props = StateToProps & DispatchToProps;

class App extends React.Component<Props> {

  componentDidMount() {
    this.props.authCheckState();
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

const mapStateToProps = (state: State): StateToProps => ({
    isAuthenticated: state.auth.token !== null
});

const mapDispatchToProps = {
  authCheckState
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
