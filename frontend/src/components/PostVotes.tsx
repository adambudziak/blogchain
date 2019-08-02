import React from 'react';
import { connect } from 'react-redux';

import { fetchUpvotesForPost, fetchDownvotesForPost } from '../store/actions/posts';

class PostVotesComponents extends React.Component {

    componentWillMount() {
        this.props.fetchUpvotesForPost(this.props.postId);
        this.props.fetchDownvotesForPost(this.props.postId);
        setInterval(_ => {
            this.props.fetchUpvotesForPost(this.props.postId);
            this.props.fetchDownvotesForPost(this.props.postId);
        }, 5000);
    }

    getPostVotes = (voteType) => {
        const propVotes = this.props[voteType][this.props.postId];
        if (propVotes === undefined || propVotes === null) {
            return [];
        }
        return propVotes;
    }

    submitVote = (isUpvote) => {
        this.props.submitVote({
            postId: this.props.postId,
            isUpvote
        })
    }

    render() {
        const upvotes = this.getPostVotes('postUpvotes');
        const downvotes = this.getPostVotes('postDownvotes');
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
        postUpvotes: state.posts.postUpvotes,
        postDownvotes: state.posts.postDownvotes,
    }
}

export default connect(mapStateToProps, {
    fetchUpvotesForPost,
    fetchDownvotesForPost,
})(PostVotesComponents);