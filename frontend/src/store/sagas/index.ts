import { all } from 'redux-saga/effects';

import { watchAuthCheckState, watchLogin, watchLogout, watchSignup } from "sagas/auth";
import { watchInitWeb3 } from 'sagas/bc';
import { watchSubmitComment } from "sagas/comments";
import {
    watchFetchPostComments,
    watchFetchPosts,
    watchSubmitPost

} from "sagas/posts";
import { watchSubmitCommentVote, watchSubmitPostVote } from "sagas/votes";

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export default function* root() {
    yield all([
        watchLogin(),
        watchSignup(),
        watchAuthCheckState(),
        watchLogout(),
        watchInitWeb3(),
        watchFetchPosts(),
        watchSubmitPost(),
        watchFetchPostComments(),
        watchSubmitComment(),
        watchSubmitPostVote(),
        watchSubmitCommentVote(),
    ]);
}
