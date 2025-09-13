// lib/client/index.js or src/client/index.js
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  let initialized = false;
  let activeZoom = null;
  let isTransitioning = false;
  let observer = null;

  function initImageZoom() {
    const options = window.__IMAGE_ZOOM_OPTIONS__ || {};

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
          // If image not loaded yet, wait for it
          if (!img.complete) {
            img.addEventListener('load', () => {
              if (img.naturalWidth >= 100 && img.naturalHeight >= 100) {
                wrapImage(img);
              }
            });
          }
          return;
        }

        wrapImage(img);
      });
    }

    function wrapImage(img) {
      // Mark as processed
      img.dataset.zoomProcessed = 'true';

      // Wrap image for zoom functionality
      const wrapper = document.createElement('div');
      wrapper.className = 'zoom-img-wrap';
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'button');
      wrapper.setAttribute('aria-label', 'Click to zoom image');
      
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
    }

    function openZoom(img) {
      if (isTransitioning) return;
      
      closeZoom();

      isTransitioning = true;

      const overlay = document.createElement('div');
      overlay.className = 'zoom-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Zoomed image view');

      const zoomedImg = document.createElement('img');
      const highResSrc = img.dataset.zoomSrc || img.src;
      zoomedImg.src = highResSrc;
      zoomedImg.className = 'zoomed-img';
      zoomedImg.alt = img.alt || 'Zoomed image';
      
      if (img.srcset) {
        zoomedImg.srcset = img.srcset;
      }

      document.body.appendChild(overlay);
      document.body.appendChild(zoomedImg);

      activeZoom = { overlay, zoomedImg };

      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        overlay.classList.add('active');
        zoomedImg.classList.add('active');
        setTimeout(() => {
          isTransitioning = false;
        }, 300);
      });

      const closeHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isTransitioning) {
          closeZoom();
        }
      };

      overlay.addEventListener('click', closeHandler);
      zoomedImg.addEventListener('click', closeHandler);

      const keyHandler = (e) => {
        if (e.key === 'Escape') {
          closeZoom();
        }
      };
      document.addEventListener('keydown', keyHandler);
      
      activeZoom.keyHandler = keyHandler;
      zoomedImg.focus();
    }

    function closeZoom() {
      if (!activeZoom || isTransitioning) return;

      isTransitioning = true;

      const { overlay, zoomedImg, keyHandler } = activeZoom;

      overlay.classList.remove('active');
      zoomedImg.classList.remove('active');

      document.body.style.overflow = '';

      if (keyHandler) {
        document.removeEventListener('keydown', keyHandler);
      }

      setTimeout(() => {
        overlay?.remove();
        zoomedImg?.remove();
        isTransitioning = false;
      }, 300);

      activeZoom = null;
    }

    // Clean up function
    function cleanup() {
      // Mark all images as unprocessed for reprocessing
      document.querySelectorAll('[data-zoom-processed="true"]').forEach(img => {
        img.dataset.zoomProcessed = 'false';
      });
      
      // Remove any existing wrappers
      document.querySelectorAll('.zoom-img-wrap').forEach(wrapper => {
        const img = wrapper.querySelector('img');
        if (img && wrapper.parentNode) {
          wrapper.parentNode.insertBefore(img, wrapper);
          wrapper.remove();
        }
      });

      // Close any open zoom
      closeZoom();
    }

    // Initialize images
    processImages();

    // Set up MutationObserver for dynamically added content
    if (observer) {
      observer.disconnect();
    }
    
    observer = new MutationObserver((mutations) => {
      const hasNewImages = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          return node.nodeType === 1 && (
            node.tagName === 'IMG' ||
            node.querySelector?.('img')
          );
        });
      });

      if (hasNewImages) {
        setTimeout(processImages, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Return cleanup function
    return cleanup;
  }

  // Function to initialize or reinitialize
  function setupImageZoom() {
    // Wait a bit for DOM to stabilize
    setTimeout(() => {
      initImageZoom();
    }, 100);
  }

  // Initial setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupImageZoom);
  } else {
    setupImageZoom();
  }

  // CRITICAL FIX: Listen for Docusaurus route changes
  // Docusaurus uses React Router which doesn't trigger popstate on navigation
  
  // Method 1: Use Docusaurus/React Router lifecycle events
  if (typeof window !== 'undefined') {
    // Re-initialize on route changes
    let lastPathname = window.location.pathname;
    
    // Check for route changes using a more reliable method
    const checkForRouteChange = () => {
      if (window.location.pathname !== lastPathname) {
        lastPathname = window.location.pathname;
        // Clean up and reinitialize
        setupImageZoom();
      }
    };

    // Poll for route changes (most reliable for SPAs)
    setInterval(checkForRouteChange, 100);

    // Also listen to popstate for browser back/forward
    window.addEventListener('popstate', setupImageZoom);

    // Listen for pushstate/replacestate
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
      originalPushState.apply(history, arguments);
      setTimeout(setupImageZoom, 100);
    };

    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      setTimeout(setupImageZoom, 100);
    };
  }

  // Method 2: Hook into Docusaurus lifecycle if available
  if (window.__docusaurus) {
    const { onRouteUpdate } = window.__docusaurus;
    if (onRouteUpdate) {
      onRouteUpdate(() => {
        setupImageZoom();
      });
    }
  }

  // Method 3: Use MutationObserver on the main content area
  const contentObserver = new MutationObserver((mutations) => {
    // Check if the main content has changed significantly
    const hasSignificantChange = mutations.some(mutation => {
      return mutation.target.classList?.contains('main-wrapper') ||
             mutation.target.classList?.contains('docMainContainer') ||
             mutation.target.tagName === 'MAIN' ||
             mutation.target.tagName === 'ARTICLE';
    });

    if (hasSignificantChange) {
      setTimeout(setupImageZoom, 200);
    }
  });

  // Observe changes to the main content area
  const mainContent = document.querySelector('main') || document.querySelector('.main-wrapper') || document.body;
  contentObserver.observe(mainContent, {
    childList: true,
    subtree: true
  });

  // Cleanup for HMR
  if (module.hot) {
    module.hot.dispose(() => {
      if (observer) observer.disconnect();
      contentObserver.disconnect();
      closeZoom();
    });
  }
}

export default {};