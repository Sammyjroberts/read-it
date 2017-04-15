/**
 * Created by sammy on 4/13/17.
 */
import 'normalize.css/normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
require('styles/App.css');

import React from 'react'
import Header from './partials/Header'

class Layout extends React.Component {
  render() {
    return (
      <div className ="container-fluid">
        <Header/>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}


export default Layout;
