import React from 'react';

const {PropTypes} = React;
const {span} = React.DOM;

const Status = {
  PENDING: 'pending',
  LOADING: 'loading',
  LOADED: 'loaded',
  FAILED: 'failed',
};


export default React.createClass({
  displayName: 'ImageLoader',
  propTypes: {
    wrapper: PropTypes.func,
    className: PropTypes.string,
  },

  getInitialState() {
    return {status: Status.PENDING};
  },

  getDefaultProps() {
    return {wrapper: span};
  },

  getClassName() {
    let className = `imageloader ${this.state.status}`;
    if (this.props.className) className = `${className} ${this.props.className}`;
    return className;
  },

  render() {
    const wrapperProps = [{className: this.getClassName()}];
    return this.props.wrapper(...wrapperProps);
  },
});
