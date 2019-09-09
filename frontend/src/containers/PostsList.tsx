import {withPolling} from "src/polling";
import React, {useEffect} from "react";
import {connect} from "react-redux";
import {ApiPost, fetchPosts} from "actions/posts";
import {State} from "reducers/index";
import {RouteComponentProps} from 'react-router-dom';
import {List, Avatar, Icon, Button} from 'antd';

import 'src/styles/PostsView.scss';

interface StateToProps {
    posts: ApiPost[],
}

interface DispatchToProps {
    fetchPosts: () => void,
}

type Props = StateToProps & DispatchToProps & RouteComponentProps;

const IconText = ({type, text, propStyle}: {type: string, text: string, propStyle?: any}) => (
    <span>
        <Icon type={type} style={{marginRight: 8, ...propStyle}}/>
        {text}
    </span>
);

const PostsList = (props: Props) => {
    useEffect(withPolling(props.fetchPosts), [props.fetchPosts]);

    const cutContent = (contentPreview: string): any => {
        return (<p className="post-content">{contentPreview}<br/>{'(Click to see more)'}</p>);
    };

    const openDetail = (postIdx: number) => {
        return props.history.push(`post/${postIdx}/`);
    };

    const openCreatePost = () => {
        return props.history.push(`posts/new/`);
    };

    return (
        <div>
            <Button onClick={openCreatePost}>
                Add your post
            </Button>
            <List
                itemLayout="vertical"
                size="large"
                pagination={{
                    onChange: page => {
                        console.log(page);
                    },
                    pageSize: 50,
                }}
                dataSource={props.posts}
                footer={
                    <div>
                        <b>BlogChain's</b> best posts in the universe
                    </div>
                }
                renderItem={item => (
                    <List.Item
                        onClick={() => openDetail(item.id)}
                        className="post-list-item"
                        key={item.title}
                        actions={[
                            <IconText propStyle={{color: "blue"}} type="like-o" text={item.upvotes.toString()} key="list-vertical-like-o"/>,
                            <IconText propStyle={{color: "red"}} type="dislike-o" text={item.downvotes.toString()} key="list-vertical-dislike-o"/>,
                            <IconText propStyle={{color: "green"}} type="dollar-o" text="156" key="list-vertical-dollar-o"/>,
                            <IconText type="message" text={item.comments.toString()} key="list-vertical-message"/>,
                        ]}
                    >
                        <List.Item.Meta
                            title={<span style={{fontSize: "2em"}}>{item.title}</span>}
                            description={"by " + item.author}
                        />
                        {cutContent(item.content_preview)}
                    </List.Item>
                )}
            />
        </div>
    );
};

const mapStateToProps = (state: State): StateToProps => ({
    posts: state.posts.items,
});

const mapDispatchToProps = {
    fetchPosts
};

export default connect(mapStateToProps, mapDispatchToProps)(PostsList);
