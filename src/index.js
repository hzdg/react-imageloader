import React from 'react';

const {PropTypes} = React;
const {span, img, noscript} = React.DOM;

const Status = {
  PENDING: 'pending',
  LOADING: 'loading',
  LOADED: 'loaded',
  FAILED: 'failed',
};


function hasSize(i) {
  return (i.naturalWidth + i.naturalHeight === 0) || (i.width + i.height === 0);
}

function renderToStaticMarkup(el) {
  return (React.renderToStaticMarkup || React.renderComponentToStaticMarkup)(el);
}

const id = x => x;

const createFactory = (cls) => (React.createFactory || id)(cls);

const ImageLoaderImg = createFactory(React.createClass({
  displayName: 'ImageLoaderImage',

  getInitialState() {
    // We don't want to render the image on the server, because that will result
    // in the <img> tag being serialized the DOM causing the browser to start
    // loading the image before this component mounts on the client. Since the
    // point of this component is to exert control over the image load, we want
    // to avoid that.
    //
    // However, initially rendering different things on the server and the client
    // is a big no-no (invariant), so we need to also treat the first render on
    // the client like we do on the server. Only then, once we know we're in the
    // client environment, can we safely render with actual <img> tag.
    //
    // So, to achieve client-server parity, we track our own `isInitialRender`
    // state (we can't use `isMounted()`, since that will be true at the time of
    // initial render on the client, but not the server).
    return {isInitialRender: true};
  },

  componentDidMount() {
    // FIXME: Is there a way to avoid setting state on mount?
    this.setState({isInitialRender: false});
  },

  handleLoad(...args) {
    if (!this.isMounted()) return;
    const image = this.refs.image;

    if (Object.hasOwnProperty(image, 'naturalWidth') && !hasSize(image)) {
      this.handleError(new Error(`Image <${image.src}> could not be loaded.`));
    } else if (this.props.onLoad) {
      this.props.onLoad(...args);
    }
  },

  handleError(...args) {
    if (this.props.onError) this.props.onError(...args);
  },

  renderImg() {
    const props = Object.assign({}, this.props, {
      ref: 'image',
      onLoad: this.handleLoad,
      onError: this.handleError,
    });
    return <img {...props} />;
  },

  render() {
    if (this.state.isInitialRender) {
      // We will initially render the <img> tag in a <noscript> (see note in
      // `getInitialState` for reasons). This will increase accessibility in that
      // rare case when the serialized component is served to a browser with
      // javascript disabled, but ensure that the image won't start loading
      // before we're ready. However, there is an issue
      // (https://github.com/facebook/react/issues/1252) that causes noscript to
      // cause invariant violations when rendered on the server. So, we render it
      // as a string and set the inner HTML of a wrapper span.
      const html = renderToStaticMarkup(<noscript>{this.renderImg()}</noscript>);
      return (
        <span
          style={{display: 'none'}}
          dangerouslySetInnerHTML={{__html: html}} />
      );
    } else {
      return this.renderImg();
    }
  },
}));


const ImageLoader = React.createClass({
  displayName: 'ImageLoader',
  // mixins: [ReactLoaderMixin]  // FIXME: get rid of this!
  propTypes: {
    wrapper: PropTypes.func,
    preloader: PropTypes.func,
  },

  getInitialState() {
    return {status: Status.PENDING};
  },

  getDefaultProps() {
    return {
      wrapper: span,
      loader: ImageLoaderImg,
    };
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.src !== nextProps.src) {
      this.setState({
        status: nextProps.src ? Status.LOADING : Status.PENDING,
      });
    }
  },

  getClassName() {
    let className = `imageloader ${this.state.status}`;
    if (this.props.className) className = `${className} ${this.props.className}`;
    return className;
  },

  getImgProps() {
    const props = Object.assign({}, this.props, {
      style: Object.assign({}, this.props.style, {
        display: this.state.status === Status.LOADED ? null : 'none',
      }),
    });
    delete props.wrapper;
    delete props.preloader;
    delete props.children;
    return props;
  },

  loaderDidLoad() {
    this.setState({status: Status.LOADED});
  },

  loaderDidError() {
    this.setState({status: Status.FAILED});
  },

  renderChildren() {
    if (Array.isArray(this.props.children)) return this.props.children.slice();
    return [this.props.children];
  },

  render() {
    let wrapperArgs = [{className: this.getClassName()}];
    if (this.props.src) {
      wrapperArgs.push(this.renderLoader(ImageLoaderImg, this.getImgProps()));
    }
    if (this.props.preloader && this.state.status !== Status.LOADED && this.state.status !== Status.FAILED) {
      wrapperArgs.push(this.props.preloader());
    }
    if (this.state.status === Status.FAILED) {
      wrapperArgs = wrapperArgs.concat(this.renderChildren());
    }
    return this.props.wrapper(...wrapperArgs);
  },
});

export default ImageLoader;
