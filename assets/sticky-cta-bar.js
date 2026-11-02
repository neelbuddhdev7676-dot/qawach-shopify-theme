/**
 * Sticky CTA Bar - Product Pages
 * Handles desktop sticky bar (scroll-triggered) and mobile bottom bar (always visible)
 */

document.addEventListener('DOMContentLoaded', function() {
  // Only run on product pages
  if (!document.querySelector('.product')) return;

  const productInfo = document.querySelector('#MainProduct-template--99999999999999999__main, [id^="MainProduct-"]');
  if (!productInfo) return;

  const product = {
    title: document.querySelector('.product__title h1, .product__title h2')?.textContent?.trim() || 'Product',
    price: document.querySelector('.price')?.cloneNode(true),
    image: document.querySelector('.product__media img')?.src || '',
    available: !document.querySelector('.product-form__submit')?.disabled,
    productId: productInfo.dataset.productId
  };

  // Skip if Custom Order page
  if (product.title.includes('Custom Order')) return;

  // Create Desktop Sticky Bar
  createDesktopStickyBar(product);
  
  // Create Mobile Bottom Bar
  createMobileBottomBar(product);
  
  // Handle scroll behavior for desktop and mobile
  handleScrollBehavior();
  handleMobileScrollBehavior();
});

/**
 * Create Desktop Sticky Bar
 */
function createDesktopStickyBar(product) {
  const stickyBar = document.createElement('div');
  stickyBar.className = 'sticky-cta-bar';
  stickyBar.setAttribute('role', 'complementary');
  stickyBar.setAttribute('aria-label', 'Product quick actions');
  
  // Get price HTML
  const priceHTML = getPriceHTML(product.price);
  
  stickyBar.innerHTML = `
    <div class="sticky-cta-bar__container">
      <div class="sticky-cta-bar__product">
        <img src="${product.image}" alt="${product.title}" class="sticky-cta-bar__image" loading="lazy">
        <div class="sticky-cta-bar__details">
          <h3 class="sticky-cta-bar__title">${product.title}</h3>
          <div class="sticky-cta-bar__price">${priceHTML}</div>
        </div>
      </div>
      <div class="sticky-cta-bar__actions">
        <button 
          class="sticky-cta-bar__button sticky-cta-bar__button--customize" 
          id="stickyCTACustomize"
          aria-label="Customize product"
        >
          Customize
        </button>
        <button 
          class="sticky-cta-bar__button sticky-cta-bar__button--add-to-cart" 
          id="stickyCTAAddToCart"
          ${!product.available ? 'disabled' : ''}
          aria-label="Add to cart"
        >
          ${product.available ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(stickyBar);
  
  // Add event listeners
  setupDesktopEventListeners(stickyBar);
}

/**
 * Create Mobile Bottom Bar
 */
function createMobileBottomBar(product) {
  const mobileBar = document.createElement('div');
  mobileBar.className = 'mobile-cta-bar';
  mobileBar.setAttribute('role', 'complementary');
  mobileBar.setAttribute('aria-label', 'Product actions');
  
  const priceHTML = getPriceHTML(product.price);
  
  mobileBar.innerHTML = `
    <div class="mobile-cta-bar__container">
      <div class="mobile-cta-bar__price-wrapper">
        <div class="mobile-cta-bar__price">${priceHTML}</div>
      </div>
      <div class="mobile-cta-bar__buttons">
        <button 
          class="mobile-cta-bar__button mobile-cta-bar__button--customize" 
          id="mobileCTACustomize"
          aria-label="Customize"
        >
          Customize
        </button>
        <button 
          class="mobile-cta-bar__button mobile-cta-bar__button--add-to-cart" 
          id="mobileCTAAddToCart"
          ${!product.available ? 'disabled' : ''}
          aria-label="Add to cart"
        >
          ${product.available ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(mobileBar);
  
  // Add event listeners
  setupMobileEventListeners(mobileBar);
}

/**
 * Setup Desktop Event Listeners
 */
function setupDesktopEventListeners(stickyBar) {
  const customizeBtn = stickyBar.querySelector('#stickyCTACustomize');
  const addToCartBtn = stickyBar.querySelector('#stickyCTAAddToCart');
  
  // Customize button - open customization modal
  customizeBtn?.addEventListener('click', function() {
    const openModalBtn = document.getElementById('openModal');
    if (openModalBtn) {
      openModalBtn.click();
    }
  });
  
  // Add to Cart button - trigger the main add to cart
  addToCartBtn?.addEventListener('click', function() {
    const pageSaveBtn = document.getElementById('pageSaveCustomizations');
    const mainAddToCartBtn = document.querySelector('.product-form__submit');
    
    if (pageSaveBtn && pageSaveBtn.style.display !== 'none') {
      pageSaveBtn.click();
    } else if (mainAddToCartBtn) {
      mainAddToCartBtn.click();
    }
  });
}

/**
 * Setup Mobile Event Listeners
 */
function setupMobileEventListeners(mobileBar) {
  const customizeBtn = mobileBar.querySelector('#mobileCTACustomize');
  const addToCartBtn = mobileBar.querySelector('#mobileCTAAddToCart');
  
  // Customize button
  customizeBtn?.addEventListener('click', function() {
    const openModalBtn = document.getElementById('openModal');
    if (openModalBtn) {
      openModalBtn.click();
    }
  });
  
  // Add to Cart button
  addToCartBtn?.addEventListener('click', function() {
    const pageSaveBtn = document.getElementById('pageSaveCustomizations');
    const mainAddToCartBtn = document.querySelector('.product-form__submit');
    
    if (pageSaveBtn && pageSaveBtn.style.display !== 'none') {
      pageSaveBtn.click();
    } else if (mainAddToCartBtn) {
      mainAddToCartBtn.click();
    }
  });
}

/**
 * Handle Scroll Behavior for Desktop Sticky Bar
 */
function handleScrollBehavior() {
  const stickyBar = document.querySelector('.sticky-cta-bar');
  if (!stickyBar) {
    console.warn('Sticky bar not found');
    return;
  }
  
  console.log('Sticky bar scroll handler initialized');
  
  let ticking = false;
  
  function checkScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Check if footer is half visible
    const footer = document.querySelector('footer');
    let footerHalfVisible = false;
    
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const footerHeight = footerRect.height;
      
      // Calculate how much of footer is visible
      const visibleFooterHeight = Math.max(0, windowHeight - footerRect.top);
      
      // Footer is half visible if at least 50% of its height is in viewport
      footerHalfVisible = visibleFooterHeight >= (footerHeight * 0.5);
      
      console.log('Footer visibility:', visibleFooterHeight, 'of', footerHeight, 'Half visible:', footerHalfVisible);
    }
    
    // Show sticky bar after scrolling 50px, hide when footer is half visible
    if (scrollTop > 50 && !footerHalfVisible) {
      if (!stickyBar.classList.contains('visible')) {
        stickyBar.classList.add('visible');
        console.log('Sticky bar showing - scrolled 50px');
      }
    } else {
      if (stickyBar.classList.contains('visible')) {
        stickyBar.classList.remove('visible');
        if (footerHalfVisible) {
          console.log('Sticky bar hidden - footer 50% visible');
        } else {
          console.log('Sticky bar hidden - back to top');
        }
      }
    }
    
    ticking = false;
  }
  
  // Throttled scroll handler
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(checkScroll);
      ticking = true;
    }
  }, { passive: true });
  
  // Initial check
  checkScroll();
}

/**
 * Handle Scroll Behavior for Mobile Sticky Bar
 */
function handleMobileScrollBehavior() {
  const mobileBar = document.querySelector('.mobile-cta-bar');
  if (!mobileBar) {
    console.warn('Mobile bar not found');
    return;
  }
  
  console.log('Mobile bar scroll handler initialized');
  
  let ticking = false;
  
  function checkMobileScroll() {
    // Check if footer is half visible
    const footer = document.querySelector('footer');
    let footerHalfVisible = false;
    
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const footerHeight = footerRect.height;
      
      // Calculate how much of footer is visible
      const visibleFooterHeight = Math.max(0, windowHeight - footerRect.top);
      
      // Footer is half visible if at least 50% of its height is in viewport
      footerHalfVisible = visibleFooterHeight >= (footerHeight * 0.5);
    }
    
    // Hide mobile bar when footer is half visible
    if (footerHalfVisible) {
      if (!mobileBar.classList.contains('hidden-for-footer')) {
        mobileBar.classList.add('hidden-for-footer');
        console.log('Mobile bar hidden - footer 50% visible');
      }
    } else {
      if (mobileBar.classList.contains('hidden-for-footer')) {
        mobileBar.classList.remove('hidden-for-footer');
        console.log('Mobile bar visible - footer not in view');
      }
    }
    
    ticking = false;
  }
  
  // Throttled scroll handler
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(checkMobileScroll);
      ticking = true;
    }
  }, { passive: true });
  
  // Initial check
  checkMobileScroll();
}

/**
 * Extract and format price HTML
 */
function getPriceHTML(priceElement) {
  if (!priceElement) return '';
  
  const salePrice = priceElement.querySelector('.price-item--sale');
  // Strikethrough price is in <s> tag
  const regularPrice = priceElement.querySelector('s.price-item--regular');
  
  console.log('Price extraction:', {
    hasSalePrice: !!salePrice,
    hasRegularPrice: !!regularPrice,
    salePriceText: salePrice?.textContent,
    regularPriceText: regularPrice?.textContent
  });
  
  let html = '';
  
  // Build HTML with proper strikethrough styling
  if (salePrice && regularPrice) {
    html = `
      <s class="price-item price-item--regular">${regularPrice.textContent}</s>
      <span class="price-item price-item--sale">${salePrice.textContent}</span>
    `;
  } else if (salePrice) {
    // No strikethrough, just sale price
    html = `<span class="price-item price-item--sale">${salePrice.textContent}</span>`;
  } else {
    // Fallback to entire price content
    html = priceElement.textContent;
  }
  
  return html;
}

/**
 * Sync sticky bar prices when main price changes (customizations, variant changes, etc.)
 */
function setupPriceSync() {
  const mainPriceContainer = document.querySelector('.product__price .price, .price');
  if (!mainPriceContainer) {
    console.warn('Main price container not found for sync');
    return;
  }

  // Create a MutationObserver to watch for price changes
  const priceObserver = new MutationObserver(function(mutations) {
    // Price has changed, update sticky bars
    updateStickyBarPrices();
  });

  // Observe changes to the price container
  priceObserver.observe(mainPriceContainer, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true
  });

  console.log('Price sync initialized - watching for price changes');
}

/**
 * Update prices in both sticky bars
 */
function updateStickyBarPrices() {
  const newPrice = document.querySelector('.product__price .price, .price');
  if (!newPrice) return;

  const priceHTML = getPriceHTML(newPrice.cloneNode(true));

  // Update desktop sticky bar
  const desktopPrice = document.querySelector('.sticky-cta-bar__price');
  if (desktopPrice) {
    desktopPrice.innerHTML = priceHTML;
    console.log('Desktop sticky bar price updated');
  }

  // Update mobile sticky bar
  const mobilePrice = document.querySelector('.mobile-cta-bar__price');
  if (mobilePrice) {
    mobilePrice.innerHTML = priceHTML;
    console.log('Mobile sticky bar price updated');
  }
}

// Expose function globally so customization-modal.js can trigger updates
window.updateStickyBarPrices = updateStickyBarPrices;

// Initialize price sync after bars are created
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for sticky bars to be created
  setTimeout(setupPriceSync, 500);
});

/**
 * Update sticky bars when variant changes (legacy support)
 */
document.addEventListener('variant:change', function(event) {
  updateStickyBarPrices();
  
  // Also update availability
  const newAvailability = !document.querySelector('.product-form__submit')?.disabled;
  
  const desktopBtn = document.querySelector('#stickyCTAAddToCart');
  if (desktopBtn) {
    desktopBtn.disabled = !newAvailability;
    desktopBtn.textContent = newAvailability ? 'Add to Cart' : 'Sold Out';
  }
  
  const mobileBtn = document.querySelector('#mobileCTAAddToCart');
  if (mobileBtn) {
    mobileBtn.disabled = !newAvailability;
    mobileBtn.textContent = newAvailability ? 'Add to Cart' : 'Sold Out';
  }
});
