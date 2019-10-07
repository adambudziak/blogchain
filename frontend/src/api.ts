/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios';

export interface Post {
  title: string;
  content: string;
  datetime: string;
  hash: string;  // TODO it should be a hexstring with 0x prefix
}

export interface Comment {
  content: string;
  datetime: string;
  hash: string;
  post: string;  // TODO it actually has to be a valid URL to a post
}

export interface Vote {
  hash: string;
  datetime: string;
  isUpvote: boolean;
}

export interface PostVote extends Vote {
  postId: number;
}

export interface CommentVote extends Vote {
  commentId: number;
}

export const API_URLS = {
  POSTS: 'http://localhost:8000/api/posts/',
  POST_DETAILS: 'http://localhost:8000/api/posts/<pk>/',
  POST_COMMENTS: 'http://localhost:8000/api/posts/<pk>/comments/',
  POST_VOTES: 'http://localhost:8000/api/posts/<pk>/votes/',
  POST_UPVOTES: 'http://localhost:8000/api/posts/<pk>/upvotes/',
  POST_DOWNVOTES: 'http://localhost:8000/api/posts/<pk>/downvotes/',
  POST_BALANCE: 'http://localhost:8000/api/posts/<pk>/balance/',
  COMMENTS: 'http://localhost:8000/api/comments/',
  COMMENT_VOTES: 'http://localhost:8000/api/comments/<pk>/votes/',
  COMMENT_UPVOTES: 'http://localhost:8000/api/comments/<pk>/upvotes/',
  COMMENT_DOWNVOTES: 'http://localhost:8000/api/comments/<pk>/downvotes/',
};

function defaultConfig() {
  return {
    headers: {
      'Authorization': 'Token ' + localStorage.getItem('token')
    }
  };
}

export function createPost(post: Post) {
  return axios.post(API_URLS.POSTS, {
    title: post.title,
    content: post.content,
    creation_datetime: post.datetime,
    data_hash: post.hash,
  }, defaultConfig());
}

export function createComment(comment: Comment) {
  return axios.post(API_URLS.COMMENTS, {
    content: comment.content,
    creation_datetime: comment.datetime,
    data_hash: comment.hash,
    post: comment.post,
  }, defaultConfig());
}

export function createPostVote(vote: PostVote) {
  return axios.post(API_URLS.POST_VOTES.replace('<pk>', String(vote.postId)), {
    post: vote.postId,
    is_upvote: vote.isUpvote,
    data_hash: vote.hash,
    creation_datetime: vote.datetime,
  }, defaultConfig());
}

export function createCommentVote(vote: CommentVote) {
  return axios.post(API_URLS.COMMENT_VOTES.replace('<pk>', String(vote.commentId)), {
    comment: vote.commentId,
    is_upvote: vote.isUpvote,
    data_hash: vote.hash,
    creation_datetime: vote.datetime,
  }, defaultConfig());
}
