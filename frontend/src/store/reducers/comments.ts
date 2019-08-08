import {
    FETCH_COMMENTS,
    FETCH_DOWNVOTES_FOR_COMMENT,
    FETCH_UPVOTES_FOR_COMMENT,
    SUBMIT_COMMENT_BC_FAIL,
    SUBMIT_COMMENT_BC_SUCCESS,
    SUBMIT_COMMENT_SERVER_FAIL,
    SUBMIT_COMMENT_SERVER_SUCCESS,
    SUBMIT_COMMENT_START,
} from '../actions/types';
import { AnyAction } from "redux";
import { ApiComment } from "../actions/comments";

export interface CommentsState {
    items: ApiComment[],
    submitLoading: boolean,
    submitError: Error | null,
    commentUpvotes: any,
    commentDownvotes: any,
}

const initialState: CommentsState = {
    items: [],
    submitLoading: false,
    submitError: null,
    commentUpvotes: {},
    commentDownvotes: {},
};

const reducer = (state=initialState, action: AnyAction): CommentsState => {
    switch (action.type) {
        case SUBMIT_COMMENT_START:
            return {
                ...state,
                submitLoading: true,
                submitError: null,
            };
        case SUBMIT_COMMENT_SERVER_FAIL:
            return {
                ...state,
                submitLoading: false,
                submitError: action.error,
            };
        case SUBMIT_COMMENT_SERVER_SUCCESS:
            return {
                ...state, // maybe add another state to loading so we can show both stages?
            };
        case SUBMIT_COMMENT_BC_FAIL:
            return {
                ...state,
                submitLoading: false,
                submitError: action.error,
            };
        case SUBMIT_COMMENT_BC_SUCCESS:
            return {
                ...state,
                submitLoading: false,
            };
        case FETCH_COMMENTS:
           return {
                ...state,
                items: action.payload
            };
        case FETCH_UPVOTES_FOR_COMMENT:
            const commentUpvotes = {...state.commentUpvotes};
            commentUpvotes[action.commentId] = action.payload;
            return {
                ...state,
                commentUpvotes,
            };
        case FETCH_DOWNVOTES_FOR_COMMENT:
            const commentDownvotes = {...state.commentDownvotes};
            commentDownvotes[action.commentId] = action.payload;
            return {
                ...state,
                commentDownvotes,
            };
        default:
            return state;
    }
};

export default reducer;
