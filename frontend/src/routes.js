import React from "react";
import { Route } from "react-router-dom";

import HomePage from "./containers/HomePageView";
import Login from "./containers/LoginView";
import Signup from "./containers/SignupView";

const BaseRouter = () => (
  <div>
    <Route exact path="/" component={HomePage} />{" "}
    <Route exact path="/login" component={Login} />{" "}
    <Route exact path="/signup" component={Signup} />{" "}
  </div>
);

export default BaseRouter;