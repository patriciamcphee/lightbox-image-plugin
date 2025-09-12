// plugins/image-zoom-plugin/index.js

module.exports = function (context, options) {
  const defaultOptions = {
    selector: '.markdown img',
    background: 'rgba(0, 0, 0, 0.8)',
    zIndex: 999,
    ...options
  };

  return {
    name: 'image-zoom-plugin',

    getClientModules() {
      return [require.resolve('./client')];
    },

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'style',
            innerHTML: `
              .zoom-img-wrap {
                display: inline-block;
                cursor: zoom-in;
              }
              
              .zoom-img-wrap img {
                display: block;
                cursor: zoom-in;
              }
              
              .zoom-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
                z-index: 999;
              }
              
              .zoom-overlay.active {
                opacity: 1;
                pointer-events: auto;
                cursor: zoom-out;
              }
              
              .zoomed-img {
                position: fixed;
                max-width: 95%;
                max-height: 95%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.5);
                transition: transform 0.3s;
                z-index: 1000;
                cursor: zoom-out;
                opacity: 0;
                pointer-events: none;
              }
              
              .zoomed-img.active {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
                pointer-events: auto;
              }
            `
          }
        ],
        postBodyTags: [
          {
            tagName: 'script',
            innerHTML: `
              window.__IMAGE_ZOOM_OPTIONS__ = ${JSON.stringify(defaultOptions)};
            `
          }
        ]
      };
    }
  };
};