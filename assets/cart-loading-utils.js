/**
 * Cart Loading Utilities
 * Provides consistent loading states for all cart interactions
 */

class CartLoadingUtils {
  /**
   * Show loading state on a button
   * @param {HTMLElement} button - The button element
   * @param {string} loadingText - Optional loading text to show
   */
  static showLoading(button, loadingText = null) {
    if (!button) return;
    
    const buttonText = button.querySelector('.button__text, span, .btn-text');
    const loadingSpinner = button.querySelector('.loading__spinner');
    
    // Store original text for restoration
    if (buttonText && !button.dataset.originalText) {
      button.dataset.originalText = buttonText.textContent;
    }
    
    // Show loading state
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
    button.classList.add('loading');
    
    if (buttonText) {
      buttonText.classList.add('hidden');
      if (loadingText) {
        buttonText.textContent = loadingText;
        buttonText.classList.remove('hidden');
      }
    }
    
    if (loadingSpinner) {
      loadingSpinner.classList.remove('hidden');
    }
  }
  
  /**
   * Hide loading state on a button
   * @param {HTMLElement} button - The button element
   */
  static hideLoading(button) {
    if (!button) return;
    
    const buttonText = button.querySelector('.button__text, span, .btn-text');
    const loadingSpinner = button.querySelector('.loading__spinner');
    
    // Hide loading state
    button.disabled = false;
    button.removeAttribute('aria-disabled');
    button.classList.remove('loading');
    
    if (buttonText) {
      buttonText.classList.remove('hidden');
      // Restore original text if it was stored
      if (button.dataset.originalText) {
        buttonText.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    }
    
    if (loadingSpinner) {
      loadingSpinner.classList.add('hidden');
    }
  }
  
  /**
   * Add loading state to any cart button with automatic cleanup
   * @param {HTMLElement} button - The button element
   * @param {Function} cartFunction - The cart function to execute
   * @param {string} loadingText - Optional loading text
   */
  static async withLoading(button, cartFunction, loadingText = null) {
    try {
      this.showLoading(button, loadingText);
      return await cartFunction();
    } finally {
      this.hideLoading(button);
    }
  }
  
  /**
   * Find and show loading on common cart button selectors
   * @param {string} loadingText - Optional loading text
   * @returns {HTMLElement} The button element
   */
  static findAndShowLoading(loadingText = null) {
    const selectors = [
      '#addToCartButton',
      '.add-to-cart-button',
      '[data-action="add-to-cart"]',
      '.product-form__submit',
      'button[type="submit"]',
      '.btn-add-to-cart'
    ];
    
    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button && !button.disabled) {
        this.showLoading(button, loadingText);
        return button;
      }
    }
    
    return null;
  }
  
  /**
   * Show loading on all cart buttons in the current context
   * @param {string} loadingText - Optional loading text
   */
  static showLoadingOnAllCartButtons(loadingText = null) {
    const selectors = [
      '#addToCartButton',
      '.add-to-cart-button',
      '[data-action="add-to-cart"]',
      '.product-form__submit',
      'button[type="submit"]',
      '.btn-add-to-cart'
    ];
    
    selectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        if (!button.disabled) {
          this.showLoading(button, loadingText);
        }
      });
    });
  }
  
  /**
   * Hide loading on all cart buttons in the current context
   */
  static hideLoadingOnAllCartButtons() {
    const selectors = [
      '#addToCartButton',
      '.add-to-cart-button',
      '[data-action="add-to-cart"]',
      '.product-form__submit',
      'button[type="submit"]',
      '.btn-add-to-cart'
    ];
    
    selectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        this.hideLoading(button);
      });
    });
  }
}

// Make it available globally
window.CartLoadingUtils = CartLoadingUtils;

// Global event listener for cart form submissions
document.addEventListener('DOMContentLoaded', () => {
  // Listen for form submissions that might be cart-related
  document.addEventListener('submit', (event) => {
    const form = event.target;
    
    // Check if this is a cart-related form
    if (form.action && (
      form.action.includes('/cart/add') || 
      form.action.includes('/cart/update') ||
      form.classList.contains('product-form') ||
      form.getAttribute('data-type') === 'add-to-cart-form'
    )) {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton && !submitButton.classList.contains('loading')) {
        // Add loading state
        if (window.CartLoadingUtils) {
          window.CartLoadingUtils.showLoading(submitButton, 'Adding to cart...');
        }
      }
    }
  });
  
  // Listen for fetch requests to cart endpoints
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    
    // Check if this is a cart request
    if (typeof url === 'string' && (
      url.includes('/cart/add') || 
      url.includes('/cart/update') ||
      url.includes('/cart/change')
    )) {
      // Find and show loading on cart buttons
      if (window.CartLoadingUtils) {
        window.CartLoadingUtils.showLoadingOnAllCartButtons('Adding to cart...');
      }
      
      // Hide loading when request completes
      return originalFetch.apply(this, args).finally(() => {
        if (window.CartLoadingUtils) {
          window.CartLoadingUtils.hideLoadingOnAllCartButtons();
        }
      });
    }
    
    return originalFetch.apply(this, args);
  };
  
  // Add cart validation
  validateCartForAddons();
  
  // Listen for cart updates
  document.addEventListener('cart:updated', validateCartForAddons);
  document.addEventListener('cart:refresh', validateCartForAddons);
});

// Add cart validation for addon-only prevention
function validateCartForAddons() {
  const cartItems = document.querySelectorAll('[data-cart-item]');
  let hasMainProduct = false;
  let hasAddonOnly = false;

  cartItems.forEach(item => {
    const productTags = item.dataset.productTags || '';
    if (productTags.includes('customization_addon')) {
      hasAddonOnly = true;
    } else {
      hasMainProduct = true;
    }
  });

  // If cart has addons but no main products, prevent checkout
  if (hasAddonOnly && !hasMainProduct) {
    const checkoutButton = document.querySelector('[name="checkout"], .cart__checkout-button, .cart__ctas button[type="submit"]');
    if (checkoutButton) {
      checkoutButton.disabled = true;
      checkoutButton.style.opacity = '0.5';
      checkoutButton.style.cursor = 'not-allowed';
      
      // Add warning message
      const warningMsg = document.createElement('div');
      warningMsg.className = 'cart-addon-warning';
      warningMsg.style.cssText = 'color: #d82c0d; background: #fef7f7; border: 1px solid #d82c0d; padding: 10px; margin: 10px 0; border-radius: 4px; font-size: 14px;';
      warningMsg.innerHTML = '⚠️ Customization add-ons cannot be purchased alone. Please add a main product to your cart.';
      
      const cartForm = checkoutButton.closest('form');
      if (cartForm && !cartForm.querySelector('.cart-addon-warning')) {
        cartForm.insertBefore(warningMsg, checkoutButton);
      }
    }
  } else {
    // Re-enable checkout if valid
    const checkoutButton = document.querySelector('[name="checkout"], .cart__checkout-button, .cart__ctas button[type="submit"]');
    if (checkoutButton) {
      checkoutButton.disabled = false;
      checkoutButton.style.opacity = '1';
      checkoutButton.style.cursor = 'pointer';
    }
    
    // Remove warning message
    const warningMsg = document.querySelector('.cart-addon-warning');
    if (warningMsg) {
      warningMsg.remove();
    }
  }
}

// Remove orphan add-ons from cart (robust, smooth)
function removeOrphanAddonsSmooth() {
  if (window.orphanAddonKeys && Array.isArray(window.orphanAddonKeys) && window.orphanAddonKeys.length > 0) {
    let removedCount = 0;
    let promises = window.orphanAddonKeys.map(function(key) {
      return fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 })
      }).then(function(res) {
        removedCount++;
        return res;
      });
    });
    Promise.all(promises).then(function() {
      if (removedCount > 0) {
        // Show a toast/snackbar if available
        if (window.showCartSnackbar) {
          window.showCartSnackbar('Customization add-ons were removed because they must be paired with a main product.');
        }
        // Refresh cart only if on cart page
        if (window.location.pathname.indexOf('/cart') !== -1) {
          window.location.reload();
        } else {
          // If in cart drawer, trigger a cart update event
          document.dispatchEvent(new CustomEvent('cart:refresh'));
        }
      }
    });
  }
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', removeOrphanAddonsSmooth);
} else {
  removeOrphanAddonsSmooth();
}

// Listen for AJAX cart updates (Shopify's default events and custom ones)
['cart:updated', 'cart:refresh', 'cart:change', 'cart:drawer:opened'].forEach(function(evt) {
  document.addEventListener(evt, removeOrphanAddonsSmooth);
});

// Optionally, patch Shopify's AJAX cart update to always trigger our event
(function() {
  var origFetch = window.fetch;
  window.fetch = function() {
    return origFetch.apply(this, arguments).then(function(response) {
      // If this was a cart update, trigger our event
      if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].indexOf('/cart') !== -1) {
        setTimeout(function() {
          document.dispatchEvent(new CustomEvent('cart:updated'));
        }, 100);
      }
      return response;
    });
  };
})(); 