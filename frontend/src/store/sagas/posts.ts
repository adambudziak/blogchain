import { takeLatest, takeEvery, call, put } from 'redux-saga/effects';
import {
    FETCH_COMMENTS_FOR_POST, FETCH_COMMENTS_FOR_POST_START,
    FETCH_POSTS,
    FETCH_POSTS_ERROR,
    FETCH_POSTS_SUCCESS,
    STORE_POST_BC_FAIL,
    STORE_POST_BC_SUCCESS,
    STORE_POST_SERVER_FAIL,
    STORE_POST_SERVER_SUCCESS,
    STORE_POST_START,
} from "../actions/types";
import { API_URLS, createPost } from "../../api";
import axios from 'axios';
import { Web3Context } from "../reducers/bc";
import moment from "moment";
import { getUser } from "../utility";
import { fetchPostComments, PostData, submitPost } from "../actions/posts";
import Web3 from "web3";

export function* watchFetchPosts() {
    yield takeLatest(FETCH_POSTS, function* () {
        try {
            const response = yield call(axios.get, API_URLS.POSTS);
            yield put({ type: FETCH_POSTS_SUCCESS, payload: response.data.results })
        } catch (error) {
            yield put({ type: FETCH_POSTS_ERROR, error })
        }
    });
}

const bcAddPost = (web3Context: Web3Context, now: string, hash: string) =>
    new Promise(resolve => {
        web3Context.postsContract.methods.addPost(now, hash)
            .send({
                from: web3Context.account,
                value: web3Context.web3.utils.toWei('0.005', 'ether')
            })
            .on('confirmation', () => resolve({ success: true }))
            .on('error', (error: Error) => resolve({ error }));
    });

export function* watchSubmitPost() {
    yield takeLatest(STORE_POST_START, function* ({ payload }: ReturnType<typeof submitPost>) {
        const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
        const author = getUser();
        const hash = hashPost(payload.web3Context.web3, payload.post, author, now);
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
        const { success, error } = yield call(bcAddPost, payload.web3Context, now, hash);
        if (success) {
            yield put({ type: STORE_POST_BC_SUCCESS});
        } else if (error) {
            yield put({ type: STORE_POST_BC_FAIL, error });
        }
    });
}

function hashPost(web3: Web3, post: PostData, author: string, now: string) {
    const digest = author + now + post.title + post.content;
    return web3.utils.keccak256(digest);
}

export function* watchFetchPostComments() {
    yield takeEvery(FETCH_COMMENTS_FOR_POST_START, function*({ payload }: ReturnType<typeof fetchPostComments>) {
        try {
            const response = yield call(axios.get, API_URLS.POST_COMMENTS.replace('<pk>', String(payload.postId)));
            yield put({ type: FETCH_COMMENTS_FOR_POST, payload: response.data, postId: payload.postId })
        } catch (error) {
            console.error(error);
        }
    });
}
