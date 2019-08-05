import React from "react";
import { Route } from "react-router-dom";

import Posts from "./containers/PostsView";
import Login from "./containers/LoginView";
import Signup from "./containers/SignupView";

const BaseRouter = () => (
  <div>
    <Route exact path="/" component={Posts} />{" "}
    <Route exact path="/login" component={Login} />{" "}
    <Route exact path="/signup" component={Signup} />{" "}
  </div>
);

export default BaseRouter;
