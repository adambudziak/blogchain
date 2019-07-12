import { INIT_WEB3 } from '../actions/types';

const initialState = {
    web3: null,
    account: null,
    accounts: [],
    addresses: null,
    postsContract: null
}

const reducer = (state=initialState, action) => {
    switch (action.type) {
        case INIT_WEB3:
            return {
                ...state,
                web3: action.web3,
                account: action.account,
                accounts: action.accounts,
                addresses: action.addresses,
                postsContract: action.postsContract,
            }
        default:
            return state;
    }
}

export default reducer;