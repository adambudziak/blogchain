import {State} from "reducers/index";
import {fetchPostComments, fetchPostDetails, PostDetail} from "actions/posts";
import {connect} from "react-redux";
import React, {useEffect, useState} from "react";
import {Icon, List} from "antd";
import {ApiComment, CommentData, submitComment} from "actions/comments";
import {withPolling} from "src/polling";
import CreateCommentForm from "components/CommentForm";
import {Web3Context} from "reducers/bc";
import {initWeb3} from "actions/bc";
import {submitCommentVote, submitPostVote} from "actions/votes";


import 'src/styles/PostsDetail.scss';

interface StateToProps {
    post: PostDetail,
    comments: ApiComment[] | undefined,
    web3Context: Web3Context | null,
    commentSubmit: {
        loading: boolean,
        error: Error | null,
    },
    voteSubmit: {
        loading: boolean,
        error: Error | null,
    }
}

interface DispatchToProps {
    fetchPostComments: typeof fetchPostComments,
    fetchPostDetails: typeof fetchPostDetails,
    submitComment: typeof submitComment,
    initWeb3: typeof initWeb3,
    submitPostVote: typeof submitPostVote,
    submitCommentVote: typeof submitCommentVote
}

// TODO probably should use RouteComponentProps
interface OwnProps {
    match: {
        params: {
            postId: number,
        }
    }
}

type Props = OwnProps & DispatchToProps & StateToProps;

const IconText = ({type, text, propStyle}: {type: string, text: string, propStyle?: any}) => (
    <span>
        <Icon type={type} style={{marginRight: 8, ...propStyle}}/>
        {text}
    </span>
);

const PostDetailComponent = (props: Props) => {
    const [unfinishedTasks, setUnfinishedTasks] = useState<((web3Context: Web3Context) => any)[]>([]);
    const [wasLoading, setWasLoading] = useState({ comment: false, vote: false });

    const postId = Number(props.match.params.postId);

    useEffect(withPolling(() => props.fetchPostComments(postId),  60000), [props.fetchPostComments, postId]);
    useEffect(() => {
        if (props.web3Context === null || unfinishedTasks.length === 0) { return }
        const web3Context: Web3Context = props.web3Context;
        console.log('Unfinished tasks: ', unfinishedTasks);
        unfinishedTasks.forEach(task => task(web3Context));
        setUnfinishedTasks([]);
    }, [props.web3Context])

    useEffect(() => {
        if (!props.commentSubmit.loading && wasLoading.comment) {
            setWasLoading({...wasLoading, comment: false});
            props.fetchPostComments(postId); 
        }
        if (!props.voteSubmit.loading && wasLoading.vote) {
            setWasLoading({...wasLoading, vote: false});
            props.fetchPostDetails(postId);
        }
    }, [props.commentSubmit, props.fetchPostComments]);

    if (props.post.result instanceof Error) {
        return (
            <div>
                An error occurred {props.post.result}.
            </div>
        );
    }

    if (props.post.result === null || props.post.result.id !== postId) {
        if (!props.post.loading) {
            props.fetchPostDetails(postId);
        }
        return (
            <div>
                Loading ...
            </div>
        )
    }

    const postHash = props.post.result.data_hash;

    const _submitComment = (comment: CommentData) => {
        const task = (web3Context: Web3Context) => {
            console.log('Running submitComment task');
            if (web3Context === null) { return }
            console.log('Web3context is not null, continuing.');
            props.submitComment(web3Context, comment, postHash);
            setWasLoading({ ...wasLoading, comment: true });
        }
        if (props.web3Context === null) {
            props.initWeb3();
            unfinishedTasks.push(task);
            setUnfinishedTasks(unfinishedTasks);
        } else {
            task(props.web3Context);
        }
    };

    const _submitPostVote = (upvote: boolean) => () => {
        const task = (web3Context: Web3Context) => {
            console.log('Running submitVote task');
            if (web3Context === null) { return; }
            console.log('Web3context is not null, continuing.');
            props.submitPostVote(web3Context, { isUpvote: upvote, postId: postId }, postHash);
            setWasLoading({ ...wasLoading, vote: true });
        };
        if (props.web3Context === null) {
            props.initWeb3();
            unfinishedTasks.push(task);
            setUnfinishedTasks(unfinishedTasks);
        } else {
            task(props.web3Context);
        }
    };

    const verifiedLabel = props.post.result.verified ?
       <span style={{ color: "green" }}>verified</span>
     : <span style={{color: "red" }}>not verified</span>;

    return (
        <div>
            <span style={{ display: "inline-block" }}>
                <div className="vote-wrapper" onClick={_submitPostVote(true)}><IconText type="up" text=""/></div>
                <div>{ props.post.result.upvotes - props.post.result.downvotes }</div>
                <div className="vote-wrapper" onClick={_submitPostVote(false)}><IconText type="down" text=""/></div>
            </span>
            <h1 style={{ display: "inline-block "}}>
                { props.post.result.title }
            </h1>
            {"    "}{verifiedLabel}
            <p>{ props.post.result.content }</p>
            <hr/>
            Leave a comment!
            <CreateCommentForm postId={postId} onSubmit={_submitComment} />
            <hr/>
            Other comments
            <List
                itemLayout="vertical"
                size="large"
                pagination={{
                    onChange: page => {
                        console.log(page);
                    },
                    pageSize: 3,
                }}
                dataSource={props.comments}

                renderItem={item => (
                    <List.Item
                        key={item.id}
                        actions={[
                            <IconText propStyle={{color: "blue"}} type="like-o" text={item.upvotes.toString()} key="list-vertical-like-o"/>,
                            <IconText propStyle={{color: "red"}} type="dislike-o" text={item.downvotes.toString()} key="list-vertical-dislike-o"/>,
                            <IconText propStyle={{color: "green"}} type="dollar-o" text="156" key="list-vertical-dollar-o"/>,
                        ]}
                    >
                        <List.Item.Meta
                            description={"by " + item.author}
                        />
                        {item.content}
                    </List.Item>
                )}
            />
        </div>
    );
};

const mapStateToProps = (state: State, props: OwnProps): StateToProps => ({
    post: state.posts.postDetails,
    comments: state.posts.postComments[props.match.params.postId],
    web3Context: state.bc.web3Context,
    commentSubmit: {
        loading: state.comments.submitLoading,
        error: state.comments.submitError,
    },
    voteSubmit: {
        loading: state.votes.submitLoading,
        error: state.votes.submitError,
    }
});

const mapDispatchToProps: DispatchToProps = {
    fetchPostComments,
    fetchPostDetails,
    submitComment,
    initWeb3,
    submitPostVote,
    submitCommentVote,
};

export default connect(mapStateToProps, mapDispatchToProps)(PostDetailComponent);
