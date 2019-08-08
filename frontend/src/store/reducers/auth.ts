import * as actionTypes from '../actions/types';
import { AnyAction } from "redux";

export interface AuthState {
    token: string | null,
    error: Error | null,
    loading: boolean,
}

const initialState: AuthState = {
    token: null,
    error: null,
    loading: false,
};

const authStart = (state: AuthState, action: AnyAction): AuthState => {
    return {
        ...state,
        error: null,
        loading: true,
    };
};

const authSuccess = (state: AuthState, action: AnyAction): AuthState => {
    return {
        ...state,
        token: action.token,
        error: null,
        loading: false,
    };
};

const authFail = (state: AuthState, action: AnyAction): AuthState => {
    return {
        ...state,
        error: action.error,
        loading: false,
    };
};

const authLogout = (state: AuthState, action: AnyAction): AuthState => {
    return {
        ...state,
        token: null,
    };
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
