import { combineReducers } from 'redux';
import postReducer from './postReducer';
import authReducer from './auth';

export default combineReducers({
    posts: postReducer,
    auth: authReducer,
});

