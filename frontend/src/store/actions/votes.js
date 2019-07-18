import {
    SUBMIT_VOTE 
} from './types';

import moment from 'moment';
import { createVote } from '../../api';
import { getUser } from '../utility';

const submitVoteStart = () => {
    return {
        type: SUBMIT_VOTE.START,
    }
}

const submitVoteServerSuccess = () => {
    return {
        type: SUBMIT_VOTE.SERVER_SUCCESS,
    }
}

const submitVoteServerFail = error => {
    return {
        type: SUBMIT_VOTE.SERVER_FAIL,
        error,
    }
}

const submitVoteBcSuccess = () => {
    return {
        type: SUBMIT_VOTE.BC_SUCCESS,
    }
}

const submitVoteBcFail = error => {
    return {
        type: SUBMIT_VOTE.BC_FAIL,
        error,
    }
}


export const submitVote = (web3Context, vote, postHash) => dispatch => {
    dispatch(submitVoteStart());
    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    const author = getUser();
    const hash = hashVote(web3Context.web3, vote, author, now);
    createVote({
        isUpvote: vote.isUpvote,
        datetime: now,
        hash,
        post: vote.postId
    })
    .then(_response => {
        dispatch(submitVoteServerSuccess());
        let result;
        if (vote.isUpvote) {
            result = web3Context.upvotesContract.addUpvote(hash, postHash);
        } else {
            result = web3Context.downvotesContract.addDownvote(hash, postHash);
        }
        result
        .on('confirmation', () => dispatch(submitVoteBcSuccess()))
        .on('error', error => dispatch(submitVoteBcFail(error)));
    })
    .catch(error => {
        console.error(error);
        dispatch(submitVoteServerFail(error))
    })
}

function hashVote(web3, vote, author, now) {
    const isUpvote = vote.isUpvote ? '1' : '0';
    const digest = author + now + isUpvote;
    return web3.utils.keccak256(digest);
}