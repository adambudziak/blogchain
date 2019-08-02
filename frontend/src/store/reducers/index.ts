import { combineReducers } from 'redux';
import postReducer from './posts';
import authReducer from './auth';
import commentReducer from './comments';
import bcReducer from './bc';
import votesReducer from './votes';

export default combineReducers({
    posts: postReducer,
    comments: commentReducer,
    auth: authReducer,
    bc: bcReducer,
    votes: votesReducer,
});

