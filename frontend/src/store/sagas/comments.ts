import Web3 from "web3";
import moment from 'moment';
import { takeLatest, call, put } from 'redux-saga/effects';

import { getUser } from "src/store/utility";
import { API_URLS, createComment } from "src/api";

import { CommentData, submitComment } from "actions/comments";
import {
  STORE_POST_SERVER_FAIL,
  SUBMIT_COMMENT_BC_FAIL,
  SUBMIT_COMMENT_BC_SUCCESS,
  SUBMIT_COMMENT_SERVER_SUCCESS,
  SUBMIT_COMMENT_START
} from "actions/types";
import { Web3Context } from "reducers/bc";


const bcAddComment = (web3Context: Web3Context, hash: string, postHash: string) =>
  new Promise(resolve => {
    web3Context.commentsContract.methods.addComment(hash, postHash)
      .send({
        from: web3Context.account,
        value: web3Context.web3.utils.toWei('0.001', 'ether'),
        gas: 1000000,
      })
      .on('confirmation', () => resolve({ success: true }))
      .on('error', (error: Error) => resolve({ error }));
  });


function hashComment(web3: Web3, comment: CommentData, author: string, now: string) {
  const digest = author + now + comment.content;
  return web3.utils.keccak256(digest);
}

export function* watchSubmitComment() {
  yield takeLatest(SUBMIT_COMMENT_START, function*({ payload }: ReturnType<typeof submitComment>) {
    const { web3Context, comment, postHash } = payload;

    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    const author = getUser();
    const hash = hashComment(web3Context.web3, comment, author, now) ;
    const postUrl = API_URLS.POSTS + comment.postId + '/';

    try {
      yield call(createComment, {
        content: comment.content,
        datetime: now,
        hash,
        post: postUrl,
      });
    } catch (error) {
      yield put({ type: STORE_POST_SERVER_FAIL, error });
      return;
    }

    yield put({ type: SUBMIT_COMMENT_SERVER_SUCCESS });

    const { success, error }  = yield call(bcAddComment, web3Context, hash, postHash);
    if (success) {
      yield put({ type: SUBMIT_COMMENT_BC_SUCCESS });
    } else if (error) {
      yield put({ type: SUBMIT_COMMENT_BC_FAIL, error });
    }
  });
}
