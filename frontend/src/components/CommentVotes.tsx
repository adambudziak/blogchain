import React from 'react';
import { connect } from 'react-redux';

import { fetchUpvotesForComment, fetchDownvotesForComment } from '../store/actions/comments';

interface StateProps {
    commentUpvotes: any,
    commentDownvotes: any,
}

interface DispatchProps {
    fetchUpvotesForComment: (commentId: number) => void,
    fetchDownvotesForComment: (commentId: number) => void,
}

interface OwnProps {
    commentId: number,
    submitVote: (comment: {commentId: number, isUpvote: boolean}) => void,
}

type Props = StateProps & DispatchProps & OwnProps;

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

const mapStateToProps = (state: any): StateProps => ({
    commentUpvotes: state.comments.commentUpvotes,
    commentDownvotes: state.comments.commentDownvotes,
});

const mapDispatchToProps = (): DispatchProps => ({
    fetchUpvotesForComment,
    fetchDownvotesForComment,
});


export default connect(mapStateToProps, mapDispatchToProps)(CommentVotesComponents);
