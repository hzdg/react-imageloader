React = require 'react'
imageLoader = require 'queueup-imageloader'

{PropTypes} = React
{img} = React.DOM

Status =
  PENDING: 'pending'
  LOADING: 'loading'
  LOADED: 'loaded'
  FAILED: 'failed'


LoaderMixin =
  statics: {Status}
  propTypes:
    loader: PropTypes.func.isRequired
    src: PropTypes.string.isRequired
    priority: PropTypes.number
  getInitialState: ->
    status: Status.PENDING
  componentDidMount: ->
    return unless @state.status is Status.PENDING
    # loadImage = (callback) ->
    #   imageLoader @props.src, callback
    # result = @context.loadQueue.enqueue loadImage, priority: @props.priority
    loadResult = @context.loadQueue
      .load
        url: @props.src
        loader: @props.loader
        priority: @props.priority
      .then @handleLoad, @handleError
    @setState {loadResult, status: Status.LOADING}


module.exports = ImageLoader = React.createClass
  displayName: 'ImageLoader'
  mixins: [LoaderMixin]
  propTypes:
    preloader: PropTypes.func
    onLoad: PropTypes.func
    onError: PropTypes.func
  getDefaultProps: -> preloader: img, loader: imageLoader
  handleLoad: (el) -> @setState status: Status.LOADED
  handleError: (error) -> @setState {error, status: Status.FAILED}
  render: ->
    switch @state.status
      when ImageLoader.Status.PENDING, ImageLoader.Status.LOADING
        @props.preloader()
      when ImageLoader.Status.ERROR
        (div className: 'error', @props.children)
      when ImageLoader.Status.LOADED
        (img
          src: @props.src
          onLoad: @props.onLoad
          onError: @props.onError
        )
