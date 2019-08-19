import React from 'react';
import { connect } from 'react-redux';

import { fetchPostComments } from '../store/actions/posts';
import { CommentVoteData, submitCommentVote } from '../store/actions/votes';
import CommentVotes from '../components/CommentVotes';
import { ApiComment } from "../store/actions/comments";
import { Web3Context } from "../store/reducers/bc";
import { State } from "../store/reducers";
import Timeout = NodeJS.Timeout;

interface StateToProps {
    web3Context: Web3Context | null,
    postComments: {[postId: number]: ApiComment[]},
}

interface DispatchToProps {
    fetchPostComments: (postId: number) => void,
    submitCommentVote: (web3Context: any, vote: any, commentHash: string) => void,
}

interface OwnProps {
    postId: number,
}

type Props = StateToProps & DispatchToProps & OwnProps;

class PostCommentsComponent extends React.Component<Props> {

    intervalId: Timeout | null = null;

    componentDidMount() {
        this.props.fetchPostComments(this.props.postId);
        this.intervalId = setInterval(_ => {
            this.props.fetchPostComments(this.props.postId);
        }, 5000);
    }

    componentWillUnmount(): void {
        if(this.intervalId !== null) {
            clearInterval(this.intervalId);
        }
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
                        <CommentVotes comment={c} submitVote={this.submitVote}/>
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

const mapStateToProps = (state: State): StateToProps => {
    return {
        web3Context: state.bc.web3Context,
        postComments: state.posts.postComments,
    }
};

const mapDispatchToProps: DispatchToProps = {
    fetchPostComments,
    submitCommentVote,
};

export default connect(mapStateToProps, mapDispatchToProps)(PostCommentsComponent);
