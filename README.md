react-imageloader
=================

One of the hardest things to wrangle in the browser is loading. When images and
other linked elements appear in the DOM, the browser makes decisions on when to
load them that sometimes result in problems for a site and its users, such as
[FOUC], unexpected load ordering, and degraded performance when many loads are
occurring.

This [React] component can improve the situation by allowing you to display
content while waiting for the image to load, as well as by showing alternate
content if the image fails to load.


Usage
-----

```javascript
import React from 'react';
import ImageLoader from 'react-imageloader';

function preloader() {
  return <img src="spinner.gif" />;
}

React.render((
  <ImageLoader
    src="/path/to/image.jpg"
    wrapper={React.DOM.div}
    preloader={preloader}>
    Image load failed!
  </ImageLoader>
), document.body);

```


Props
-----

Name        | Type     | Description
------------|----------|------------
`className` | string   | An optional class name for the `wrapper` component.
`imgProps`  | object   | An optional object containing props for the underlying `img` component.
`onError`   | function | An optional handler for the [error] event.
`onLoad`    | function | An optional handler for the [load] event.
`preloader` | function | An optional function that returns a React element to be shown while the image loads.
`src`       | string   | The URL of the image to be loaded.
`style`     | object   | An optional object containing styles for the `wrapper` component.
`wrapper`   | function | A function that takes a props argument and returns a React element to be used as the wrapper component. Defaults to `React.DOM.span`.


Children
--------

Children passed to `ImageLoader` will be rendered *only if* the image fails to load. Children are essentially alternate content to show when the image is missing or unavailable.

For example:

```javascript

React.createClass({
  // This will only show if "notgonnaload.jpg" doesn't load.
  errorMessage() {
    return (
      <div>
        <h2>Something went wrong!</h2>
        <p>Not gonna load "notgonnaload.jpg". bummer.</p>
      </div>
    );
  },
  render() {
    return (
      <ImageLoader src="notgonnaload.jpg">
        {this.errorMessage()}
      </ImageLoader>
    );
  }
})

```


Upgrading to 2.x
----------------

If you are upgrading to the 2.x version, there are a couple of changes you should be aware of:

* Since 2.0, `ImageLoader` requires **React >= 0.13**
* Loading is done 'off DOM' in a JavaScript `Image()` (instead of hidden in the DOM via a React `<img />`), so values passed to the `onLoad` and `onError` callbacks will be the browser native values, not React's synthesized values. This should't be a problem for the vast majority of use cases, but it is *technically* an API change.


[FOUC]: http://en.wikipedia.org/wiki/FOUC
[React]: http://facebook.github.io/react/
[load]: https://developer.mozilla.org/en-US/docs/Web/Events/load
[error]: https://developer.mozilla.org/en-US/docs/Web/Events/error
