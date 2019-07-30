import React from 'react';
import { connect } from 'react-redux';

import { fetchCommentsForPost } from '../store/actions/posts';
import { submitCommentVote } from '../store/actions/votes';
import CommentVotes from '../components/CommentVotes';

class PostCommentsComponent extends React.Component {

    componentWillMount() {
        this.props.fetchCommentsForPost(this.props.postId);
        setInterval(_ => {
            this.props.fetchCommentsForPost(this.props.postId);
        }, 5000);
    }

    defaultWeb3Context = () => {
        return {
            web3: this.props.web3,
            currentAccount: this.props.currentAccount,
            postsContract: this.props.postsContract,
            commentsContract: this.props.commentsContract,
            upvotesContract: this.props.upvotesContract,
            downvotesContract: this.props.downvotesContract,
        }
    };

    getComments = () => {
        const propComments = this.props.postComments[this.props.postId];
        if (propComments === undefined || propComments === null) {
            return [];
        }
        return propComments;
    };

    submitVote = (vote) => {
        const commentHash = this.props.postComments[this.props.postId].find(c => c.id === vote.commentId).data_hash;
        this.props.submitCommentVote(this.defaultWeb3Context(), vote, commentHash);
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

const mapStateToProps = state => {
    return {
        web3: state.bc.web3,
        currentAccount: state.bc.account,
        postsContract: state.bc.postsContract,
        commentsContract: state.bc.commentsContract,
        postComments: state.posts.postComments,
        upvotesContract: state.bc.upvotesContract,
        downvotesContract: state.bc.downvotesContract,
    }
};

export default connect(mapStateToProps, {
    fetchCommentsForPost,
    submitCommentVote,
})(PostCommentsComponent);
