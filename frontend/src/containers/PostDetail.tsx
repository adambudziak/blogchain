import {State} from "reducers/index";
import {fetchPostComments, fetchPostDetails, PostDetail} from "actions/posts";
import {connect} from "react-redux";
import React, {useEffect} from "react";
import {Icon, List} from "antd";
import {ApiComment, CommentData, submitComment} from "actions/comments";
import {withPolling} from "src/polling";
import CreateCommentForm from "components/CommentForm";
import {Web3Context} from "reducers/bc";
import {initWeb3} from "actions/bc";

interface StateToProps {
    post: PostDetail,
    comments: ApiComment[] | undefined,
    web3Context: Web3Context | null,
}

interface DispatchToProps {
    fetchPostComments: typeof fetchPostComments,
    fetchPostDetails: typeof fetchPostDetails,
    submitComment: typeof submitComment,
    initWeb3: typeof initWeb3,
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

    const postId = Number(props.match.params.postId);

    useEffect(withPolling(() => props.fetchPostComments(postId),  60000), [props.fetchPostComments, postId]);

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
        if (props.web3Context === null) {
            initWeb3();
            console.error('Web3context is null');
            return;
        }
        props.submitComment(props.web3Context, comment, postHash);
    };

    return (
        <div>
            <h1>{ props.post.result.title }</h1>
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
});

const mapDispatchToProps: DispatchToProps = {
    fetchPostComments,
    fetchPostDetails,
    submitComment,
    initWeb3,
};

export default connect(mapStateToProps, mapDispatchToProps)(PostDetailComponent);
