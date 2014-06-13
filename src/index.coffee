React = require 'react'
merge = require 'xtend'
ReactLoaderMixin = require 'react-loadermixin'

{PropTypes} = React
{span, img} = React.DOM

Status =
  PENDING: 'pending'
  LOADING: 'loading'
  LOADED: 'loaded'
  FAILED: 'failed'


hasSize = (i) ->
  (i.naturalWidth + i.naturalHeight is 0) or (i.width + i.height is 0)


ImageLoaderImg = React.createClass
  displayName: 'ImageLoaderImage'
  handleLoad: (args...) ->
    return unless @isMounted()
    image = @refs.image
    if 'naturalWidth' of image and not hasSize image
      @handleError new Error "Image <#{image.src}> could not be loaded."
    else @props.onLoad? args...
  handleError: (args...) ->
    @props.onError? args...
  render: ->
    @transferPropsTo (img
      ref: 'image'
      onLoad: @handleLoad
      onError: @handleError
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
  loaderDidLoad: ->
    @setState status: Status.LOADED
  loaderDidError: ->
    @setState status: Status.FAILED
  renderChildren: ->
    if Array.isArray @props.children then @props.children[..]
    else [@props.children]
  render: ->
    children = []
    if @props.src
      children.push @renderLoader ImageLoaderImg,
        style: display: if @state.status is Status.LOADED then null else 'none'
    if @props.preloader and @state.status isnt Status.LOADED
      children.push new @props.preloader
    if @state.status is Status.FAILED
      children = children.concat @renderChildren()
    @props.wrapper
      className: @getClassName()
      children
