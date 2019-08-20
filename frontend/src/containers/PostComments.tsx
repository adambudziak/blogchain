import React, {useEffect} from 'react';
import { connect } from 'react-redux';

import { withPolling } from "src/polling";

import { ApiComment } from "actions/comments";
import { fetchPostComments } from 'actions/posts';
import { CommentVoteData, submitCommentVote } from 'actions/votes';
import CommentVotes from 'components/CommentVotes';
import { Web3Context } from "reducers/bc";
import { State } from "reducers/index";

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

const PostCommentsComponent = (props: Props) => {
    useEffect(withPolling(() => props.fetchPostComments(props.postId)), []);

    const submitVote = (vote: CommentVoteData) => {
        const comment = props.postComments[props.postId]
            .find(c => c.id === vote.commentId);
        if (comment === undefined) {
            console.log('Vote.comment is undefined?');
            return;
        }
        props.submitCommentVote(props.web3Context, vote, comment.data_hash);
    };

    const comments = props.postComments[props.postId] || [];

    return (
        comments.length === 0 ?
            (
                <p>No comments yet</p>
            )
            :
            <div>
                <h5>Comments for #{props.postId}</h5>
                {comments.map((c, i) => {
                    return (
                        <div key={i}>
                            <CommentVotes comment={c} submitVote={submitVote}/>
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
};

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
