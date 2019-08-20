import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { createStore, compose, applyMiddleware } from 'redux';

import App from 'src/App';
import rootReducer from 'src/store/reducers';
import sagas from 'src/store/sagas';


// @ts-ignore
const composeEnhances = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware];

const store = createStore(rootReducer, composeEnhances(
  applyMiddleware(...middleware)
));

const app = (
  <Provider store={store}>
    <App />
  </Provider>
);

sagaMiddleware.run(sagas);

ReactDOM.render(app, document.getElementById('root'));
