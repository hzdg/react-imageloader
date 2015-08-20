/* eslint-env mocha */
/* global chai */
import ImageLoader from '../src';
import React from 'react/addons';

const {assert} = chai;
const {TestUtils} = React.addons;
const nocache = (url) => `${url}?r=${Math.floor(Math.random() * Date.now() / 16)}`;


describe('ReactImageLoader', () => {

  it('gives the wrapper a className', () => {
    const loader = TestUtils.renderIntoDocument(<ImageLoader className="test value" />);
    assert(TestUtils.findRenderedDOMComponentWithClass(loader, 'imageloader'));
    assert(TestUtils.findRenderedDOMComponentWithClass(loader, 'test'));
    assert(TestUtils.findRenderedDOMComponentWithClass(loader, 'value'));
  });

  it('uses a custom wrapper', () => {
    let loader = TestUtils.renderIntoDocument(<ImageLoader />);
    assert(TestUtils.findRenderedDOMComponentWithTag(loader, 'span'));
    loader = TestUtils.renderIntoDocument(<ImageLoader wrapper={React.DOM.div} />);
    assert(TestUtils.findRenderedDOMComponentWithTag(loader, 'div'));
  });

  it('gives the wrapper a custom style object', () => {
    const loader = TestUtils.renderIntoDocument(<ImageLoader style={{display: 'block', position: 'absolute', top: '50%', left: '50%', marginTop: '-50px', marginLeft: '-50px', width: '123px', height: '246px'}} />);
    const wrapper = TestUtils.findRenderedDOMComponentWithTag(loader, 'span');
    assert.equal(wrapper.props.style.display, 'block', 'Expected span to be set to `display: block`');
    assert.equal(wrapper.props.style.position, 'absolute', 'Expected position to be `absolute`');
    assert.equal(wrapper.props.style.top, '50%', 'Expected to be positioned at 50% from top boundary');
    assert.equal(wrapper.props.style.left, '50%', 'Expected to be positioned at 50% from left boundary');
    assert.equal(wrapper.props.style.marginTop, '-50px', 'Expected top margin to be -50px');
    assert.equal(wrapper.props.style.marginLeft, '-50px', 'Expected left margin to be -50px');
    assert.equal(wrapper.props.style.width, '123px', 'Expected width to be 123px');
    assert.equal(wrapper.props.style.height, '246px', 'Expected height to be 246px');
  });

  it('does not render the image without a src', () => {
    const loader = TestUtils.renderIntoDocument(<ImageLoader className="test value" />);
    assert(TestUtils.findRenderedDOMComponentWithClass(loader, 'pending'));
    assert.throws(() => { TestUtils.findRenderedDOMComponentWithClass(loader, 'loading'); });
    assert.throws(() => { TestUtils.findRenderedDOMComponentWithTag(loader, 'img'); });
  });

  it('does not render the image initially', () => {
    const loader = TestUtils.renderIntoDocument(<ImageLoader className="test value" src="fake.jpg" />);
    assert(TestUtils.findRenderedDOMComponentWithClass(loader, 'loading'));
    assert.throws(() => { TestUtils.findRenderedDOMComponentWithTag(loader, 'img'); });
  });

  it('renders the image when load completes', async function() {
    const loader = await loadImage({src: nocache('tiger.svg')});
    assert(TestUtils.findRenderedDOMComponentWithTag(loader, 'img'));
  });

  it('shows alternative string on error', async function() {
    try {
      await loadImage({src: nocache('fake.jpg')}, 'error');
    } catch ({loader}) {
      const span = TestUtils.findRenderedDOMComponentWithClass(loader, 'failed');
      assert.equal(span.props.children, 'error', 'Expected error message to be rendered');
      assert.throws(() => { TestUtils.findRenderedDOMComponentWithTag(loader, 'img'); });
      return;
    }
    throw new Error('Load should have failed!');
  });

  it('shows alternative img node on error', async function() {
    try {
      await loadImage({src: nocache('fake.jpg')}, <img src={'tiger.svg'} />);
    } catch ({loader}) {
      const span = TestUtils.findRenderedDOMComponentWithClass(loader, 'failed');
      const imgNodes = TestUtils.scryRenderedDOMComponentsWithTag(span, 'img');
      assert.lengthOf(imgNodes, 1, 'Expected one img node');
      assert.equal(imgNodes[0].props.src, 'tiger.svg');
      return;
    }
    throw new Error('Load should have failed!');
  });

  it('shows a preloader if provided', () => {
    const loader = TestUtils.renderIntoDocument(<ImageLoader preloader={React.DOM.div} />);
    assert(TestUtils.findRenderedDOMComponentWithTag(loader, 'div'));
  });

  it('removes a preloader when load completes', async function() {
    const loader = await loadImage({src: nocache('tiger.svg'), preloader: React.DOM.div});
    assert.throws(() => { TestUtils.findRenderedDOMComponentWithTag(loader, 'div'); });
  });

  it('removes a preloader when load fails', async function() {
    try {
      await loadImage({src: nocache('fake.jpg'), preloader: React.DOM.div});
    } catch ({loader}) {
      assert.throws(() => { TestUtils.findRenderedDOMComponentWithTag(loader, 'div'); });
      return;
    }
    throw new Error('Load should have failed!');
  });

  it('transfers `imgProps` to the underlying img element', async function() {
    const src = nocache('tiger.svg');
    const loader = await loadImage({src, imgProps: {alt: 'alt text', className: 'test'}});
    const img = TestUtils.findRenderedDOMComponentWithTag(loader, 'img');
    assert.equal(img.props.src, src, `Expected img to have src ${src}`);
    assert.equal(img.props.alt, 'alt text', 'Expected img to have alt text');
    assert.equal(img.props.className, 'test', 'Expected img to have className');
  });

  it('removes a previous image when src changes', async function() {
    const domEl = document.createElement('div');
    const loader = await loadImage({src: nocache('tiger.svg')}, null, domEl);
    assert.match(TestUtils.findRenderedDOMComponentWithTag(loader, 'img').props.src, /tiger\.svg/);

    // Rerender with a different source.
    loadImage(null, null, domEl).catch(() => {});
    assert.throws(() => TestUtils.findRenderedDOMComponentWithTag(loader, 'img'));
  });

  it('recovers from an error to load a new image', async function() {
    const domEl = document.createElement('div');

    // Fail to load an image.
    try {
      await loadImage({src: nocache('fake.jpg')}, null, domEl);
    } catch ({loader}) {
      assert.throws(() => TestUtils.findRenderedDOMComponentWithTag(loader, 'img'));
    }

    // Rerender with a different source.
    const loader = await loadImage({src: nocache('tiger.svg')}, null, domEl);
    assert(() => TestUtils.findRenderedDOMComponentWithTag(loader, 'img'));
  });

  it('abandons a load when unmounted', done => {
    const domEl = document.createElement('div');
    const loader = React.render(<ImageLoader
      src={nocache('tiger.svg')}
      onLoad={() => { done(new Error('This load should have been abandoned!')); }}
    />, domEl);

    // Make sure that the image load isn't handled by ImageLoader.
    loader.img.addEventListener('load', () => {
      assert.throws(() => TestUtils.findRenderedDOMComponentWithTag(loader, 'img'));
      done();
    });

    // Remove ImageLoader from the DOM.
    React.render(<div />, domEl);
  });

});


function loadImage(props, children, el) {
  let render;
  if (el) render = reactElement => React.render(reactElement, el);
  else render = TestUtils.renderIntoDocument;

  return new Promise((resolve, reject) => {
    const loader = render(
      <ImageLoader
        {...props}
        onLoad={() => { resolve(loader); }}
        onError={error => { reject(Object.assign(error, {loader})); }}>
        {children}
      </ImageLoader>
    );
  });
}
