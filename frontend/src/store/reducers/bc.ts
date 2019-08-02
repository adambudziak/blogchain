import { INIT_WEB3 } from '../actions/types';
import {AnyAction} from "redux";

const initialState = {
    web3: null,
    account: null,
    accounts: [],
    addresses: null,
    postsContract: null,
    commentsContract: null,
};

const reducer = (state=initialState, action: AnyAction) => {
    switch (action.type) {
        case INIT_WEB3:
            return {
                ...state,
                ...action,
            };
        default:
            return state;
    }
};

export default reducer;