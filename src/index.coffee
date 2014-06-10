React = require 'react'

{PropTypes} = React
{span, img} = React.DOM

Status =
  PENDING: 'pending'
  LOADING: 'loading'
  LOADED: 'loaded'
  FAILED: 'failed'


hasSize = (i) ->
  (i.naturalWidth + i.naturalHeight is 0) or (i.width + i.height is 0)


module.exports = ImageLoader = React.createClass
  displayName: 'ImageLoader'
  statics: {Status}
  propTypes:
    src: PropTypes.string
    wrapper: PropTypes.func
    preloader: PropTypes.func
    onLoad: PropTypes.func
    onError: PropTypes.func
  getInitialState: ->
    status: Status.PENDING
  getDefaultProps: ->
    wrapper: span
  componentDidMount: ->
    return unless @state.status is Status.PENDING
    if @props.src then @setState status: Status.LOADING
  componentDidUpdate: (prev) ->
    if @props.src isnt prev.src then @setState status: Status.LOADING
  handleLoad: (args...) ->
    # If the component has been unmounted since the load was enqueued, don't
    # bother handling the load now.
    return unless @isMounted()
    image = @refs.image
    if 'naturalWidth' of image and not hasSize image
      @handleError new Error "Image <#{image.src}> could not be loaded."
    else
      # TODO: What the should the success callback get?
      @setState status: Status.LOADED, => @props.onLoad?.call this, null
  handleError: (args...) ->
    @setState status: Status.FAILED, => @props.onError? args...
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
    if @props.src
      result.push @renderImage()
    switch @state.status
      when Status.PENDING, Status.LOADING
        result.push new @props.preloader if @props.preloader
      when Status.FAILED
        if Array.isArray @props.children
          result = result.concat @props.children
        else
          result.push @props.children
    result
  renderImage: ->
    (img
      ref: 'image'
      src: @props.src
      onLoad: @handleLoad
      onError: @handleError
      style:
        display: if @state.status is Status.LOADED then null else 'none'
    )
