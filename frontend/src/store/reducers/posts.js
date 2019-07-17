import {
    FETCH_POSTS,
    STORE_POST_START,
    STORE_POST_SERVER_SUCCESS,
    STORE_POST_SERVER_FAIL,
    STORE_POST_BC_SUCCESS,
    STORE_POST_BC_FAIL,
    FETCH_COMMENTS_FOR_POST
} from '../actions/types';

const initialState = {
    items: [],
    submitLoading: false,
    submitError: null,
    postComments: {},
}

const reducer = (state=initialState, action) => {
    switch (action.type) {
        case STORE_POST_START:
            return {
                ...state,
                submitLoading: true,
                submitError: null,
            }
        case STORE_POST_SERVER_FAIL:
            return {
                ...state,
                submitLoading: false,
                submitError: action.error,
            }
        case STORE_POST_SERVER_SUCCESS:
            return {
                ...state, // maybe add another state to loading so we can show both stages?
            }
        case STORE_POST_BC_FAIL:
            return {
                ...state,
                submitLoading: false,
                submitError: action.error,
            }
        case STORE_POST_BC_SUCCESS:
            return {
                ...state,
                submitLoading: false,
            }
        case FETCH_COMMENTS_FOR_POST:
            const postComments = {...state.postComments};
            postComments[action.postId] = action.payload;
            return {
                ...state,
                postComments: postComments,
            }
        case FETCH_POSTS:
            return {
                ...state,
                items: action.payload
            }
        default:
            return state;
    }
}

export default reducer;