import { takeLatest, put, call } from 'redux-saga/effects';
import moment from "moment";
import Web3 from "web3";

import { createCommentVote, createPostVote } from "src/api";
import { getUser } from "src/store/utility";

import { SUBMIT_COMMENT_VOTE, SUBMIT_POST_VOTE } from "actions/types";
import { submitCommentVote, submitPostVote, VoteData } from "actions/votes";
import { Web3Context } from "reducers/bc";

function hashVote(web3: Web3, vote: VoteData, author: string, now: string) {
  const isUpvote = vote.isUpvote ? '1' : '0';
  const digest = author + now + isUpvote;
  return web3.utils.keccak256(digest);
}

const bcAddVote = (web3Context: Web3Context, vote: VoteData, hash: string, targetHash: string) =>
  new Promise(resolve => {
    const contract = 'postId' in vote ? web3Context.postVotesContract : web3Context.commentVotesContract;
    contract.methods.addVote(hash, targetHash)
      .send({
        from: web3Context.account,
        value: web3Context.web3.utils.toWei('0.002', 'ether'),
        gas: 1000000,
      })
      .on('transactionHash', () => resolve({ success: true }))
      .on('confirmation', () => resolve({ success: true }))
      .on('error', (error: Error) => resolve({ error }))
  });

export function* watchSubmitPostVote() {
  yield takeLatest(SUBMIT_POST_VOTE.START, function*({ payload }: ReturnType<typeof submitPostVote>) {
    const { web3Context, vote, postHash } = payload;
    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    const author = getUser();
    const hash = hashVote(web3Context.web3, vote, author, now);
    try {
      yield call(createPostVote, { ...vote, datetime: now, hash });
    } catch (error) {
      yield put({ type: SUBMIT_POST_VOTE.SERVER_ERROR, error });
      return;
    }

    yield put({ type: SUBMIT_POST_VOTE.SERVER_SUCCESS });

    const { success, error } = yield call(bcAddVote, web3Context, vote, hash, postHash);
    if (success) {
      yield put({ type: SUBMIT_POST_VOTE.BC_SUCCESS });
    } else if (error) {
      yield put({ type: SUBMIT_POST_VOTE.BC_ERROR, error });
    }
  })
}

export function* watchSubmitCommentVote() {
  yield takeLatest(SUBMIT_COMMENT_VOTE.START, function*({ payload }: ReturnType<typeof submitCommentVote>) {
    const { web3Context, vote, commentHash } = payload;
    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    const author = getUser();
    const hash = hashVote(web3Context.web3, vote, author, now);
    try {
      yield call(createCommentVote, { ...vote, datetime: now, hash });
    } catch (error) {
      yield put({ type: SUBMIT_COMMENT_VOTE.SERVER_ERROR, error });
      return;
    }

    yield put({ type: SUBMIT_COMMENT_VOTE.SERVER_SUCCESS });

    const { success, error } = yield call(bcAddVote, web3Context, vote, hash, commentHash);
    if (success) {
      yield put({ type: SUBMIT_COMMENT_VOTE.BC_SUCCESS });
    } else if (error) {
      yield put({ type: SUBMIT_COMMENT_VOTE.BC_ERROR, error });
    }
  })
}
