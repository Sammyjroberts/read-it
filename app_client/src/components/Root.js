


import React from 'react';
import { Router, Route, IndexRoute, Switch } from 'react-router';
import Home from './Home';
import Layout from './Layout';
import createBrowserHistory from 'history/createBrowserHistory'

class Root extends React.Component {
  render() {
    return (
      <Router history={createBrowserHistory()}>
        <Layout>
            <Route path='/' component={Home}/>
        </Layout>
      </Router>
    );
  }
}


export default Root;
