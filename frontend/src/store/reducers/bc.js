import { INIT_WEB3 } from '../actions/types';

const initialState = {
    web3: null,
    account: null,
    accounts: [],
    addresses: null,
    postsContract: null,
    commentsContract: null,
}

const reducer = (state=initialState, action) => {
    switch (action.type) {
        case INIT_WEB3:
            return {
                ...state,
                ...action,
            }
        default:
            return state;
    }
}

export default reducer;