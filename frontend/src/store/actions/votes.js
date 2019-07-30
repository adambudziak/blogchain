import {
    SUBMIT_VOTE 
} from './types';

import moment from 'moment';
import { createPostVote, createCommentVote } from '../../api';
import { getUser } from '../utility';

const submitVoteStart = () => {
    return {
        type: SUBMIT_VOTE.START,
    }
};

const submitVoteServerSuccess = () => {
    return {
        type: SUBMIT_VOTE.SERVER_SUCCESS,
    }
};

const submitVoteServerFail = error => {
    return {
        type: SUBMIT_VOTE.SERVER_FAIL,
        error,
    }
};

const submitVoteBcSuccess = () => {
    return {
        type: SUBMIT_VOTE.BC_SUCCESS,
    }
};

const submitVoteBcFail = error => {
    return {
        type: SUBMIT_VOTE.BC_FAIL,
        error,
    }
};

const submitVote = (dispatch, vote, web3, createVoteCallback, bcCallback) => {
    dispatch(submitVoteStart());
    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    const author = getUser();
    const hash = hashVote(web3, vote, author, now);
    createVoteCallback({
        ...vote,
        datetime: now,
        hash,
    })
        .then(_response => {
            dispatch(submitVoteServerSuccess());
            bcCallback(hash)
                .on('confirmation', () => dispatch(submitVoteBcSuccess()))
                .on('error', error => dispatch(submitVoteBcFail(error)));
        })
        .catch(error => {
            console.error(error);
            dispatch(submitVoteServerFail(error))
        })
};


export const submitPostVote = (web3Context, vote, postHash) => dispatch => {
    submitVote(dispatch, vote, web3Context.web3, createPostVote, (hash) => {
        const contract = vote.isUpvote ? web3Context.upvotesContract : web3Context.downvotesContract;
        return contract.methods.voteForPost(hash, postHash).send({
            from: web3Context.currentAccount,
            value: web3Context.web3.utils.toWei('0.001', 'ether'),
        })
        ;
    });
};

// TODO this should probably get separate actions
export const submitCommentVote = (web3Context, vote, commentHash) => dispatch => {
    submitVote(dispatch, vote, web3Context.web3, createCommentVote, (hash) => {
        const contract = vote.isUpvote ? web3Context.upvotesContract : web3Context.downvotesContract;
        return contract.methods.voteForComment(hash, commentHash).send({
            from: web3Context.currentAccount,
            value: web3Context.web3.utils.toWei('0.001', 'ether')
        })
    });
};

function hashVote(web3, vote, author, now) {
    const isUpvote = vote.isUpvote ? '1' : '0';
    const digest = author + now + isUpvote;
    return web3.utils.keccak256(digest);
}