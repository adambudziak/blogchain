import React, {useEffect} from 'react';
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
