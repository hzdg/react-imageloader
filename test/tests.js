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

  it('does not render the image without a src', () => {
    const loader = TestUtils.renderIntoDocument(<ImageLoader className="test value" />);
    assert(TestUtils.findRenderedDOMComponentWithClass(loader, 'pending'));
    assert.throws(() => { TestUtils.findRenderedDOMComponentWithClass(loader, 'loading'); });
    assert.equal(loader.getDOMNode().childElementCount, 0, 'Expected wrapper to have no children');
  });

  it('does not render the image initially', () => {
    const loader = TestUtils.renderIntoDocument(<ImageLoader className="test value" src="fake.jpg" />);
    assert(TestUtils.findRenderedDOMComponentWithClass(loader, 'loading'));
    assert.equal(loader.getDOMNode().childElementCount, 0, 'Expected wrapper to have no children');
  });

  it('renders the image when load completes', async function() {
    const loader = await loadImage({src: nocache('tiger.svg')});
    assert(TestUtils.findRenderedDOMComponentWithTag(loader, 'img'));
  });

  it('shows alternative string on error', async function() {
    try {
      await loadImage({src: nocache('fake.jpg')}, 'error');
    } catch (loader) {
      const span = TestUtils.findRenderedDOMComponentWithTag(loader, 'span');
      const textNodes = TestUtils.findAllInRenderedTree(span, (n) => TestUtils.isTextComponent(n));
      assert.lengthOf(textNodes, 1, 'Expected one text node');
      assert.equal(textNodes[0].props, 'error', 'Expected error message to be rendered');
      return;
    }
    throw new Error('Load should have failed!');
  });

  it('shows alternative img node on error', async function() {
    try {
      await loadImage({src: nocache('fake.jpg')}, <img />);
    } catch (loader) {
      const span = TestUtils.findRenderedDOMComponentWithTag(loader, 'span');
      const imgNodes = TestUtils.scryRenderedDOMComponentsWithTag(span, 'img');
      assert.lengthOf(imgNodes, 2, 'Expected two img node');
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
    } catch (loader) {
      assert.throws(() => { TestUtils.findRenderedDOMComponentWithTag(loader, 'div'); });
      return;
    }
    throw new Error('Load should have failed!');
  });

  it('transfers img props to the underlying img element', async function() {
    const loader = await loadImage({src: nocache('tiger.svg'), alt: 'this is alt text', style: {width: 100}});
    const img = TestUtils.findRenderedDOMComponentWithTag(loader, 'img');
    assert.equal(img.props.style.width, 100, 'Expected img width to be 100');
    assert.equal(img.props.alt, 'this is alt text', 'Expected img to have alt text');
  });

});


function loadImage(props, children) {
  return new Promise((resolve, reject) => {
    const loader = TestUtils.renderIntoDocument(
      <ImageLoader
        {...props}
        onLoad={() => { resolve(loader); }}
        onError={() => { reject(loader); }}>
        {children}
      </ImageLoader>
    );
  });
}
