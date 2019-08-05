import React from 'react';
import { connect } from 'react-redux';

import { fetchCommentsForPost } from '../store/actions/posts';
import {CommentVoteData, submitCommentVote} from '../store/actions/votes';
import CommentVotes from '../components/CommentVotes';
import {Dispatch} from "redux";
import {ApiComment} from "../store/actions/comments";
import {Web3Context} from "../store/reducers/bc";

interface StateProps {
    web3Context: Web3Context,
    postComments: {[postId: number]: ApiComment[]},
}

interface DispatchProps {
    fetchCommentsForPost: (postId: number) => void,
    submitCommentVote: (web3Context: any, vote: any, commentHash: string) => void,
}

interface OwnProps {
    postId: number,
}

type Props = StateProps & DispatchProps & OwnProps;

class PostCommentsComponent extends React.Component<Props> {

    componentWillMount() {
        this.props.fetchCommentsForPost(this.props.postId);
        setInterval(_ => {
            this.props.fetchCommentsForPost(this.props.postId);
        }, 5000);
    }

    getComments = () => {
        const propComments = this.props.postComments[this.props.postId];
        if (propComments === undefined || propComments === null) {
            return [];
        }
        return propComments;
    };

    submitVote = (vote: CommentVoteData) => {
        const comment = this.props.postComments[this.props.postId]
            .find(c => c.id === vote.commentId);
        if (comment === undefined) {
            console.log('Vote.comment is undefined?');
            return;
        }
        this.props.submitCommentVote(this.props.web3Context, vote, comment.data_hash);
    };

    render() {
        const comments = this.getComments();
        return (
            comments.length === 0 ?
            (
                <p>No comments yet</p>
            ) 
            :
            <div>
                <h5>Comments for #{this.props.postId}</h5>
                {comments.map((c, i) => {
                return (
                    <div key={i}>
                        <CommentVotes commentId={c.id} submitVote={this.submitVote}/>
                        <p>{c.content}</p>
                        <p style={{fontStyle: "italic"}}>~ by {
                            c.author !== undefined ? c.author : 'Anonymous'
                            }
                        </p>
                    </div>
                )
                })}
            </div>
        )
    }
}

const mapStateToProps = (state: any): StateProps => {
    return {
        web3Context: state.bc.web3Context,
        postComments: state.posts.postComments,
    }
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    fetchCommentsForPost: (postId) => fetchCommentsForPost(postId)(dispatch),
    submitCommentVote: (web3Context, vote, commentHash) => submitCommentVote(web3Context, vote, commentHash)(dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PostCommentsComponent);
