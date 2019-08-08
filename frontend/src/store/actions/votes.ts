import {
    SUBMIT_VOTE 
} from './types';

import moment from 'moment';
import { createPostVote, createCommentVote } from '../../api';
import { getUser } from '../utility';
import { Dispatch } from "redux";
import Web3 from 'web3';
import PromiEvent from "web3/promiEvent";
import { Web3Context } from "../reducers/bc";
import { AxiosResponse } from "axios";

export type CommentVoteData = {
    commentId: number,
    isUpvote: boolean
}

export type PostVoteData = {
    postId: number,
    isUpvote: boolean,
}

export type VoteData = CommentVoteData | PostVoteData;

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

const submitVoteServerFail = (error: Error) => {
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

const submitVoteBcFail = (error: Error) => {
    return {
        type: SUBMIT_VOTE.BC_FAIL,
        error,
    }
};

const submitVote = (dispatch: Dispatch, vote: VoteData, web3: Web3,
                    createVoteCallback: (vote: any) => Promise<AxiosResponse<any>>,
                    bcCallback: (hash: string) => PromiEvent<any>) => {
    dispatch(submitVoteStart());
    const now = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    const author = getUser();
    const hash = hashVote(web3, vote, author, now);
    createVoteCallback({
        ...vote,
        datetime: now,
        hash,
    })
        .then((_response: any) => {
            dispatch(submitVoteServerSuccess());
            bcCallback(hash)
                .on('confirmation', () => dispatch(submitVoteBcSuccess()))
                .on('error', error => dispatch(submitVoteBcFail(error)));
        })
        .catch((error: Error) => {
            console.error(error);
            dispatch(submitVoteServerFail(error))
        })
};


export const submitPostVote = (web3Context: Web3Context, vote: VoteData, postHash: string) => (dispatch: Dispatch) => {
    submitVote(dispatch, vote, web3Context.web3, createPostVote, (hash: string) => {
        const contract = vote.isUpvote ? web3Context.upvotesContract : web3Context.downvotesContract;
        return contract.methods.voteForPost(hash, postHash).send({
            from: web3Context.account,
            value: web3Context.web3.utils.toWei('0.001', 'ether'),
        })
        ;
    });
};

// TODO this should probably get separate actions
export const submitCommentVote = (web3Context: Web3Context, vote: VoteData, commentHash: string) => (dispatch: Dispatch) => {
    submitVote(dispatch, vote, web3Context.web3, createCommentVote, (hash: string) => {
        const contract = vote.isUpvote ? web3Context.upvotesContract : web3Context.downvotesContract;
        return contract.methods.voteForComment(hash, commentHash).send({
            from: web3Context.account,
            value: web3Context.web3.utils.toWei('0.001', 'ether')
        });
    });
};

function hashVote(web3: Web3, vote: VoteData, author: string, now: string) {
    const isUpvote = vote.isUpvote ? '1' : '0';
    const digest = author + now + isUpvote;
    return web3.utils.keccak256(digest);
}
