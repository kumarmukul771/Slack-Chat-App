import React, { Component } from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import registerServiceWorker from "./registerServiceWorker";
import 'semantic-ui-css/semantic.min.css';
import { BrowserRouter as Router, Switch, Route, withRouter } from "react-router-dom";
import firebase from './firebase';
import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from "./reducers";
import { setUser, clearUser } from './actions/index';
import Spinner from './Spinner';

const store = createStore(rootReducer, composeWithDevTools())

class Root extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.setUser(user)
        this.props.history.push('/')
      } else {
        this.props.history.push('/login');
        this.props.clearUser()
      }
    })
  }
  render() {
    // console.log(this.props)
    return this.props.isLoading ? <Spinner /> : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    )
  }
}

const mapStateToProps = state => ({
  isLoading: state.user.isLoading
})
const RootWithAuth = withRouter(connect(mapStateToProps, { setUser, clearUser })(Root))

ReactDOM.render(<Router>
  <Provider store={store}>
    <RootWithAuth />
  </Provider>
</Router>, document.getElementById("root"));
registerServiceWorker();
