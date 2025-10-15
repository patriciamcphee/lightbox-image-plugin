# light-image-plugin

A lightweight, zero-dependency image zoom plugin for Docusaurus 3.x that adds smooth click-to-zoom functionality to documentation images.

## Features

- 🪶 **Lightweight** - Zero runtime dependencies, ~3KB minified
- 🖼️ **Click-to-zoom** - Simple click interaction for image viewing
- 🎨 **Smooth animations** - CSS transitions for elegant zoom effects
- ⌨️ **Keyboard support** - ESC to close, full accessibility
- 📱 **Mobile-friendly** - Touch-enabled and responsive
- 🌙 **Dark mode ready** - Adapts to your theme automatically
- 🎯 **Smart detection** - Automatically excludes linked images and icons
- ⚡ **Performance focused** - Minimal impact on page load

## Installation

```bash
npm install lightbox-image-plugin
# or
yarn add lightbox-image-plugin
# or
pnpm add lightbox-image-plugin
```

## Quick Start

Add to your `docusaurus.config.js`:

```javascript
module.exports = {
  plugins: [
    [
      'lightbox-image-plugin',
      {
        selector: '.markdown img',           // CSS selector for images
        background: 'rgba(0, 0, 0, 0.8)',   // Overlay background
        zIndex: 999,                        // Overlay z-index
        margin: 20,                          // Margin around zoomed image
        scrollOffset: 10                     // Scroll offset threshold
      }
    ]
  ]
};
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `selector` | `string` | `'.markdown img'` | CSS selector for zoomable images |
| `background` | `string` | `'rgba(0, 0, 0, 0.8)'` | Overlay background color |
| `zIndex` | `number` | `999` | Base z-index for overlay |
| `margin` | `number` | `20` | Margin around zoomed image (px) |
| `scrollOffset` | `number` | `10` | Scroll offset threshold (px) |

## Usage

Once installed, all images matching the selector become zoomable automatically.

### Basic Usage

Any image in your markdown will be zoomable:

```markdown
![Example Image](./assets/example.jpg)
```

### High-Resolution Images

Provide a high-res version for zoom:

```html
<img 
  src="thumbnail.jpg" 
  data-zoom-src="high-res.jpg" 
  alt="Example"
/>
```

### Excluding Images

Images inside links are automatically excluded:

```markdown
[![Logo](./logo.png)](https://example.com)  <!-- Not zoomable -->
```

Small images (<100px) are also automatically excluded to avoid zooming icons.

## Advanced Usage

### Custom Selectors

Target specific images only:

```javascript
// docusaurus.config.js
{
  selector: '.zoomable'  // Only images with .zoomable class
}
```

```mdx
import imageUrl from './assets/diagram.png';

<img src={imageUrl} className="zoomable" alt="Diagram" />
```

### Light Theme Overlay

Perfect for light mode documentation:

```javascript
{
  background: 'rgba(255, 255, 255, 0.95)'
}
```

### Custom Z-Index

Ensure compatibility with other overlays:

```javascript
{
  zIndex: 10000  // Higher z-index for modal conflicts
}
```

## Styling

Override default styles in your custom CSS:

```css
/* src/css/custom.css */

/* Custom overlay background */
.zoom-overlay {
  background: linear-gradient(
    to bottom, 
    rgba(0, 0, 0, 0.9), 
    rgba(0, 0, 0, 0.7)
  ) !important;
}

/* Custom animation speed */
.zoom-overlay,
.zoomed-img {
  transition-duration: 0.5s !important;
}

/* Custom cursor */
.zoom-img-wrap {
  cursor: pointer !important;
}
```

## Why "Lightbox"?

- **Zero dependencies** - No external libraries required
- **Minimal footprint** - ~3KB minified
- **Simple implementation** - Pure JavaScript and CSS
- **Fast performance** - No framework overhead

## Accessibility

The plugin includes comprehensive accessibility features:

- **Keyboard navigation**: ESC to close
- **ARIA labels**: Proper labels for screen readers
- **Focus management**: Visible focus indicators
- **Semantic HTML**: Proper role attributes

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS/Android)

## Troubleshooting

### Images not zoomable?

1. Check if images match the selector
2. Verify images aren't wrapped in links
3. Ensure images are larger than 100px
4. Check browser console for errors

### Zoom appears behind other elements?

Increase the z-index in configuration:

```javascript
{
  zIndex: 999999
}
```

### Conflicts with other plugins?

Try using a more specific selector:

```javascript
{
  selector: 'article img:not(.no-zoom)'
}
```

## Examples

### Basic Markdown Image
```markdown
![Architecture Diagram](./architecture.png)
```

### MDX with Custom Class
```jsx
<img 
  src={require('./screenshot.png').default}
  className="zoomable"
  alt="App Screenshot"
/>
```

### High-Resolution Support
```html
<img 
  src="preview.jpg"
  data-zoom-src="full-size.jpg"
  alt="Detailed Chart"
/>
```

## Comparison

| Feature | lightbox-image-plugin | medium-zoom | react-medium-image-zoom |
|---------|-------------------|-------------|------------------------|
| Zero dependencies | ✅ | ❌ | ❌ |
| Bundle size | ~3KB | ~7KB | ~15KB |
| Docusaurus 3.x | ✅ Native | ⚠️ Manual | ⚠️ Manual |
| Auto-setup | ✅ | ❌ | ❌ |
| TypeScript | Not needed | ✅ | ✅ |


## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## License

MIT &copy; Patricia McPhee

## Links

- [npm Package](https://www.npmjs.com/package/lightbox-image-plugin)
- [GitHub Repository](https://github.com/patriciamcphee/lightbox-image-plugin)
- [Report Issues](https://github.com/patriciamcphee/lightbox-image-plugin/issues)

## Changelog

### [1.0.0] - 2024-01-01
- Initial release
- Click-to-zoom functionality
- Keyboard support
- Dark mode compatibility
- Auto image detection
