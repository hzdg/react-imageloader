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
    preloader: PropTypes.func,
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

  componentWillReceiveProps(nextProps) {
    if (this.props.src !== nextProps.src) {
      this.setState({
        status: nextProps.src ? Status.LOADING : Status.PENDING,
      });
    }
  },

  componentDidUpdate() {
    if (this.state.status === Status.LOADING && !this.loader) {
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

  renderImg() {
    let props = Object.assign({}, this.props);

    // Remove props used by ImageLoader.
    // The assumption is that any other props are meant for the loaded image.
    ['wrapper', 'className', 'preloader', 'children'].forEach(propName => {
      delete props[propName];
    });

    return <img {...props} />;
  },

  render() {
    let wrapperArgs = [{className: this.getClassName()}];

    switch (this.state.status) {
      case Status.LOADED:
        wrapperArgs.push(this.renderImg());
        break;

      case Status.FAILED:
        if (this.props.children) wrapperArgs.push(this.props.children);
        break;

      default:
        if (this.props.preloader) wrapperArgs.push(this.props.preloader());
        break;
    }

    return this.props.wrapper(...wrapperArgs);
  },
});
