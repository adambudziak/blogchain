import PostForm from "components/PostForm";
import React from "react";
import {PostData, submitPost} from "actions/posts";
import {Web3Context} from "reducers/bc";
import {State} from "reducers/index";
import {connect} from "react-redux";
import {initWeb3} from "actions/bc";

interface StateToProps {
    web3Context: Web3Context | null,
}

interface DispatchToProps {
    initWeb3: typeof initWeb3,
    submitPost: typeof submitPost,
}

type Props = StateToProps & DispatchToProps;

const PostCreationComponent = (props: Props) => {
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
        props.submitPost(web3Context, post);
    };


    return (
        <div>
            <PostForm onSubmit={onSubmit}/>
        </div>
    );
};

const mapStateToProps = (state: State): StateToProps => ({
    web3Context: state.bc.web3Context,
});

const mapDispatchToProps: DispatchToProps = {
    initWeb3,
    submitPost,
};

export default connect(mapStateToProps, mapDispatchToProps)(PostCreationComponent);
