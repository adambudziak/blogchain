import React from 'react';
import { connect } from 'react-redux';

import { fetchUpvotesForComment, fetchDownvotesForComment } from '../store/actions/comments';

class CommentVotesComponents extends React.Component {

    componentWillMount() {
        this.props.fetchUpvotesForComment(this.props.commentId);
        this.props.fetchDownvotesForComment(this.props.commentId);
        setInterval(_ => {
            this.props.fetchUpvotesForComment(this.props.commentId);
            this.props.fetchDownvotesForComment(this.props.commentId);
        }, 5000);
    }

    getCommentVotes = (voteType) => {
        const propVotes = this.props[voteType][this.props.commentId];
        if (propVotes === undefined || propVotes === null) {
            return [];
        }
        return propVotes;
    };

    submitVote = (isUpvote) => {
        this.props.submitVote({
            commentId: this.props.commentId,
            isUpvote
        })
    };

    render() {
        const upvotes = this.getCommentVotes('commentUpvotes');
        const downvotes = this.getCommentVotes('commentDownvotes');
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

const mapStateToProps = state => {
    return {
        commentUpvotes: state.comments.commentUpvotes,
        commentDownvotes: state.comments.commentDownvotes,
    }
};

export default connect(mapStateToProps, {
    fetchUpvotesForComment,
    fetchDownvotesForComment,
})(CommentVotesComponents);
