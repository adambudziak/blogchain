import { all } from 'redux-saga/effects';

import { watchInitWeb3 } from './bc';
import {
    watchFetchPostComments,
    watchFetchPostDownvotes,
    watchFetchPosts,
    watchFetchPostUpvotes,
    watchSubmitPost
} from "./posts";
import {watchSubmitComment} from "./comments";
import {watchSubmitCommentVote, watchSubmitPostVote} from "./votes";
import {watchAuthCheckState, watchLogin, watchSignup, watchLogout} from "./auth";

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
        watchFetchPostUpvotes(),
        watchFetchPostDownvotes(),
        watchSubmitComment(),
        watchSubmitPostVote(),
        watchSubmitCommentVote(),
    ]);
}
