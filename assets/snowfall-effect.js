/**
 * Premium Snowfall Effect for Qawach.com
 * Auto-activates: December 1 - January 31
 * Features: Date-based activation, responsive, performance-optimized
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    desktop: {
      count: 25,  // Reduced from 40
      sizes: ['small', 'medium', 'large'],
      speeds: ['slow', 'normal', 'fast']
    },
    mobile: {
      count: 10,  // Reduced from 15
      sizes: ['small', 'medium'],
      speeds: ['normal']
    }
  };

  /**
   * Check if current date is within snowfall period (Dec 1 - Jan 31)
   */
  function isSnowfallSeason() {
    const now = new Date();
    const month = now.getMonth(); // 0-11 (0 = January, 11 = December)
    const year = now.getFullYear();
    
    // December (month 11) or January (month 0)
    if (month === 11 || month === 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if device is mobile
   */
  function isMobile() {
    return window.innerWidth < 750;
  }

  /**
   * Create snowflake element
   */
  function createSnowflake(index, config) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = '❄';
    snowflake.setAttribute('aria-hidden', 'true');
    
    // Random size
    const size = config.sizes[Math.floor(Math.random() * config.sizes.length)];
    snowflake.classList.add(size);
    
    // Random speed (desktop only)
    if (!isMobile() && config.speeds.length > 1) {
      const speed = config.speeds[Math.floor(Math.random() * config.speeds.length)];
      if (speed !== 'normal') {
        snowflake.classList.add(speed);
      }
    }
    
    // Random horizontal position
    snowflake.style.left = Math.random() * 100 + '%';
    
    // Random animation delay for staggered effect (0-20s to prevent top accumulation)
    snowflake.style.animationDelay = Math.random() * 20 + 's';
    
    return snowflake;
  }

  /**
   * Initialize snowfall effect
   */
  function initSnowfall() {
    // Check if it's snowfall season
    if (!isSnowfallSeason()) {
      console.log('Snowfall effect: Not in season (Dec 1 - Jan 31)');
      return;
    }

    // Check if container already exists
    if (document.getElementById('snowfall-container')) {
      return;
    }

    // Determine configuration based on device
    const config = isMobile() ? CONFIG.mobile : CONFIG.desktop;
    
    // Create container
    const container = document.createElement('div');
    container.id = 'snowfall-container';
    
    // Create snowflakes
    for (let i = 0; i < config.count; i++) {
      const snowflake = createSnowflake(i, config);
      container.appendChild(snowflake);
    }
    
    // Add to page
    document.body.appendChild(container);
    
    console.log(`Snowfall effect activated: ${config.count} flakes (${isMobile() ? 'mobile' : 'desktop'})`);
  }

  /**
   * Clean up snowfall effect
   */
  function removeSnowfall() {
    const container = document.getElementById('snowfall-container');
    if (container) {
      container.remove();
      console.log('Snowfall effect removed');
    }
  }

  /**
   * Handle visibility change (pause when tab not visible for performance)
   */
  function handleVisibilityChange() {
    const container = document.getElementById('snowfall-container');
    if (!container) return;
    
    if (document.hidden) {
      container.style.animationPlayState = 'paused';
    } else {
      container.style.animationPlayState = 'running';
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSnowfall);
  } else {
    initSnowfall();
  }

  // Pause animations when tab not visible (performance)
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Expose on window for manual control if needed
  window.QawachSnowfall = {
    init: initSnowfall,
    remove: removeSnowfall,
    isActive: () => !!document.getElementById('snowfall-container')
  };

})();
