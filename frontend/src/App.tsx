import 'antd/dist/antd.css';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import BaseRouter from 'src/routes';

import LayoutWrapper from 'containers/Layout';
import { State } from "reducers/index";
import { authCheckState } from "actions/auth";

interface StateToProps {
  isAuthenticated: boolean,
}

interface DispatchToProps {
  authCheckState: () => void,
}

type Props = StateToProps & DispatchToProps;

const App = (props: Props) => {
  useEffect(props.authCheckState, []);

  return (
      <div>
        <Router>
          <LayoutWrapper {...props}>
            <BaseRouter />
          </LayoutWrapper>
        </Router>
      </div>
  );
};

const mapStateToProps = (state: State): StateToProps => ({
    isAuthenticated: state.auth.token !== null
});

const mapDispatchToProps = {
  authCheckState
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
