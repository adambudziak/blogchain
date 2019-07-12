import { FETCH_POSTS } from '../actions/actionTypes';

const initialState = {
    items: [],
}

const reducer = (state=initialState, action) => {
    switch (action.type) {
        case FETCH_POSTS:
            console.log(action.payload);
            return {
                ...state,
                items: action.payload
            }
        default:
            return state;
    }
}

export default reducer;