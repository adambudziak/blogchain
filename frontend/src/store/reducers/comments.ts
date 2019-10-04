import {
  SUBMIT_COMMENT_BC_FAIL,
  SUBMIT_COMMENT_BC_SUCCESS,
  SUBMIT_COMMENT_SERVER_FAIL,
  SUBMIT_COMMENT_SERVER_SUCCESS,
  SUBMIT_COMMENT_START,
} from 'actions/types';
import { AnyAction } from "redux";

export interface CommentsState {
  submitLoading: boolean;
  submitError: Error | null;
}

const initialState: CommentsState = {
  submitLoading: false,
  submitError: null,
};

const reducer = (state=initialState, action: AnyAction): CommentsState => {
  switch (action.type) {
    case SUBMIT_COMMENT_START:
      return {
        ...state,
        submitLoading: true,
        submitError: null,
      };
    case SUBMIT_COMMENT_SERVER_FAIL:
      return {
        ...state,
        submitLoading: false,
        submitError: action.error,
      };
    case SUBMIT_COMMENT_SERVER_SUCCESS:
      return {
        ...state, // maybe add another state to loading so we can show both stages?
      };
    case SUBMIT_COMMENT_BC_FAIL:
      return {
        ...state,
        submitLoading: false,
        submitError: action.error,
      };
    case SUBMIT_COMMENT_BC_SUCCESS:
      return {
        ...state,
        submitLoading: false,
      };
    default:
      return state;
  }
};

export default reducer;
