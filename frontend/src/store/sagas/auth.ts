import axios from 'axios';
import moment from "moment";
import { takeLatest, call, put } from 'redux-saga/effects';

import { authLogin, authSignup } from "actions/auth";
import {
  AUTH_CHECK_STATE,
  AUTH_FAIL,
  AUTH_LOGOUT, AUTH_LOGOUT_SUCCESS,
  AUTH_START_LOGIN,
  AUTH_START_SIGNUP,
  AUTH_SUCCESS
} from "actions/types";
import { delay } from "sagas/index";

const expirationTime = moment.duration(14, 'days').asMilliseconds();

const saveSession = (token: string, username: string) => {
  const expirationDate = moment().add(14, 'days');
  localStorage.setItem('user', username);
  localStorage.setItem('token', token);
  localStorage.setItem('expirationDate', expirationDate.toISOString());
};

export function* watchLogin() {
  yield takeLatest(AUTH_START_LOGIN, function* ({ username, password }: ReturnType<typeof authLogin>) {
    try {
      const response = yield call(axios.post,
        'http://localhost:8000/api/rest-auth/login/',
        { username, password });

      const token = response.data.key;
      yield call(saveSession, token, username);
      yield put({ type: AUTH_SUCCESS, token });

      yield delay(expirationTime);
      yield put({ type: AUTH_LOGOUT })
    } catch (error) {
      yield put({ type: AUTH_FAIL, error });
    }
  });
}

export function* watchSignup() {
  yield takeLatest(AUTH_START_SIGNUP,
    function*({ username, email, password1, password2}: ReturnType<typeof authSignup>) {
      try {
        const response = yield call(axios.post,
          'http://localhost:8000/api/rest-auth/registration/', {
            username,
            email,
            password1,
            password2,
          });

        const token = response.data.key;
        yield call(saveSession, token, username);

        yield delay(expirationTime);
        yield put({ type: AUTH_LOGOUT });
      } catch (error) {
        yield put({ type: AUTH_FAIL, error });
      }
    });
}

export function* watchAuthCheckState() {
  yield takeLatest(AUTH_CHECK_STATE, function*() {
    const token = localStorage.getItem('token');
    const storedExpirationDate = localStorage.getItem('expirationDate');
    if (!token || !storedExpirationDate) {
      yield put({ type: AUTH_LOGOUT });
      return;
    }
    const expirationDate = moment(storedExpirationDate);
    const now = moment();
    if (expirationDate.isBefore(now)) {
      yield put({ type: AUTH_LOGOUT });
    } else {
      yield put({ type: AUTH_SUCCESS, token });

      yield delay(expirationDate.diff(now));
      yield put({ type: AUTH_LOGOUT });
    }
  });
}

export function* watchLogout() {
  yield takeLatest(AUTH_LOGOUT, function* () {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    yield put({ type: AUTH_LOGOUT_SUCCESS });
  });
}