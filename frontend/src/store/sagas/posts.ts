import axios from 'axios';
import moment from "moment";
import { takeLatest, takeEvery, call, put } from 'redux-saga/effects';
import Web3 from "web3";

import { API_URLS, createPost } from "src/api";
import { getUser } from "src/store/utility";

import {fetchPostComments, fetchPostDetails, PostData, submitPost} from "actions/posts";
import {
  FETCH_COMMENTS_FOR_POST,
  FETCH_COMMENTS_FOR_POST_START,
  FETCH_POST_DETAILS,
  FETCH_POST_DETAILS_ERROR,
  FETCH_POST_DETAILS_SUCCESS,
  FETCH_POSTS,
  FETCH_POSTS_ERROR,
  FETCH_POSTS_SUCCESS,
  STORE_POST_BC_FAIL,
  STORE_POST_BC_SUCCESS,
  STORE_POST_SERVER_FAIL,
  STORE_POST_SERVER_SUCCESS,
  STORE_POST_START,
} from "actions/types";
import { Web3Context } from "reducers/bc";

function hashPost(web3: Web3, post: PostData, author: string, now: string) {
  const digest = author + now + post.title + post.content;
  return web3.utils.keccak256(digest);
}

export function* watchFetchPosts() {
  yield takeLatest(FETCH_POSTS, function* () {
    const web3 = new Web3();
    try {
      const response = yield call(axios.get, API_URLS.POSTS);

      for (const post of response.data.results) {
        const response = yield call(axios.get, API_URLS.POST_BALANCE.replace('<pk>', String(post.id)));
        post['balance'] = web3.utils.fromWei(String(response.data.balance), 'ether');
      }
      yield put({ type: FETCH_POSTS_SUCCESS, payload: response.data.results })
    } catch (error) {
      yield put({ type: FETCH_POSTS_ERROR, error })
    }
  });
}

const bcAddPost = (web3Context: Web3Context, hash: string) =>
  new Promise(resolve => {
    web3Context.postsContract.methods.addPost(hash)
      .send({
        from: web3Context.account,
        value: web3Context.web3.utils.toWei('0.005', 'ether'),
        gas: 1000000,
      })
      .on('receipt', (receipt) => { console.log(receipt); resolve({ success: true }) })
      .on('error', (error: Error) => resolve({ error }));
  });

export function* watchSubmitPost() {
  yield takeLatest(STORE_POST_START, function* ({ payload }: ReturnType<typeof submitPost>) {
    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    const author = getUser();
    const hash = hashPost(payload.web3Context.web3, payload.post, author, now);
    payload.web3Context.postsContract.methods.getPostCount().call()
      .then(console.log);
    try {
      yield call(createPost, {
        title: payload.post.title,
        content: payload.post.content,
        datetime: now,
        hash
      });
    } catch(error) {
      yield put({type: STORE_POST_SERVER_FAIL, error});
      return;
    }
    yield put({type: STORE_POST_SERVER_SUCCESS});
    const { success, error } = yield call(bcAddPost, payload.web3Context, hash);
    if (success) {
      yield put({ type: STORE_POST_BC_SUCCESS});
    } else if (error) {
      yield put({ type: STORE_POST_BC_FAIL, error });
    }
  });
}

export function* watchFetchPostComments() {
  const web3 = new Web3();
  yield takeEvery(FETCH_COMMENTS_FOR_POST_START, function*({ payload }: ReturnType<typeof fetchPostComments>) {
    try {
      const response = yield call(axios.get, API_URLS.POST_COMMENTS.replace('<pk>', String(payload.postId)));
      for (const comment of response.data) {
        const response = yield call(axios.get, API_URLS.COMMENT_BALANCE.replace('<pk>', String(comment.id)));
        comment['balance'] = web3.utils.fromWei(String(response.data.balance), 'ether');
      }
      console.log(response.data);
      yield put({ type: FETCH_COMMENTS_FOR_POST, payload: response.data, postId: payload.postId })
    } catch (error) {
      console.error(error);
    }
  });
}

export function* watchFetchPostDetails() {
  yield takeEvery(FETCH_POST_DETAILS, function*({ payload }: ReturnType<typeof fetchPostDetails>) {
    try {
      const response = yield call(axios.get, API_URLS.POST_DETAILS.replace('<pk>', String(payload.postId)));
      yield put({ type: FETCH_POST_DETAILS_SUCCESS, payload: response.data, postId: payload.postId });
    } catch (error) {
      yield put({ type: FETCH_POST_DETAILS_ERROR, error });
    }
  });
}
