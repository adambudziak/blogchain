/* eslint-disable react-hooks/exhaustive-deps */
import PostForm from "components/PostForm";
import React, {useEffect, useState} from "react";
import {PostData, submitPost} from "actions/posts";
import {Web3Context} from "reducers/bc";
import {State} from "reducers/index";
import {connect} from "react-redux";
import {initWeb3} from "actions/bc";
import {RouteComponentProps} from 'react-router-dom';

interface StateToProps {
  web3Context: Web3Context | null;
  submitLoading: boolean;
  submitError: Error | null;
}

interface DispatchToProps {
  initWeb3: typeof initWeb3;
  submitPost: typeof submitPost;
}

type Props = StateToProps & DispatchToProps & RouteComponentProps;

const PostCreationComponent = (props: Props) => {
  const [wasLoading, setWasLoading] = useState(false);

  let error = null;
  let loading = null;
  useEffect(() => {
    if (props.submitError) {
      error = (<div>Omg, something went wrong!</div>);
      return;
    }
    if (!props.submitLoading && wasLoading) {
      setWasLoading(false);
      props.history.push('/');
    } else {
      loading = (
        <div>Loading...</div>
      )
    }

  }, [props.submitLoading, props.submitError]);

  if (props.web3Context === null) {
    props.initWeb3();
    return (
      <div>
                Connecting with blockchain...
      </div>
    );
  }

  const web3Context = props.web3Context;


  const onSubmit = (post: PostData) => {
    setWasLoading(true);
    props.submitPost(web3Context, post);
  };


  return (
    <div>
      <h1>Create a new post</h1>
      { error }
      <div>
        <PostForm onSubmit={onSubmit}/>
      </div>
      { loading }
    </div>
  );

};

const mapStateToProps = (state: State): StateToProps => ({
  web3Context: state.bc.web3Context,
  submitLoading: state.posts.submitLoading,
  submitError: state.posts.submitError,
});

const mapDispatchToProps: DispatchToProps = {
  initWeb3,
  submitPost,
};

export default connect(mapStateToProps, mapDispatchToProps)(PostCreationComponent);
