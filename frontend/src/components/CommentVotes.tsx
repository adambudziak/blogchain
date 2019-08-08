import React from 'react';
import { connect } from 'react-redux';

import { fetchUpvotesForComment, fetchDownvotesForComment } from '../store/actions/comments';
import { Dispatch } from "redux";
import { State } from "../store/reducers";

interface StateToProps {
    commentUpvotes: any,
    commentDownvotes: any,
}

interface DispatchToProps {
    fetchUpvotesForComment: (commentId: number) => void,
    fetchDownvotesForComment: (commentId: number) => void,
}

interface OwnProps {
    commentId: number,
    submitVote: (comment: {commentId: number, isUpvote: boolean}) => void,
}

type Props = StateToProps & DispatchToProps & OwnProps;

enum VoteType {
    Upvote = 'commentUpvotes',
    Downvote = 'commentDownvotes',
}

class CommentVotesComponents extends React.Component<Props> {

    componentWillMount() {
        this.props.fetchUpvotesForComment(this.props.commentId);
        this.props.fetchDownvotesForComment(this.props.commentId);
        setInterval(_ => {
            this.props.fetchUpvotesForComment(this.props.commentId);
            this.props.fetchDownvotesForComment(this.props.commentId);
        }, 5000);
    }

    getCommentVotes = (voteType: VoteType) => {
        const propVotes = this.props[voteType][this.props.commentId];
        if (propVotes === undefined || propVotes === null) {
            return [];
        }
        return propVotes;
    };

    submitVote = (isUpvote: boolean) => {
        this.props.submitVote({
            commentId: this.props.commentId,
            isUpvote
        })
    };

    render() {
        const upvotes = this.getCommentVotes(VoteType.Upvote);
        const downvotes = this.getCommentVotes(VoteType.Downvote);
        return (
            <div>
                <div>{upvotes.length} upvotes</div>
                <div>{downvotes.length} downvotes</div>
                <button onClick={() => {this.submitVote(true)}}>Upvote</button>
                <button onClick={() => {this.submitVote(false)}}>Downvote</button>
            </div>
        );
    }
}

const mapStateToProps = (state: State): StateToProps => ({
    commentUpvotes: state.comments.commentUpvotes,
    commentDownvotes: state.comments.commentDownvotes,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchToProps => ({
    fetchUpvotesForComment: (commentId: number) => fetchUpvotesForComment(commentId)(dispatch),
    fetchDownvotesForComment: (commentId: number) => fetchDownvotesForComment(commentId)(dispatch),
});


export default connect(mapStateToProps, mapDispatchToProps)(CommentVotesComponents);
