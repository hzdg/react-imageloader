{assert} = chai
ImageLoader = ReactImageLoader

nocache = (url) -> "#{ url }?r=#{ Math.floor Math.random() * Date.now() / 16 }"


describe 'ReactImageLoader', ->
  div = null

  render = (component) ->
    React.renderComponent component, div
    div.children[0]

  beforeEach ->
    div = document.createElement 'div'

  it 'gives the wrapper a className', ->
    wrapper = render (ImageLoader className: 'test value')
    assert wrapper.classList.contains('imageloader'),
      "Expected wrapper to have 'imageloader' class"
    assert wrapper.classList.contains('test'),
      "Expected wrapper to have 'test' class"
    assert wrapper.classList.contains('value'),
      "Expected wrapper to have 'value' class"

  it 'uses a custom wrapper', ->
    ref = null
    wrapper = render (ImageLoader wrapper: -> ref = (React.DOM.div null))
    assert.equal ref.getDOMNode(), wrapper,
      'Expected wrapper to be custom'

  it 'does not render the image without a src', ->
    wrapper = render (ImageLoader className: 'test value')
    assert wrapper.classList.contains('pending'),
      "Expected wrapper to have 'pending' class"
    assert.isFalse wrapper.classList.contains('loading'),
      "Expected wrapper not to have 'loading' class"
    assert.equal wrapper.childElementCount, 0,
      'Expected wrapper to have no children'

  it 'renders the image as not visible', ->
    wrapper = render (ImageLoader src: nocache 'tiger.svg')
    img = wrapper.getElementsByTagName('img')[0]
    assert img.style.display is 'none', "Expected img display to be 'none'"

  it 'renders the image as visible when load completes', (done) ->
    wrapper = render (ImageLoader
      src: nocache 'tiger.svg'
      onLoad: ->
        img = wrapper.getElementsByTagName('img')[0]
        assert.notOk img.style.display, 'Expected img display to be falsy'
        done()
    )

  it 'shows alternative content on error', (done) ->
    wrapper = render (ImageLoader
      src: nocache 'fake.jpg'
      onError: ->
        span = wrapper.getElementsByTagName('span')[0]
        assert.equal span.childNodes[0].data, 'error',
          'Expected error message to be rendered'
        done()
      'error'
    )

  it 'shows a preloader if provided', ->
    ref = null
    wrapper = render (ImageLoader
      preloader: -> ref = (React.DOM.div null)
    )
    assert.isTrue ref.isMounted(), 'Expected preloader to be mounted'
    assert.equal ref.getDOMNode(), wrapper.getElementsByTagName('div')[0],
      'Expected preloader to be rendered'

  it 'removes a preloader when load completes', (done) ->
    ref = null
    wrapper = render (ImageLoader
      src: nocache 'tiger.svg'
      preloader: -> ref = (React.DOM.div null)
      onLoad: ->
        assert.equal wrapper.childElementCount, 1,
          'Expected wrapper to have exactly one child'
        assert.isFalse ref.isMounted(), 'Expected preloader not to be mounted'
        done()
    )
