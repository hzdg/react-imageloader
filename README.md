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


Usage
-----

```javascript
var ImageLoader = require('react-imageloader');

// ...

<ImageLoader src="/path/to/image.jpg">
  Image load failed!
</ImageLoader>

```


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
