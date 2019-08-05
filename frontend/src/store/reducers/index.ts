import { combineReducers } from 'redux';
import postReducer, {PostsState} from './posts';
import authReducer, {AuthState} from './auth';
import commentReducer, {CommentsState} from './comments';
import bcReducer, {BcState} from './bc';
import votesReducer from './votes';

export interface State {
    auth: AuthState,
    bc: BcState,
    posts: PostsState,
    comments: CommentsState,
}

export default combineReducers({
    posts: postReducer,
    comments: commentReducer,
    auth: authReducer,
    bc: bcReducer,
    votes: votesReducer,
});
