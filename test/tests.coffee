{assert} = chai
{TestUtils} = React.addons
ImageLoader = React.createFactory ReactImageLoader

nocache = (url) -> "#{ url }?r=#{ Math.floor Math.random() * Date.now() / 16 }"
defer = (fn) -> setTimeout fn, 0


describe 'ReactImageLoader', ->

  it 'gives the wrapper a className', ->
    loader = TestUtils.renderIntoDocument (ImageLoader className: 'test value')
    assert TestUtils.findRenderedDOMComponentWithClass loader, 'imageloader'
    assert TestUtils.findRenderedDOMComponentWithClass loader, 'test'
    assert TestUtils.findRenderedDOMComponentWithClass loader, 'value'

  it 'uses a custom wrapper', ->
    loader = TestUtils.renderIntoDocument (ImageLoader null)
    assert TestUtils.findRenderedDOMComponentWithTag loader, 'span'
    loader = TestUtils.renderIntoDocument (ImageLoader wrapper: React.DOM.div)
    assert TestUtils.findRenderedDOMComponentWithTag loader, 'div'

  it 'does not render the image without a src', ->
    loader = TestUtils.renderIntoDocument (ImageLoader className: 'test value')
    assert TestUtils.findRenderedDOMComponentWithClass loader, 'pending'
    assert.throws -> TestUtils.findRenderedDOMComponentWithClass loader, 'loading'
    assert.equal loader.getDOMNode().childElementCount, 0, 'Expected wrapper to have no children'

  it 'renders the image as not visible', ->
    loader = TestUtils.renderIntoDocument (ImageLoader src: nocache 'tiger.svg')
    img = TestUtils.findRenderedDOMComponentWithTag loader, 'img'
    assert.equal img.props.style.display, 'none', "Expected img display to be 'none'"

  it 'renders the image as visible when load completes', (done) ->
    loader = TestUtils.renderIntoDocument (ImageLoader
      src: nocache 'tiger.svg'
      onLoad: ->
        # FIXME: We set a timeout here because the style change we're testing
        # happens on the next render. Is there a cleaner, less brittle way to
        # test this?
        defer ->
          img = TestUtils.findRenderedDOMComponentWithTag loader, 'img'
          assert.notOk img.props.style.display, 'Expected img display to be falsy'
          done()
      )

  it 'shows alternative content on error', (done) ->
    loader = TestUtils.renderIntoDocument (ImageLoader
      src: nocache 'fake.jpg'
      onError: ->
        # FIXME: We set a timeout here because the style change we're testing
        # happens on the next render. Is there a cleaner, less brittle way to
        # test this?
        defer ->
          span = TestUtils.findRenderedDOMComponentWithTag loader, 'span'
          textNodes = TestUtils.findAllInRenderedTree span, (n) -> TestUtils.isTextComponent n
          assert.lengthOf textNodes, 1, 'Expected one text node'
          assert.equal textNodes[0].props, 'error', 'Expected error message to be rendered'
          done()
      'error'
      )

  it 'shows a preloader if provided', ->
    loader = TestUtils.renderIntoDocument (ImageLoader preloader: React.DOM.div)
    assert TestUtils.findRenderedDOMComponentWithTag loader, 'div'

  it 'removes a preloader when load completes', (done) ->
    loader = TestUtils.renderIntoDocument (ImageLoader
      src: nocache 'tiger.svg'
      preloader: React.DOM.div
      onLoad: ->
        # FIXME: We set a timeout here because the style change we're testing
        # happens on the next render. Is there a cleaner, less brittle way to
        # test this?
        defer ->
          assert.throws -> TestUtils.findRenderedDOMComponentWithTag loader, 'div'
          done()
      )

  it 'transfers img props to the underlying img element', ->
    loader = TestUtils.renderIntoDocument (ImageLoader
      src: nocache 'tiger.svg'
      alt: 'this is alt text'
      style:
        width: 100
      )
    img = TestUtils.findRenderedDOMComponentWithTag loader, 'img'
    assert.equal img.props.style.width, 100, "Expected img width to be 100"
    assert.equal img.props.alt, 'this is alt text', 'Expected img to have alt text'
