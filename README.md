react-imageloader
=================

🚨 This project is not maintained! 🚨

We are no longer using this component in our day-to-day work, so unfortunately,
we have neglected maintenance of it for quite some time. Among the reasons
why we haven't been using this component are:

  - It has [some design flaws](#design-decisions-mistakes)
  - We've been more focus on react-native

However, it may still work for you. If you are looking for something like
this, but don't want to take on an unmaintained dependency, check out
[this fork](https://github.com/DeedMob/react-load-image).

See the [support matrix](#supported-versions-of-react) below
if you are determined to use this.

---

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
    wrapper={React.createFactory('div')}
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
`wrapper`   | function | A function that takes a props argument and returns a React element to be used as the wrapper component. Defaults to `React.createFactory('span')`.


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

Design Decisions (mistakes?)
----------------------------
Since v2.0, loading is done 'off DOM' in a JavaScript `Image()` (instead of
hidden in the DOM via a React `<img />`), so values passed to the `onLoad`
and `onError` callbacks will be the browser native values, not React's
synthesized values. While this shouldn't be a problem for the vast majority
of use cases, it can cause weirdness when browser caching is disabled
(i.e., images loading twice, preloaders disappearing before the image is ready).

Supported versions of React
---------------------------

React        | ImageLoader
-------------|------------
 <0.13       | 1.x
 >=0.13, <15 | 2.x
 >=15        | 3.x

[FOUC]: http://en.wikipedia.org/wiki/FOUC
[React]: http://facebook.github.io/react/
[load]: https://developer.mozilla.org/en-US/docs/Web/Events/load
[error]: https://developer.mozilla.org/en-US/docs/Web/Events/error
