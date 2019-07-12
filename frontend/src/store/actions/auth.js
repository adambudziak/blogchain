import * as actionTypes from './types';
import axios from 'axios';
import moment from 'moment';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
}

export const authSuccess = token => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token
    }
}

export const authFail = error => {
    return {
        type: actionTypes.AUTH_FAIL,
        error
    }
}

export const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    return {
        type: actionTypes.AUTH_LOGOUT
    }
}

export const checkAuthTimeout = expirationTime => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime)
    }
}

export const authLogin = (username, password) => {
    return dispatch => {
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
}

export const authSignup = (username, email, password1, password2) => {
    return dispatch => {
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
            localStorage.setItem('expirationDate', expirationDate);
            dispatch(authSuccess(token));
            dispatch(checkAuthTimeout(moment.duration(14, 'days').asMilliseconds()));
        })
        .catch(err => {
            dispatch(authFail(err));
        })
    }
}

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        if (token === undefined) {
            dispatch(logout());
        } else {
            const expirationDate = moment(localStorage.getItem('expirationDate'));
            const now = moment();
            if (expirationDate.isBefore(now)) {
                dispatch(logout());
            } else {
                dispatch(authSuccess(token));
                dispatch(checkAuthTimeout(expirationDate.diff(now)));
            }
        }
    }
}