import { combineReducers } from 'redux';
import postReducer from './posts';
import authReducer from './auth';
import bcReducer from './bc';

export default combineReducers({
    posts: postReducer,
    auth: authReducer,
    bc: bcReducer,
});

