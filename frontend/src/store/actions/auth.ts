import * as actionTypes from './types';
import axios from 'axios';
import moment from 'moment';
import { Dispatch } from "redux";

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
};

export const authSuccess = (token: string) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token
    }
};

export const authFail = (error: Error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error
    }
};

export const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    return {
        type: actionTypes.AUTH_LOGOUT
    }
};

export const checkAuthTimeout = (expirationTime: number) => {
    return (dispatch: Dispatch) => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime)
    }
};

const saveSession = (dispatch: Dispatch, token: string, username: string) => {
    const expirationDate = moment().add(14, 'days');
    localStorage.setItem('user', username);
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
};

export const authLogin = (username: string, password: string) => {
    return (dispatch: Dispatch) => {
        dispatch(authStart());
        axios.post('http://localhost:8000/api/rest-auth/login/', {
            username,
            password 
        })
        .then(response => {
            const token = response.data.key;
            saveSession(dispatch, token, username);
            dispatch(authSuccess(token));
            checkAuthTimeout(moment.duration(14, 'days').asMilliseconds())(dispatch);
        })
        .catch(err => {
            dispatch(authFail(err));
        })
    }
};

export const authSignup = (username: string, email: string, password1: string, password2: string) => {
    return (dispatch: Dispatch) => {
        dispatch(authStart());
        axios.post('http://localhost:8000/api/rest-auth/registration/', {
            username,
            email,
            password1,
            password2, 
        })
        .then(response => {
            const token = response.data.key;
            saveSession(dispatch, token, username);
            dispatch(authSuccess(token));
            checkAuthTimeout(moment.duration(14, 'days').asMilliseconds())(dispatch);
        })
        .catch(err => {
            dispatch(authFail(err));
        })
    }
};

export const authCheckState = (dispatch: Dispatch) => {
    const token = localStorage.getItem('token');
    const storedExpirationDate = localStorage.getItem('expirationDate');
    if (token === null || storedExpirationDate === null) {
        dispatch(logout());
        return;
    }
    const expirationDate = moment(storedExpirationDate);
    const now = moment();
    if (expirationDate.isBefore(now)) {
        dispatch(logout());
    } else {
        dispatch(authSuccess(token));
        checkAuthTimeout(expirationDate.diff(now))(dispatch);
    }
};
