!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ReactImageLoader=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var ContextTypes, ImageLoader, PropTypes, React, Status, img, span, _ref;

React = (window.React);

PropTypes = React.PropTypes;

_ref = React.DOM, span = _ref.span, img = _ref.img;

Status = {
  PENDING: 'pending',
  LOADING: 'loading',
  LOADED: 'loaded',
  FAILED: 'failed'
};

ContextTypes = {
  loadQueue: function(props, propName, componentName) {
    var loadQueue;
    loadQueue = props[propName];
    if ((loadQueue != null) && typeof loadQueue['enqueue'] !== 'function') {
      console.warn("Context `" + propName + "` must have an `enqueue` method for `" + componentName + "`");
      return false;
    }
    return true;
  }
};

module.exports = ImageLoader = React.createClass({
  displayName: 'ImageLoader',
  statics: {
    Status: Status
  },
  propTypes: {
    src: PropTypes.string,
    priority: PropTypes.number,
    wrapper: PropTypes.func,
    preloader: PropTypes.func,
    onLoad: PropTypes.func,
    onError: PropTypes.func
  },
  contextTypes: {
    loadQueue: ContextTypes.loadQueue
  },
  getInitialState: function() {
    return {
      status: Status.PENDING
    };
  },
  getDefaultProps: function() {
    return {
      wrapper: span
    };
  },
  componentDidMount: function() {
    var _ref1;
    if (this.state.status !== Status.PENDING) {
      return;
    }
    if (((_ref1 = this.props) != null ? _ref1.src : void 0) != null) {
      return this.initiateLoad(this.props.src, this.props.priority);
    }
  },
  componentWillUnmount: function() {
    var _ref1, _ref2;
    return (_ref1 = this.state) != null ? (_ref2 = _ref1.loadResult) != null ? typeof _ref2.cancel === "function" ? _ref2.cancel() : void 0 : void 0 : void 0;
  },
  componentWillReceiveProps: function(nextProps) {
    var _base, _ref1, _ref2, _ref3;
    if (nextProps.src != null) {
      if ((_ref1 = this.state) != null) {
        if ((_ref2 = _ref1.loadResult) != null) {
          if (typeof _ref2.cancel === "function") {
            _ref2.cancel();
          }
        }
      }
      return this.initiateLoad(nextProps.src, nextProps.priority);
    } else if ((nextProps.priority != null) && (((_ref3 = this.state) != null ? _ref3.loadResult : void 0) != null)) {
      return typeof (_base = this.state.loadResult).priority === "function" ? _base.priority(nextProps.priority) : void 0;
    }
  },
  initiateLoad: function(url, priority) {
    var loadResult, loader, _ref1;
    if (((_ref1 = this.context) != null ? _ref1.loadQueue : void 0) != null) {
      loader = (function(_this) {
        return function(callback) {
          return _this.loadImage({
            url: url
          }, callback);
        };
      })(this);
      loadResult = this.context.loadQueue.enqueue(loader, {
        priority: priority
      });
      return this.setState({
        loadResult: loadResult
      });
    } else {
      return this.loadImage({
        url: url
      });
    }
  },
  loadImage: function(opts, cb) {
    var _ref1, _ref2;
    if (!this.isMounted()) {
      return;
    }
    if (((_ref1 = this.state) != null ? (_ref2 = _ref1.imageToLoad) != null ? _ref2.opts.url : void 0 : void 0) === opts.url) {
      return;
    }
    return this.setState({
      status: Status.LOADING,
      imageToLoad: {
        opts: opts,
        cb: cb
      }
    });
  },
  handleLoad: function() {
    if (!this.isMounted()) {
      return;
    }
    img = this.refs.img;
    if ('naturalWidth' in img && (img.naturalWidth + img.naturalHeight === 0) || (img.width + img.height === 0)) {
      return this.handleError(new Error("Image <" + img.src + "> could not be loaded."));
    } else {
      return this.setState({
        status: Status.LOADED
      }, (function(_this) {
        return function() {
          var _base, _base1;
          if (typeof (_base = _this.state.imageToLoad).cb === "function") {
            _base.cb(null, _this.refs.img.getDOMNode());
          }
          return typeof (_base1 = _this.props).onLoad === "function" ? _base1.onLoad.apply(_base1, arguments) : void 0;
        };
      })(this));
    }
  },
  handleError: function(event) {
    return this.setState({
      status: Status.FAILED
    }, (function(_this) {
      return function() {
        var _base, _base1;
        if (typeof (_base = _this.state.imageToLoad).cb === "function") {
          _base.cb(event.error);
        }
        return typeof (_base1 = _this.props).onError === "function" ? _base1.onError.apply(_base1, arguments) : void 0;
      };
    })(this));
  },
  getClassName: function() {
    var className;
    className = "imageloader " + this.state.status;
    if (this.props.className) {
      className += " " + this.props.className;
    }
    return className;
  },
  render: function() {
    return this.props.wrapper({
      className: this.getClassName()
    }, this.renderStatus());
  },
  renderStatus: function() {
    var result;
    result = [];
    if (this.state.imageToLoad) {
      result.push(this.renderImage());
    }
    switch (this.state.status) {
      case Status.PENDING:
      case Status.LOADING:
        if (this.props.preloader) {
          result.push(new this.props.preloader);
        }
        break;
      case Status.ERROR:
        if (Array.isArray(this.props.children)) {
          result = result.concat(this.props.children);
        } else {
          result.push(this.props.children);
        }
    }
    return result;
  },
  renderImage: function() {
    return img({
      ref: 'img',
      src: this.state.imageToLoad.opts.url,
      onLoad: this.handleLoad,
      onError: this.handleError,
      style: {
        display: this.state.status === Status.LOADED ? null : 'none'
      }
    });
  }
});

},{}]},{},[1])
(1)
});