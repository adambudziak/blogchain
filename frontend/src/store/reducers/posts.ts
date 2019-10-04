import { AnyAction } from "redux";

import { ApiComment } from "actions/comments";
import {ApiPost, PostDetail} from "actions/posts";
import {
  STORE_POST_START,
  STORE_POST_SERVER_SUCCESS,
  STORE_POST_SERVER_FAIL,
  STORE_POST_BC_SUCCESS,
  STORE_POST_BC_FAIL,
  FETCH_COMMENTS_FOR_POST,
  FETCH_POSTS_SUCCESS,
  FETCH_POSTS_ERROR, FETCH_POST_DETAILS, FETCH_POST_DETAILS_SUCCESS, FETCH_POST_DETAILS_ERROR,
} from 'actions/types';

export interface PostsState {
  items: ApiPost[];
  submitLoading: boolean;
  submitError: Error | null;
  postComments: {[postId: number]: ApiComment[]};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postVotes: any;
  fetchError: Error | null;
  postDetails: PostDetail;
}

const initialState: PostsState = {
  items: [],
  submitLoading: false,
  submitError: null,
  postComments: {},
  postVotes: {},
  fetchError: null,
  postDetails: {
    loading: false,
    id: null,
    result: null,
  },
};

const reducer = (state=initialState, action: AnyAction): PostsState => {
  switch (action.type) {
    case STORE_POST_START:
      return {
        ...state,
        submitLoading: true,
        submitError: null,
      };
    case STORE_POST_SERVER_FAIL:
      return {
        ...state,
        submitLoading: false,
        submitError: action.error,
      };
    case STORE_POST_SERVER_SUCCESS:
      return {
        ...state, // maybe add another state to loading so we can show both stages?
      };
    case STORE_POST_BC_FAIL:
      return {
        ...state,
        submitLoading: false,
        submitError: action.error,
      };
    case STORE_POST_BC_SUCCESS:
      return {
        ...state,
        submitLoading: false,
      };
    case FETCH_COMMENTS_FOR_POST:
      const postComments = {...state.postComments};
      postComments[action.postId] = action.payload;
      return {
        ...state,
        postComments,
      };
    case FETCH_POST_DETAILS:
      return {
        ...state,
        postDetails: {
          id: action.postId,
          loading: true,
          result: null,
        }
      };
    case FETCH_POST_DETAILS_SUCCESS:
      return {
        ...state,
        postDetails: {
          id: action.postId,
          loading: false,
          result: action.payload,
        }
      };
    case FETCH_POST_DETAILS_ERROR:
      return {
        ...state,
        postDetails: {
          id: action.postId,
          loading: false,
          result: action.error,
        }
      };
    case FETCH_POSTS_SUCCESS:
      return {
        ...state,
        items: action.payload,
        fetchError: null,
      };
    case FETCH_POSTS_ERROR:
      return {
        ...state,
        fetchError: action.error,
      };
    default:
      return state;
  }
};

export default reducer;
