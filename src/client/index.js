/**
 * Copyright (c) Patricia McPhee.
 *
 * This source code is licensed under the MIT license.
 */

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  function initImageZoom() {
    const options = window.__IMAGE_ZOOM_OPTIONS__ || {};
    let activeZoom = null;
    let isTransitioning = false;

    function processImages() {
      const images = document.querySelectorAll(options.selector);
      
      images.forEach(img => {
        // Skip if already processed
        if (img.dataset.zoomProcessed === 'true') {
          return;
        }

        // Skip if image is inside a link
        if (img.closest('a')) {
          return;
        }

        // Skip tiny images (likely icons)
        if (img.naturalWidth < 100 || img.naturalHeight < 100) {
          return;
        }

        // Mark as processed
        img.dataset.zoomProcessed = 'true';

        // Wrap image for zoom functionality
        const wrapper = document.createElement('div');
        wrapper.className = 'zoom-img-wrap';
        wrapper.tabIndex = 0; // Make keyboard accessible
        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('aria-label', 'Click to zoom image');
        
        // Preserve any existing classes on the image
        if (img.className) {
          wrapper.className += ' ' + img.className.replace(/\s+/g, '-wrap ') + '-wrap';
        }

        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        // Add loading state for large images
        if (!img.complete) {
          wrapper.classList.add('loading');
          img.addEventListener('load', () => {
            wrapper.classList.remove('loading');
          });
        }

        // Add click handler
        const clickHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isTransitioning) {
            openZoom(img);
          }
        };

        wrapper.addEventListener('click', clickHandler);
        
        // Add keyboard handler
        wrapper.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clickHandler(e);
          }
        });
      });
    }

    function openZoom(img) {
      if (isTransitioning) return;
      
      // Clean up any existing zoom
      closeZoom();

      isTransitioning = true;

      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'zoom-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Zoomed image view');

      // Create zoomed image
      const zoomedImg = document.createElement('img');
      
      // Use high-res source if available
      const highResSrc = img.dataset.zoomSrc || img.src;
      zoomedImg.src = highResSrc;
      
      zoomedImg.className = 'zoomed-img';
      zoomedImg.alt = img.alt || 'Zoomed image';
      
      // Copy srcset if available
      if (img.srcset) {
        zoomedImg.srcset = img.srcset;
      }

      // Add to DOM
      document.body.appendChild(overlay);
      document.body.appendChild(zoomedImg);

      // Store active zoom elements
      activeZoom = { overlay, zoomedImg };

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Trigger animation after a frame
      requestAnimationFrame(() => {
        overlay.classList.add('active');
        zoomedImg.classList.add('active');
        setTimeout(() => {
          isTransitioning = false;
        }, 300);
      });

      // Close handlers
      const closeHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isTransitioning) {
          closeZoom();
        }
      };

      overlay.addEventListener('click', closeHandler);
      zoomedImg.addEventListener('click', closeHandler);

      // Keyboard handlers
      const keyHandler = (e) => {
        if (e.key === 'Escape') {
          closeZoom();
        }
      };
      document.addEventListener('keydown', keyHandler);
      
      // Store handler for cleanup
      activeZoom.keyHandler = keyHandler;

      // Focus trap
      zoomedImg.focus();
    }

    function closeZoom() {
      if (!activeZoom || isTransitioning) return;

      isTransitioning = true;

      const { overlay, zoomedImg, keyHandler } = activeZoom;

      // Remove active classes
      overlay.classList.remove('active');
      zoomedImg.classList.remove('active');

      // Restore body scroll
      document.body.style.overflow = '';

      // Remove keyboard handler
      if (keyHandler) {
        document.removeEventListener('keydown', keyHandler);
      }

      // Remove elements after animation
      setTimeout(() => {
        overlay?.remove();
        zoomedImg?.remove();
        isTransitioning = false;
      }, 300);

      activeZoom = null;
    }

    // Initialize on page load
    processImages();

    // Re-process when DOM changes (for dynamically loaded content)
    const observer = new MutationObserver((mutations) => {
      // Check if any mutations added images
      const hasNewImages = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          return node.nodeType === 1 && (
            node.tagName === 'IMG' ||
            node.querySelector?.('img')
          );
        });
      });

      if (hasNewImages) {
        processImages();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up on navigation
    window.addEventListener('popstate', closeZoom);
    
    // Handle route changes in SPA
    if (window.navigation) {
      window.navigation.addEventListener('navigate', closeZoom);
    }

    // Cleanup function for HMR and navigation
    if (module.hot) {
      module.hot.dispose(() => {
        closeZoom();
        observer.disconnect();
        window.removeEventListener('popstate', closeZoom);
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initImageZoom, 100);
    });
  } else {
    setTimeout(initImageZoom, 100);
  }
}

export default {};