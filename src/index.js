import React from 'react';

const {PropTypes} = React;
const {span} = React.DOM;

const Status = {
  PENDING: 'pending',
  LOADING: 'loading',
  LOADED: 'loaded',
  FAILED: 'failed',
};


export default class ImageLoader extends React.Component {
  static propTypes = {
    wrapper: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
    preloader: PropTypes.func,
    src: PropTypes.string,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    imgProps: PropTypes.object,
  };

  static defaultProps = {
    wrapper: span,
  };

  constructor(props) {
    super(props);
    this.state = {
      status: props.src ? Status.LOADING : Status.PENDING,
      imageSrc: props.src,
      progress: 0,
    };
  }

  componentDidMount() {
    if (this.state.status === Status.LOADING) {
      this.createLoader();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.src !== nextProps.src) {
      this.setState({
        status: nextProps.src ? Status.LOADING : Status.PENDING,
      });
    }
  }

  componentDidUpdate() {
    if (this.state.status === Status.LOADING && !this.request) {
      this.createLoader();
    }
  }

  componentWillUnmount() {
    this.destroyLoader();
  }

  getClassName() {
    let className = `imageloader ${this.state.status}`;
    if (this.props.className) className = `${className} ${this.props.className}`;
    return className;
  }

  createLoader() {
    this.destroyLoader();  // We can only have one loader at a time.

    this.request = new XMLHttpRequest();
    this.request.onloadstart = ::this.handleProgressStart;
    this.request.onprogress = ::this.handleProgress;
    this.request.onloadend = ::this.handleProgressEnd;
    this.request.onload = ::this.handleLoad;
    this.request.open('GET', this.props.src, true);
    this.request.withCredentials = true;
    this.request.responseType = 'blob';
    this.request.send(null);
  }

  destroyLoader() {
    if (this.request) {
      this.request.onloadstart = null;
      this.request.onprogress = null;
      this.request.onloadend = null;
      this.request.onload = null;
      this.request = null;
    }
  }

  handleLoad(event) {
    const response = event.target;
    const imageSrc = typeof window !== 'undefined' ?
      window.URL.createObjectURL(this.request.response) : this.props.src;

    if (response.readyState !== 4 || response.status < 200 || response.status > 300) {
      return this.handleError(response);
    }

    this.setState({status: Status.LOADED, progress: 1, imageSrc});
    if (this.props.onLoad) this.props.onLoad(event);
    this.destroyLoader();
  }

  handleProgress({lengthComputable, loaded, total}) {
    if (lengthComputable) {
      return;
    }
    const progress = (loaded / total).toFixed(2);

    this.setState({progress});
  }

  handleProgressStart() {
    this.setState({progress: 0});
  }

  handleProgressEnd() {
    this.setState({progress: 1});
  }

  handleError(error) {
    this.destroyLoader();
    this.setState({status: Status.FAILED});

    if (this.props.onError) this.props.onError(error);
  }

  renderImg() {
    const {imgProps} = this.props;
    const {imageSrc} = this.state;
    let props = {src: imageSrc};

    for (let k in imgProps) {
      if (imgProps.hasOwnProperty(k)) {
        props[k] = imgProps[k];
      }
    }

    return <img {...props} />;
  }

  render() {
    let wrapperProps = {
      className: this.getClassName(),
    };

    if (this.props.style) {
      wrapperProps.style = this.props.style;
    }

    let wrapperArgs = [wrapperProps];

    switch (this.state.status) {
      case Status.LOADED:
        wrapperArgs.push(this.renderImg());
        break;

      case Status.FAILED:
        if (this.props.children) wrapperArgs.push(this.props.children);
        break;

      default:
        if (this.props.preloader) wrapperArgs.push(this.props.preloader(this.state.progress));
        break;
    }

    return this.props.wrapper(...wrapperArgs);
  }
}
