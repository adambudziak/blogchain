import { AnyAction } from "redux";

import * as actionTypes from 'actions/types';

export interface AuthState {
  token: string | null;
  error: AuthError | null;
  loading: boolean;
}

export interface AuthError {
  message: string;
  response: {
    status: number;
    data: {
      [field: string]: string[];
    };
  };
}

const initialState: AuthState = {
  token: null,
  error: null,
  loading: false,
};

const authStart = (state: AuthState): AuthState => {
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

const authLogout = (state: AuthState): AuthState => {
  return {
    ...state,
    token: null,
  };
};

const reducer = (state=initialState, action: AnyAction) => {
  switch (action.type) {
    case actionTypes.AUTH_START_LOGIN: return authStart(state);
    case actionTypes.AUTH_START_SIGNUP: return authStart(state);
    case actionTypes.AUTH_SUCCESS: return authSuccess(state, action);
    case actionTypes.AUTH_FAIL: return authFail(state, action);
    case actionTypes.AUTH_LOGOUT: return authLogout(state);
    default:
      return state;
  }
};

export default reducer;
