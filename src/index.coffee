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
    src: PropTypes.string
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
    if @props?.src?
      @initiateLoad @props.src, @props.priority

  componentWillUnmount: ->
    @state?.loadResult?.cancel?()

  componentWillReceiveProps: (nextProps) ->
    # If a new `src` has been provided, try to cancel a pending load (if there
    # is one), and initiate a new load. Otherwise, if a new `priorty` has been
    # provided, try to update the existing load's priority. Both cancelling and
    # priority are dependent on a `loadQueue` being in context.
    if nextProps.src?
      @state?.loadResult?.cancel?()
      @initiateLoad nextProps.src, nextProps.priority
    else if nextProps.priority? and @state?.loadResult?
      @state.loadResult.priority? nextProps.priority

  initiateLoad: (url, priority) ->
    # If there is a `loadQueue` in context, enqueue the load for this image.
    # Otherwise, load the image right away.
    if @context?.loadQueue?
      loader = (callback) =>
        @loadImage {url}, callback
      loadResult = @context.loadQueue
        .enqueue loader, {priority}
      @setState {loadResult}
    else
      @loadImage {url}

  loadImage: (opts, cb) ->
    # If the component has been unmounted since the load was enqueued, don't
    # bother starting the load now.
    return unless @isMounted()
    return if @state?.imageToLoad?.opts.url is opts.url
    @setState
      status: Status.LOADING
      imageToLoad:
        opts: opts
        cb: cb

  handleLoad: ->
    # If the component has been unmounted since the load was enqueued, don't
    # bother handling the load now.
    return unless @isMounted()
    image = @refs.image
    if 'naturalWidth' of image and (image.naturalWidth + image.naturalHeight is 0) or (image.width + image.height is 0)
      @handleError new Error "Image <#{image.src}> could not be loaded."
    else
      @setState status: Status.LOADED, =>
        @state.imageToLoad.cb? null, @refs.image.getDOMNode()
        @props.onLoad? arguments...

  handleError: (event) ->
    @setState status: Status.FAILED, =>
      @state.imageToLoad.cb? event.error
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
