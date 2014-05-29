{assert} = chai
{stub, spy} = sinon
{ImageLoader} = ReactLoaderComponents


describe 'ImageLoader', ->
  makeImageLoaderWrapperClass = (queue, imageOpts...) ->
    React.createClass
      render: ->
        React.withContext loadQueue: queue, -> ImageLoader imageOpts...

  it 'queues a load', ->
    queue = enqueue: stub().returns then: stub()
    component = makeImageLoaderWrapperClass queue, src: 'test.png'
    result = React.renderComponent component(), document.createElement 'div'
    assert queue.enqueue.calledOnce

  it 'prioritizes a load in the queue', ->
    throw new Error 'not implemented'

  it 'updates load priority in the queue', ->
    throw new Error 'not implemented'

  it 'renders a loaded image', ->
    throw new Error 'not implemented'

  it 'renders a load error', ->
    throw new Error 'not implemented'
