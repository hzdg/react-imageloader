react-imageloader
=================

One of the hardest things to wrangle in the browser is loading. When images and
other linked elements appear in the DOM, the browser makes decisions on when to
load them that sometimes result in problems for a site and its users, such as
[FOUC], unexpected load ordering, and degraded performance when many loads are
occurring.

This component can improve the situation by allowing you to display content
while waiting for the image to load, as well as by showing alternate content
if the image fails to load.

Additionally, if you have more than a few images to load, you may want to take
the decisions about what to load and when from the browser, but still reap the
benefits of queuing and prioritizing that the browser is capable of. A load
queue (such as [queueup.js]) allows you to manage and prioritize loads in just
such a way, and this [React] component allows an easy way of hooking asset
loading for components into a load queue.


Usage
-----

```javascript
var ImageLoader = require('react-imageloader');

// ...

<ImageLoader src="/path/to/image.jpg">
  Image load failed!
</ImageLoader>

```


Load Queue
----------

If you render the component with a `loadQueue` (such as [queueup.js]) in context
(using `React.withContext`), then control of the load will be handed off to the
load queue, meaning it can be prioritized amongst other loads.

```javascript
var ImageLoader = require('react-imageloader');
var loadQueue = require('queueup')();
var ImageLoadQueueLoader = React.createClass({
  renderImageLoader: function() {
    this.transferPropsTo(<ImageLoader>{this.props.children}</ImageLoader>);
  },
  render: function() {
    React.withContext({loadQueue: loadQueue}, this.renderImageLoader);
  }
});

// ...

<ImageLoadQueueLoader src="/path/to/image.jpg" priority=1>
  Image load failed!
</ImageLoadQueueLoader>

```


Context
-------

<table>
  <thead>
    <th>Name</th>
    <th>Type</th>
    <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td>`loadQueue`</td>
      <td>object</td>
      <td>An object that manages loads in a queue. It is expected to have an
          `enqueue` method that takes a function that performs the load. When
          the load queue is ready to load the image, it should call the provided
          function, passing it a callback. That callback will be called when the
          load completes (or errors).</td>
    </tr>
  </tbody>
</table>


Props
-----

<table>
  <thead>
    <th>Name</th>
    <th>Type</th>
    <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td>`src`</td>
      <td>string</td>
      <td>The URL of the image to be loaded.</td>
    </tr>
    <tr>
      <td>`priority`</td>
      <td>number</td>
      <td>The priority to assign to this load, relative to other loads in the
          queue. This prop has no effect if there is no `loadQueue` in the
          component context. Defaults to `0`</td>
    </tr>
    <tr>
      <td>`preloader`</td>
      <td>function</td>
      <td>A React class or other function that returns a component instance to
          be shown while the image loads.</td>
    </tr>
    <tr>
      <td>`onLoad`</td>
      <td>function</td>
      <td>A handler for the React `<img>` `onLoad` event.</td>
    </tr>
    <tr>
      <td>`onError`</td>
      <td>function</td>
      <td>A handler for the React `<img>` `onError` event.</td>
    </tr>
    <tr>
      <td>`wrapper`</td>
      <td>function</td>
      <td>A React class or other function that returns a component instance to
          be used as the wrapper component. Defaults to `React.DOM.span`.</td>
    </tr>
  </tbody>
</table>


[FOUC]: http://en.wikipedia.org/wiki/FOUC/
[React]: http://facebook.github.io/react/
[queueup.js]: http://github.com/hzdg/queueup.js/
[queueup-imageloader]: https://github.com/hzdg/queueup-imageloader
