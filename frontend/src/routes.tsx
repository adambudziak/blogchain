import React from "react";
import { Route } from "react-router-dom";

import Login from "containers/LoginView";
import PostsList from "containers/PostsList";
import Signup from "containers/SignupView";
import PostDetail from "containers/PostDetail";
import PostCreationView from "containers/PostCreationView";

const BaseRouter = () => (
    <div>
        <Route exact path="/" component={PostsList}/>{" "}
        <Route exact path="/posts/new/" component={PostCreationView}/>{" "}
        <Route path="/post/:postId" component={PostDetail}/>{" "}
        <Route exact path="/login" component={Login} />{" "}
        <Route exact path="/signup" component={Signup} />{" "}
    </div>
);

export default BaseRouter;
