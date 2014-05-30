React = require 'react'

{PropTypes} = React
{span, img} = React.DOM

Status =
  PENDING: 'pending'
  LOADING: 'loading'
  LOADED: 'loaded'
  FAILED: 'failed'

ContextTypes =
  loadQueue: (props, propName, componentName) ->
    loadQueue = props[propName]
    if loadQueue? and typeof loadQueue['enqueue'] isnt 'function'
      console.warn "Context `#{propName}` must have an `enqueue` method for `#{componentName}`"
      return false
    true


LoaderMixin =
  statics: {Status}
  propTypes:
    src: PropTypes.string.isRequired
    priority: PropTypes.number
  contextTypes:
    loadQueue: ContextTypes.loadQueue
  getInitialState: ->
    status: Status.PENDING
  componentDidMount: ->
    return unless @state.status is Status.PENDING
    if @context?.loadQueue?
      loader = (callback) =>
        @loadImage @props.src, callback
      loadResult = @context.loadQueue
        .enqueue loader, priority: @props.priority
      @setState {loadResult}
    else
      @loadImage @props.src
  componentWillReceiveProps: (nextProps) ->
    if nextProps.priority? and @state?.loadResult?
      @state.loadResult.priority nextProps.priority


module.exports = ImageLoader = React.createClass
  displayName: 'ImageLoader'
  mixins: [LoaderMixin]
  propTypes:
    wrapper: PropTypes.func
    preloader: PropTypes.func
    onLoad: PropTypes.func
    onError: PropTypes.func
  getDefaultProps: ->
    wrapper: span
  loadImage: (opts, cb) ->
    @setState
      status: Status.LOADING
      imageToLoad:
        opts: opts
        cb: cb
  handleLoad: (event) ->
    img = @refs.img
    if 'naturalWidth' of img and (img.naturalWidth + img.naturalHeight is 0) or (img.width + img.height is 0)
      @handleError new Error "Image <#{img.src}> could not be loaded."
    else
      @setState status: Status.LOADED, =>
        @props.onLoad()  # FIXME: What does this callback get?
  handleError: (error) ->
    @setState {error, status: Status.FAILED}, =>
      @props.onError error
  getClassName: ->
    # Build a CSS class name based on the current state.
    className = "imageloader #{ @state.status }"
    className += " #{ @props.className }" if @props.className
    className
  render: ->
    (@props.wrapper
      className: @getClassName()
      @renderStatus()
    )
  renderStatus: ->
    result = []
    if @state.imageToLoad
      result.push @renderImage()
    switch @state.status
      when Status.PENDING, Status.LOADING
        result.push new @props.preloader if @props.preloader
      when Status.ERROR
        if Array.isArray @props.children
          result = result.concat @props.children
        else
          result.push @props.children
    result
  renderImage: ->
    (img
      ref: 'img'
      src: @state.imageToLoad.opts.url
      onLoad: @handleLoad
      onError: @handleError
      style:
        display: if @state.status is Status.LOADED then null else 'none'
    )
