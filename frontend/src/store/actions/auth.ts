import {
    AUTH_CHECK_STATE,
    AUTH_LOGOUT,
    AUTH_START_LOGIN,
    AUTH_START_SIGNUP
} from "actions/types";

export const logout = () => ({
    type: AUTH_LOGOUT,
});

export const authLogin = (username: string, password: string) => ({
    type: AUTH_START_LOGIN,
    username,
    password
});

export const authSignup = (username: string, email: string, password1: string, password2: string) => ({
    type: AUTH_START_SIGNUP,
    username,
    email,
    password1,
    password2,
});

export const authCheckState = () => ({
    type: AUTH_CHECK_STATE,
});

