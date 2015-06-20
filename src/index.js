import React from 'react';

const {PropTypes} = React;
const {span} = React.DOM;


export default React.createClass({
  displayName: 'ImageLoader',
  propTypes: {
    wrapper: PropTypes.func,
    className: PropTypes.string,
  },

  getDefaultProps() {
    return {wrapper: span};
  },

  getClassName() {
    let className = 'imageloader';
    if (this.props.className) className = `${className} ${this.props.className}`;
    return className;
  },

  render() {
    const wrapperProps = [{className: this.getClassName()}];
    return this.props.wrapper(...wrapperProps);
  },
});
