import { combineReducers } from 'redux';

import authReducer, {AuthState} from 'reducers/auth';
import bcReducer, {BcState} from 'reducers/bc';
import commentReducer, {CommentsState} from 'reducers/comments';
import postReducer, {PostsState} from 'reducers/posts';
import votesReducer, {VotesState} from 'reducers/votes';

export interface State {
  auth: AuthState;
  bc: BcState;
  posts: PostsState;
  comments: CommentsState;
  votes: VotesState;
}

export default combineReducers({
  posts: postReducer,
  comments: commentReducer,
  auth: authReducer,
  bc: bcReducer,
  votes: votesReducer,
});
