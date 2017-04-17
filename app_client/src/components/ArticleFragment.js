/**
 * Created by sammy on 4/13/17.
 */
import React from 'react';


class ArticleFragment extends React.Component {
  render() {
    return (
      <div className="row">
        <div className = "row">
          <div className = "col-xs-1">

              <div className = "row text-center">
                  <span className="glyphicon glyphicon glyphicon-menu-up" aria-hidden="true"></span>
                </div>
              <div className = "row text-center">
                400
              </div>
              <div className = "row text-center">
                  <span className="glyphicon glyphicon glyphicon-menu-down" aria-hidden="true"></span>
              </div>
          </div>
          <div className = "col-xs-2"><img src="http://placehold.it/68x60" className = "img-responsive"/></div>
          <div className = "col-xs-9">text</div>
        </div>
      </div>
    );
  }
}

export default ArticleFragment;
