React = require 'react'
imageLoader = require 'queueup-imageloader'

{PropTypes} = React
{img} = React.DOM

Status =
  PENDING: 'pending'
  LOADING: 'loading'
  LOADED: 'loaded'
  FAILED: 'failed'

ContextTypes =
  loadQueue: (props, propName, componentName) ->
    loadQueue = props[propName]
    unless loadQueue?
      console.warn "Required context `#{propName}` was not specified for `#{componentName}`"
      return false
    unless typeof loadQueue['enqueue'] is 'function'
      console.warn "Context `#{propName}` must have an `enqueue` method for `#{componentName}`"
      return false
    true


LoaderMixin =
  statics: {Status}
  propTypes:
    loader: PropTypes.func.isRequired
    src: PropTypes.string.isRequired
    priority: PropTypes.number
  contextTypes:
    loadQueue: ContextTypes.loadQueue
  getInitialState: ->
    status: Status.PENDING
  componentDidMount: ->
    return unless @state.status is Status.PENDING
    loader = (callback) => @props.loader @props.src, callback
    loadResult = @context.loadQueue
      .enqueue loader, priority: @props.priority
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
