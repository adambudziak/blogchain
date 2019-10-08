import {withPolling} from "src/polling";
import React, {useEffect} from "react";
import {connect} from "react-redux";
import {ApiPost, fetchPosts} from "actions/posts";
import {State} from "reducers/index";
import {Link, RouteComponentProps} from 'react-router-dom';
import {List, Icon, Button} from 'antd';

import 'src/styles/PostsView.scss';

interface StateToProps {
  posts: ApiPost[];
  isAuthenticated: boolean;
}

interface DispatchToProps {
  fetchPosts: () => void;
}

type Props = StateToProps & DispatchToProps & RouteComponentProps;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconText = ({type, text, propStyle}: {type: string; text: string; propStyle?: any}) => (
  <span>
    <Icon type={type} style={{marginRight: 8, ...propStyle}}/>
    {text}
  </span>
);

const PostsList = (props: Props) => {
  useEffect(withPolling(props.fetchPosts), [props.fetchPosts]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrapContentPreview = (contentPreview: string): any => {
    return (<p className="post-content">{contentPreview}<br/>{'(Click to see more)'}</p>);
  };

  const openDetail = (postIdx: number) => {
    return props.history.push(`post/${postIdx}/`);
  };

  return (
    <div>
      {props.isAuthenticated ?
        <Button>
          <Link to="posts/new/">Create a new post</Link>
        </Button>
        :
        <Button>
          <Link to={{ pathname: 'login', state: {'next': 'posts/new/'} }}>Login to add a new post</Link>
        </Button>
      }

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
            <b>BlogChain&lsquo;s</b> best posts in the universe
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
              <IconText propStyle={{color: "green"}} type="dollar-o" text={item.balance} key="list-vertical-dollar-o"/>,
              <IconText type="message" text={item.comments.toString()} key="list-vertical-message"/>,
            ]}
          >
            <List.Item.Meta
              title={
                <span>
                  <span style={{fontSize: "2em"}}>{item.title} </span>
                  {
                    item.verified ?
                      <span style={{ fontStyle: "italic", color: "green" }}> verified</span>
                      : <span style={{ fontStyle: "italic", color: "red" }}> not verified</span>
                  }
                </span>
              }
              description={"by " + item.author}
            />
            {wrapContentPreview(item.content_preview)}
          </List.Item>
        )}
      />
    </div>
  );
};

const mapStateToProps = (state: State): StateToProps => ({
  posts: state.posts.items,
  isAuthenticated: state.auth.token !== null,
});

const mapDispatchToProps = {
  fetchPosts
};

export default connect(mapStateToProps, mapDispatchToProps)(PostsList);
