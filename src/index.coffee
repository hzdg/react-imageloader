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


module.exports = ImageLoader = React.createClass
  displayName: 'ImageLoader'
  statics: {Status}
  propTypes:
    src: PropTypes.string.isRequired
    priority: PropTypes.number
    wrapper: PropTypes.func
    preloader: PropTypes.func
    onLoad: PropTypes.func
    onError: PropTypes.func
  contextTypes:
    loadQueue: ContextTypes.loadQueue
  getInitialState: ->
    status: Status.PENDING
  getDefaultProps: ->
    wrapper: span
  componentDidMount: ->
    return unless @state.status is Status.PENDING

    # If there is a loadQueue in context, enqueue the load for this image.
    # Otherwise, just initiate the load of this image right away.
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
  loadImage: (opts, cb) ->
    return unless @isMounted()
    return if @state?.imageToLoad?.opts.url is opts.url
    @setState
      status: Status.LOADING
      imageToLoad:
        opts: opts
        cb: cb
  handleLoad: ->
    return unless @isMounted()
    img = @refs.img
    if 'naturalWidth' of img and (img.naturalWidth + img.naturalHeight is 0) or (img.width + img.height is 0)
      @handleError new Error "Image <#{img.src}> could not be loaded."
    else
      @setState status: Status.LOADED, =>
        @props.onLoad? arguments...
  handleError: ->
    @setState status: Status.FAILED, =>
      @props.onError? arguments...
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
