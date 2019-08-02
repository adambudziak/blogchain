import * as actionTypes from './types';
import axios from 'axios';
import moment from 'moment';
import {Dispatch} from "redux";

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

export const authFail = error => {
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

export const authLogin = (username: string, password: string) => {
    return (dispatch: Dispatch) => {
        dispatch(authStart());
        axios.post('http://localhost:8000/api/rest-auth/login/', {
            username,
            password 
        })
        .then(response => {
            const token = response.data.key;
            const expirationDate = moment().add(14, 'days');
            localStorage.setItem('user', username);
            localStorage.setItem('token', token);
            localStorage.setItem('expirationDate', expirationDate.toISOString());
            dispatch(authSuccess(token));
            dispatch(checkAuthTimeout(moment.duration(14, 'days').asMilliseconds()));
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
            const expirationDate = moment().add(14, 'days');
            localStorage.setItem('token', token);
            localStorage.setItem('expirationDate', String(expirationDate));
            dispatch(authSuccess(token));
            dispatch(checkAuthTimeout(moment.duration(14, 'days').asMilliseconds()));
        })
        .catch(err => {
            dispatch(authFail(err));
        })
    }
};

export const authCheckState = () => {
    return (dispatch: Dispatch) => {
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
            dispatch(checkAuthTimeout(expirationDate.diff(now)));
        }
    }
};