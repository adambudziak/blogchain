import { combineReducers } from 'redux';
import postReducer from './posts';
import authReducer from './auth';
import commentReducer from './comments';
import bcReducer from './bc';

export default combineReducers({
    posts: postReducer,
    comments: commentReducer,
    auth: authReducer,
    bc: bcReducer,
});

