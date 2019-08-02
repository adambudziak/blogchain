import {
    SUBMIT_VOTE,
} from '../actions/types';
import {AnyAction} from "redux";

const initialState = {
    submitLoading: false,
    submitError: null,
    items: [],
};

const reducer = (state=initialState, action: AnyAction) => {
    switch (action.type) {
        case SUBMIT_VOTE.START:
            return {
                ...state,
                submitLoading: true,
                submitError: false,
            };
        case SUBMIT_VOTE.SERVER_FAIL:
            return {
                ...state,
                submitLoading: false,
                submitError: action.error,
            };
        case SUBMIT_VOTE.SERVER_SUCCESS:
            return {
                ...state,
            };
        case SUBMIT_VOTE.BC_FAIL:
            return {
                ...state,
                submitLoading: false,
                submitError: action.error,
            };
        case SUBMIT_VOTE.BC_SUCCESS:
            return {
                ...state,
                submitLoading: false,
            };
        default:
            return state;
    }
};

export default reducer;
