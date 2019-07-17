import React from 'react';
import { connect } from 'react-redux';

import { fetchCommentsForPost } from '../store/actions/posts';

class PostCommentsComponent extends React.Component {

    componentWillMount() {
        this.props.fetchCommentsForPost(this.props.postId);
    }

    getComments = () => {
        const propComments = this.props.postComments[this.props.postId];
        if (propComments === undefined || propComments === null) {
            return [];
        }
        return propComments;
    }

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
        postComments: state.posts.postComments,
    }
}

export default connect(mapStateToProps, {
    fetchCommentsForPost,
})(PostCommentsComponent);