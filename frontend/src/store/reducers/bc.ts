import { AnyAction } from "redux";
import Web3 from 'web3';
import Contract from "web3/eth/contract";

import { INIT_WEB3_SUCCESS } from 'actions/types';

export interface Web3Context {
    web3: Web3,
    account: string,
    accounts: string[],
    addresses: any,
    postsContract: Contract,
    commentsContract: Contract,
    upvotesContract: Contract,
    downvotesContract: Contract,
}

export interface BcState {
    web3Context: Web3Context | null,
}

const initialState: BcState = {
    web3Context: null
};

const reducer = (state=initialState, action: AnyAction): BcState => {
    switch (action.type) {
        case INIT_WEB3_SUCCESS:
            return {
                ...state,
                ...action,
            };
        default:
            return state;
    }
};

export default reducer;
