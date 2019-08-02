import * as actionTypes from '../actions/types';
import { updateObject } from '../utility';
import {AnyAction} from "redux";

const initialState = {
    token: null,
    error: null,
    loading: false,
};

const authStart = (state, action: AnyAction) => {
    return updateObject(state, {
        error: null,
        loading: true,
    })
};

const authSuccess = (state, action: AnyAction) => {
    return updateObject(state, {
        token: action.token,
        error: null,
        loading: false,
    })
};

const authFail = (state, action: AnyAction) => {
    return updateObject(state, {
        error: action.error,
        loading: false,
    })
};

const authLogout = (state, action: AnyAction) => {
    return updateObject(state, {
        token: null,
    })
};

const reducer = (state=initialState, action: AnyAction) => {
    switch (action.type) {
        case actionTypes.AUTH_START: return authStart(state, action);
        case actionTypes.AUTH_SUCCESS: return authSuccess(state, action);
        case actionTypes.AUTH_FAIL: return authFail(state, action);
        case actionTypes.AUTH_LOGOUT: return authLogout(state, action);
        default:
            return state;
    }
};

export default reducer;