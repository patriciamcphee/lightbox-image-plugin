/**
 * Copyright (c) Patricia McPhee.
 *
 * This source code is licensed under the MIT license.
 */

const path = require('path');

module.exports = function imageZoomPlugin(context, options = {}) {
  const defaultOptions = {
    selector: '.markdown img',
    background: 'rgba(0, 0, 0, 0.8)',
    zIndex: 999,
    margin: 20,
    scrollOffset: 10,
    ...options
  };

  const isProd = process.env.NODE_ENV === 'production';

  return {
    name: 'lightbox-image-plugin',

    getClientModules() {
      return [path.resolve(__dirname, './client/index.js')];
    },

    configureWebpack(config, isServer, utils) {
      if (isServer) {
        return {};
      }
      return {
        resolve: {
          alias: {
            '@image-zoom/client': path.resolve(__dirname, './client/index.js'),
          },
        },
      };
    },

    injectHtmlTags({ content }) {
      return {
        headTags: [
          {
            tagName: 'style',
            innerHTML: `
              /* Image Zoom Plugin Styles */
              .zoom-img-wrap {
                display: inline-block;
                cursor: zoom-in;
                position: relative;
              }
              
              .zoom-img-wrap img {
                display: block;
                cursor: zoom-in;
                max-width: 100%;
                height: auto;
              }
              
              .zoom-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: ${defaultOptions.background};
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                z-index: ${defaultOptions.zIndex};
                -webkit-backdrop-filter: blur(5px);
                backdrop-filter: blur(5px);
              }
              
              .zoom-overlay.active {
                opacity: 1;
                pointer-events: auto;
                cursor: zoom-out;
              }
              
              .zoomed-img {
                position: fixed;
                max-width: calc(100% - ${defaultOptions.margin * 2}px);
                max-height: calc(100% - ${defaultOptions.margin * 2}px);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.5);
                transition: transform 0.3s ease, opacity 0.3s ease;
                z-index: ${defaultOptions.zIndex + 1};
                cursor: zoom-out;
                opacity: 0;
                pointer-events: none;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                border-radius: 4px;
              }
              
              .zoomed-img.active {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
                pointer-events: auto;
              }
              
              /* Loading state */
              .zoom-img-wrap.loading::after {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 20px;
                height: 20px;
                border: 2px solid rgba(0, 0, 0, 0.1);
                border-top-color: #333;
                border-radius: 50%;
                animation: spin 0.6s linear infinite;
              }
              
              @keyframes spin {
                to { transform: translate(-50%, -50%) rotate(360deg); }
              }
              
              /* Mobile responsive */
              @media (max-width: 768px) {
                .zoomed-img {
                  max-width: calc(100% - 20px);
                  max-height: calc(100% - 20px);
                }
              }
              
              /* Dark mode adjustments */
              [data-theme='dark'] .zoom-img-wrap.loading::after {
                border-color: rgba(255, 255, 255, 0.1);
                border-top-color: #fff;
              }
              
              /* Accessibility */
              .zoom-img-wrap:focus-visible {
                outline: 2px solid var(--ifm-color-primary);
                outline-offset: 2px;
              }
              
              /* Print styles */
              @media print {
                .zoom-overlay,
                .zoomed-img {
                  display: none !important;
                }
              }
            `.replace(/\s+/g, ' ').trim()
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