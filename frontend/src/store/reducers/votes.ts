import { AnyAction } from "redux";

import {
  SUBMIT_POST_VOTE, SUBMIT_COMMENT_VOTE,
} from 'actions/types';

export interface VotesState {
  submitLoading: boolean;
  submitError: Error | null;
}

const initialState = {
  submitLoading: false,
  submitError: null,
};

const reducer = (state=initialState, action: AnyAction) => {
  switch (action.type) {
    case SUBMIT_COMMENT_VOTE.START:
    case SUBMIT_POST_VOTE.START:
      return {
        ...state,
        submitLoading: true,
        submitError: false,
      };
    case SUBMIT_COMMENT_VOTE.SERVER_ERROR:
    case SUBMIT_POST_VOTE.SERVER_ERROR:
      return {
        ...state,
        submitLoading: false,
        submitError: action.error,
      };
    case SUBMIT_COMMENT_VOTE.SERVER_SUCCESS:
    case SUBMIT_POST_VOTE.SERVER_SUCCESS:
      return state;
    case SUBMIT_COMMENT_VOTE.BC_ERROR:
    case SUBMIT_POST_VOTE.BC_ERROR:
      return {
        ...state,
        submitLoading: false,
        submitError: action.error,
      };
    case SUBMIT_COMMENT_VOTE.BC_SUCCESS:
    case SUBMIT_POST_VOTE.BC_SUCCESS:
      return {
        ...state,
        submitLoading: false,
      };
    default:
      return state;
  }
};

export default reducer;
