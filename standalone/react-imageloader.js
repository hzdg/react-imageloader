!function(r,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("React")):"function"==typeof define&&define.amd?define(["React"],e):"object"==typeof exports?exports.ReactImageLoader=e(require("React")):r.ReactImageLoader=e(r.React)}(this,function(r){return function(r){function e(n){if(t[n])return t[n].exports;var o=t[n]={exports:{},id:n,loaded:!1};return r[n].call(o.exports,o,o.exports,e),o.loaded=!0,o.exports}var t={};return e.m=r,e.c=t,e.p="",e(0)}([function(r,e,t){var n,o,a,s,i,p,u,d,l,c,h,f=[].slice;s=t(1),l=t(2),i=t(3),a=s.PropTypes,h=s.createElement.bind(s,"span"),d=s.createElement.bind(s,"img"),c=s.createElement.bind(s,"noscript"),p={PENDING:"pending",LOADING:"loading",LOADED:"loaded",FAILED:"failed"},u=function(r){return r.naturalWidth+r.naturalHeight===0||r.width+r.height===0},o=s.createFactory(s.createClass({displayName:"ImageLoaderImage",getInitialState:function(){return{isInitialRender:!0}},componentDidMount:function(){return this.setState({isInitialRender:!1})},handleLoad:function(){var r,e,t;return r=1<=arguments.length?f.call(arguments,0):[],this.isMounted()?(e=this.refs.image,"naturalWidth"in e&&!u(e)?this.handleError(new Error("Image <"+e.src+"> could not be loaded.")):"function"==typeof(t=this.props).onLoad?t.onLoad.apply(t,r):void 0):void 0},handleError:function(){var r,e;return r=1<=arguments.length?f.call(arguments,0):[],"function"==typeof(e=this.props).onError?e.onError.apply(e,r):void 0},renderImg:function(){return d(l(this.props,{ref:"image",onLoad:this.handleLoad,onError:this.handleError}))},render:function(){var r;return this.state.isInitialRender?(r=s.renderToStaticMarkup(c(null,this.renderImg())),h({style:{display:"none"},dangerouslySetInnerHTML:{__html:r}})):this.renderImg()}})),r.exports=n=s.createClass({displayName:"ImageLoader",mixins:[i],propTypes:{wrapper:a.func,preloader:a.func},getInitialState:function(){return{status:p.PENDING}},getDefaultProps:function(){return{wrapper:h,loader:o}},componentWillReceiveProps:function(r){return this.props.src!==r.src?this.setState({status:r.src?p.LOADING:p.PENDING}):void 0},getClassName:function(){var r;return r="imageloader "+this.state.status,this.props.className&&(r+=" "+this.props.className),r},getImgProps:function(){var r;return r=l(this.props,{style:l(this.props.style,{display:this.state.status===p.LOADED?null:"none"})}),delete r.wrapper,delete r.preloader,r},loaderDidLoad:function(){return this.setState({status:p.LOADED})},loaderDidError:function(){return this.setState({status:p.FAILED})},renderChildren:function(){return Array.isArray(this.props.children)?this.props.children.slice(0):[this.props.children]},render:function(){var r,e;return r=[{className:this.getClassName()}],this.props.src&&r.push(this.renderLoader(o,this.getImgProps())),this.props.preloader&&this.state.status!==p.LOADED&&this.state.status!==p.FAILED&&r.push(this.props.preloader()),this.state.status===p.FAILED&&(r=r.concat(this.renderChildren())),(e=this.props).wrapper.apply(e,r)}})},function(e){e.exports=r},function(r){function e(){for(var r={},e=0;e<arguments.length;e++){var t=arguments[e];for(var n in t)t.hasOwnProperty(n)&&(r[n]=t[n])}return r}r.exports=e},function(r,e,t){var n,o,a,s,i=[].slice;o=t(1),s=t(4),n=o.PropTypes,r.exports=a={propTypes:{src:n.string,onLoad:n.func,onError:n.func},renderLoader:function(r,e){return r(s(e,{src:this.props.src,onLoad:function(r){return function(){var e,t;return e=1<=arguments.length?i.call(arguments,0):[],"function"==typeof r.loaderDidLoad&&r.loaderDidLoad.apply(r,e),"function"==typeof(t=r.props).onLoad?t.onLoad.apply(t,e):void 0}}(this),onError:function(r){return function(){var e,t;return e=1<=arguments.length?i.call(arguments,0):[],"function"==typeof r.loaderDidError&&r.loaderDidError.apply(r,e),"function"==typeof(t=r.props).onError?t.onError.apply(t,e):void 0}}(this)}))}}},function(r){function e(){for(var r={},e=0;e<arguments.length;e++){var t=arguments[e];for(var n in t)t.hasOwnProperty(n)&&(r[n]=t[n])}return r}r.exports=e}])});