// plugins/image-zoom-plugin/client.js

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  function initImageZoom() {
    const options = window.__IMAGE_ZOOM_OPTIONS__ || {};
    let activeZoom = null;

    function processImages() {
      const images = document.querySelectorAll(options.selector);
      
      images.forEach(img => {
        // Skip if already processed
        if (img.parentElement?.classList?.contains('zoom-img-wrap')) {
          return;
        }

        // Skip if image is inside a link
        if (img.closest('a')) {
          return;
        }

        // Wrap image for zoom functionality
        const wrapper = document.createElement('div');
        wrapper.className = 'zoom-img-wrap';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        // Add click handler
        img.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          openZoom(img);
        });
      });
    }

    function openZoom(img) {
      // Clean up any existing zoom
      closeZoom();

      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'zoom-overlay';
      if (options.background) {
        overlay.style.background = options.background;
      }
      if (options.zIndex) {
        overlay.style.zIndex = options.zIndex;
      }

      // Create zoomed image
      const zoomedImg = document.createElement('img');
      zoomedImg.src = img.src;
      zoomedImg.className = 'zoomed-img';
      zoomedImg.style.zIndex = (options.zIndex || 999) + 1;

      // Add to DOM
      document.body.appendChild(overlay);
      document.body.appendChild(zoomedImg);

      // Store active zoom elements
      activeZoom = { overlay, zoomedImg };

      // Trigger animation after a frame
      requestAnimationFrame(() => {
        overlay.classList.add('active');
        zoomedImg.classList.add('active');
      });

      // Close handlers
      const closeHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeZoom();
      };

      overlay.addEventListener('click', closeHandler);
      zoomedImg.addEventListener('click', closeHandler);

      // ESC key handler
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          closeZoom();
        }
      };
      document.addEventListener('keydown', escHandler);
      
      // Store handler for cleanup
      activeZoom.escHandler = escHandler;
    }

    function closeZoom() {
      if (!activeZoom) return;

      const { overlay, zoomedImg, escHandler } = activeZoom;

      // Remove active classes
      overlay.classList.remove('active');
      zoomedImg.classList.remove('active');

      // Remove ESC handler
      if (escHandler) {
        document.removeEventListener('keydown', escHandler);
      }

      // Remove elements after animation
      setTimeout(() => {
        overlay?.remove();
        zoomedImg?.remove();
      }, 300);

      activeZoom = null;
    }

    // Initialize on page load
    processImages();

    // Re-process when DOM changes (for dynamically loaded content)
    const observer = new MutationObserver(() => {
      processImages();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up on navigation
    window.addEventListener('popstate', closeZoom);
    window.addEventListener('pushstate', closeZoom);
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