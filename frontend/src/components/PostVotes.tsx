import React from 'react';
import { connect } from 'react-redux';

import { fetchUpvotesForPost, fetchDownvotesForPost } from '../store/actions/posts';
import { Dispatch } from "redux";
import { State } from "../store/reducers";

interface OwnProps {
    postId: number,
    submitVote: (post: {postId: number, isUpvote: boolean}) => void,
}

interface StateToProps {
    postUpvotes: any,
    postDownvotes: any
}

interface DispatchToProps {
    fetchUpvotesForPost: (postId: number) => void,
    fetchDownvotesForPost: (postId: number) => void,
}

type Props = OwnProps & StateToProps & DispatchToProps;

enum VoteType {
    Upvote = 'postUpvotes',
    Downvote = 'postDownvotes',
}

class PostVotesComponents extends React.Component<Props> {

    componentWillMount() {
        this.props.fetchUpvotesForPost(this.props.postId);
        this.props.fetchDownvotesForPost(this.props.postId);
        setInterval(_ => {
            this.props.fetchUpvotesForPost(this.props.postId);
            this.props.fetchDownvotesForPost(this.props.postId);
        }, 5000);
    }

    getPostVotes = (voteType: VoteType) => {
        const propVotes = this.props[voteType][this.props.postId];
        if (propVotes === undefined || propVotes === null) {
            return [];
        }
        return propVotes;
    };

    submitVote = (isUpvote: boolean) => {
        this.props.submitVote({
            postId: this.props.postId,
            isUpvote
        })
    };

    render() {
        const upvotes = this.getPostVotes(VoteType.Upvote);
        const downvotes = this.getPostVotes(VoteType.Downvote);
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

const mapStateToProps = (state: State): StateToProps => {
    return {
        postUpvotes: state.posts.postUpvotes,
        postDownvotes: state.posts.postDownvotes,
    }
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchToProps => ({
    fetchUpvotesForPost: (postId: number) => fetchUpvotesForPost(postId)(dispatch),
    fetchDownvotesForPost: (postId: number) => fetchDownvotesForPost(postId)(dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PostVotesComponents);
