import {
    STORE_POST_START,
    STORE_POST_SERVER_SUCCESS,
    STORE_POST_SERVER_FAIL,
    STORE_POST_BC_SUCCESS,
    STORE_POST_BC_FAIL,
    FETCH_COMMENTS_FOR_POST,
    FETCH_POSTS_SUCCESS,
    FETCH_POSTS_ERROR,
} from '../actions/types';
import { ApiPost } from "../actions/posts";
import { AnyAction } from "redux";
import { ApiComment } from "../actions/comments";

export interface PostsState {
    items: ApiPost[],
    submitLoading: boolean,
    submitError: Error | null,
    postComments: {[postId: number]: ApiComment[]},
    postVotes: any,
    fetchError: Error | null,
}

const initialState: PostsState = {
    items: [],
    submitLoading: false,
    submitError: null,
    postComments: {},
    postVotes: {},
    fetchError: null,
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
