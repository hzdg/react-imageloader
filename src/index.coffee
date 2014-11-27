React = require 'react'
merge = require 'xtend'
ReactLoaderMixin = require 'react-loadermixin'

{PropTypes} = React
{span, img, noscript} = React.DOM

Status =
  PENDING: 'pending'
  LOADING: 'loading'
  LOADED: 'loaded'
  FAILED: 'failed'


hasSize = (i) ->
  (i.naturalWidth + i.naturalHeight is 0) or (i.width + i.height is 0)


ImageLoaderImg = React.createFactory( React.createClass
  displayName: 'ImageLoaderImage'
  getInitialState: ->
    # We don't want to render the image on the server, because that will result
    # in the <img> tag being serialized the DOM causing the browser to start
    # loading the image before this component mounts on the client. Since the
    # point of this component is to exert control over the image load, we want
    # to avoid that.
    #
    # However, initially rendering different things on the server and the client
    # is a big no-no (invariant), so we need to also treat the first render on
    # the client like we do on the server. Only then, once we know we're in the
    # client environment, can we safely render with actual <img> tag.
    #
    # So, to achieve client-server parity, we track our own `isInitialRender`
    # state (we can't use `isMounted()`, since that will be true at the time of
    # initial render on the client, but not the server).
    isInitialRender: true
  componentDidMount: ->
    @setState isInitialRender: false
  handleLoad: (args...) ->
    return unless @isMounted()
    image = @refs.image
    if 'naturalWidth' of image and not hasSize image
      @handleError new Error "Image <#{image.src}> could not be loaded."
    else @props.onLoad? args...
  handleError: (args...) ->
    @props.onError? args...
  renderImg: ->
    (img merge @props,
      ref: 'image'
      onLoad: @handleLoad
      onError: @handleError
    )
  render: ->
    if @state.isInitialRender
      # We will initially render the <img> tag in a <noscript> (see note in
      # `getInitialState` for reasons). This will increase accessibility in that
      # rare case when the serialized component is served to a browser with
      # javascript disabled, but ensure that the image won't start loading
      # before we're ready. However, there is an issue
      # (https://github.com/facebook/react/issues/1252) that causes noscript to
      # cause invariant violations when rendered on the server. So, we render it
      # as a string and set the inner HTML of a wrapper span.
      html = React.renderToStaticMarkup (noscript null, @renderImg())
      (span
        style:
          display: 'none'
        dangerouslySetInnerHTML:
          __html: html
      )
    else
      @renderImg()
)


module.exports = ImageLoader = React.createClass
  displayName: 'ImageLoader'
  mixins: [ReactLoaderMixin]
  propTypes:
    wrapper: PropTypes.func
    preloader: PropTypes.func
  getInitialState: ->
    status: Status.PENDING
  getDefaultProps: ->
    wrapper: span
    loader: ImageLoaderImg
  componentWillReceiveProps: (nextProps) ->
    if @props.src isnt nextProps.src
      @setState
        status: if nextProps.src then Status.LOADING else Status.PENDING
  getClassName: ->
    className = "imageloader #{ @state.status }"
    className += " #{ @props.className }" if @props.className
    className
  getImgProps: ->
    props = merge @props,
      style: merge @props.style,
        display: if @state.status is Status.LOADED then null else 'none'
    delete props.wrapper
    delete props.preloader
    props
  loaderDidLoad: ->
    @setState status: Status.LOADED
  loaderDidError: ->
    @setState status: Status.FAILED
  renderChildren: ->
    if Array.isArray @props.children then @props.children[..]
    else [@props.children]
  render: ->
    wrapperArgs = [className: @getClassName()]
    if @props.src
      wrapperArgs.push @renderLoader ImageLoaderImg, @getImgProps()
    if @props.preloader and @state.status isnt Status.LOADED
      wrapperArgs.push @props.preloader()
    if @state.status is Status.FAILED
      wrapperArgs = wrapperArgs.concat @renderChildren()
    @props.wrapper wrapperArgs...
