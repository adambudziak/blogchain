import {
    FETCH_POSTS,
    STORE_POST_START,
    STORE_POST_SERVER_SUCCESS,
    STORE_POST_SERVER_FAIL,
    STORE_POST_BC_SUCCESS,
    STORE_POST_BC_FAIL
} from '../actions/types';

const initialState = {
    items: [],
    storeLoading: false,  // 'store' meaning the action of storing a new post
    storeError: null,
}

const reducer = (state=initialState, action) => {
    switch (action.type) {
        case STORE_POST_START:
            return {
                ...state,
                storeLoading: true,
                storeError: null,
            }
        case STORE_POST_SERVER_FAIL:
            return {
                ...state,
                storeLoading: false,
                storeError: action.error,
            }
        case STORE_POST_SERVER_SUCCESS:
            return {
                ...state, // maybe add another state to loading so we can show both stages?
            }
        case STORE_POST_BC_FAIL:
            return {
                ...state,
                storeLoading: false,
                storeError: action.error,
            }
        case STORE_POST_BC_SUCCESS:
            return {
                ...state,
                storeLoading: false,
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