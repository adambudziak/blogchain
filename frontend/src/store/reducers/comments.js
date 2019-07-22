import {
    FETCH_COMMENTS,
    SUBMIT_COMMENT_BC_FAIL,
    SUBMIT_COMMENT_BC_SUCCESS,
    SUBMIT_COMMENT_SERVER_FAIL,
    SUBMIT_COMMENT_SERVER_SUCCESS,
    SUBMIT_COMMENT_START,
} from '../actions/types';

const initialState = {
    items: [],
    submitLoading: false,
    submitError: null,
}

const reducer = (state=initialState, action) => {
    switch (action.type) {
        case SUBMIT_COMMENT_START:
            return {
                ...state,
                submitLoading: true,
                submitError: null,
            }
        case SUBMIT_COMMENT_SERVER_FAIL:
            return {
                ...state,
                submitLoading: false,
                submitError: action.error,
            }
        case SUBMIT_COMMENT_SERVER_SUCCESS:
            return {
                ...state, // maybe add another state to loading so we can show both stages?
            }
        case SUBMIT_COMMENT_BC_FAIL:
            return {
                ...state,
                submitLoading: false,
                submitError: action.error,
            }
        case SUBMIT_COMMENT_BC_SUCCESS:
            return {
                ...state,
                submitLoading: false,
            }
        case FETCH_COMMENTS:
            return {
                ...state,
                items: action.payload
            }
        default:
            return state;
    }
}

export default reducer;