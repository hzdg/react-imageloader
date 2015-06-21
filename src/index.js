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
    return {status: this.props.src ? Status.LOADING : Status.PENDING};
  },

  getDefaultProps() {
    return {wrapper: span};
  },

  componentDidMount() {
    if (this.state.status === Status.LOADING) {
      this.createLoader();
    }
  },

  getClassName() {
    let className = `imageloader ${this.state.status}`;
    if (this.props.className) className = `${className} ${this.props.className}`;
    return className;
  },

  createLoader() {
    this.destroyLoader();  // We can only have one loader at a time.

    this.img = new Image();
    this.img.addEventListener('load', this.handleLoad);
    this.img.addEventListener('error', this.handleError);
    this.img.src = this.props.src;
  },

  destroyLoader() {
    if (this.img) {
      this.img.removeEventListener('load', this.handleLoad);
      this.img.removeEventListener('error', this.handleError);
      delete this.img;
    }
  },

  handleLoad(event) {
    this.destroyLoader();
    this.setState({status: Status.LOADED});

    if (this.props.onLoad) this.props.onLoad(event);
  },

  handleError(error) {
    this.destroyLoader();
    this.setState({status: Status.FAILED});

    if (this.props.onError) this.props.onError(error);
  },

  render() {
    let wrapperProps = [{className: this.getClassName()}];

    switch (this.state.status) {
      case Status.LOADED:
        wrapperProps.push(<img src={this.props.src} />);
        break;
    }

    return this.props.wrapper(...wrapperProps);
  },
});
