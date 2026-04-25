// Mobile Performance Optimization Utilities

// Detect if device is mobile
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// Detect if device is touch-enabled
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Optimize images for mobile
export const optimizeImage = (src: string, options?: {
  width?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}): string => {
  if (!isMobile()) return src;
  
  const { width = 800, quality = 80, format = 'webp' } = options || {};
  
  // This is a simplified version - in production, you'd use an image CDN
  return `${src}?w=${width}&q=${quality}&f=${format}`;
};

// Lazy load images
export const lazyLoadImages = (): void => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// Optimize animations for mobile
export const optimizeAnimations = (): void => {
  if (isMobile()) {
    // Reduce motion for better performance
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
    
    // Use transform instead of position changes
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        * {
          animation-duration: 0.2s !important;
          transition-duration: 0.2s !important;
        }
        
        .mobile-optimized {
          will-change: transform;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Debounce scroll events for better performance
export const debounceScroll = (callback: Function, delay: number = 100): void => {
  let timeoutId: number;
  let lastScrollTime = 0;
  
  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastScrollTime > delay) {
      callback();
      lastScrollTime = now;
    } else {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback();
        lastScrollTime = Date.now();
      }, delay);
    }
  }, { passive: true });
};

// Optimize touch events
export const optimizeTouchEvents = (): void => {
  if (isTouchDevice()) {
    // Add touch-action CSS to prevent unnecessary scroll delays
    const style = document.createElement('style');
    style.textContent = `
      .mobile-touch-target {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        -webkit-user-select: none;
      }
      
      .mobile-scrollable {
        touch-action: pan-y;
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);
  }
};

// Monitor and optimize memory usage
export const monitorMemoryUsage = (): void => {
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize / 1048576; // Convert to MB
      const totalMemory = memory.totalJSHeapSize / 1048576;
      
      if (usedMemory > totalMemory * 0.8) {
        console.warn('High memory usage detected:', {
          used: `${usedMemory.toFixed(2)} MB`,
          total: `${totalMemory.toFixed(2)} MB`
        });
        
        // Trigger garbage collection if available
        if ((window as any).gc) {
          (window as any).gc();
        }
      }
    }, 30000); // Check every 30 seconds
  }
};

// Preload critical resources for mobile
export const preloadCriticalResources = (): void => {
  if (isMobile()) {
    // Preload critical CSS
    const criticalCSS = new Link();
    criticalCSS.rel = 'preload';
    criticalCSS.href = '/styles/critical.css';
    criticalCSS.as = 'style';
    document.head.appendChild(criticalCSS);
    
    // Preload critical fonts
    const criticalFont = new Link();
    criticalFont.rel = 'preload';
    criticalFont.href = '/fonts/main.woff2';
    criticalFont.as = 'font';
    criticalFont.type = 'font/woff2';
    criticalFont.crossOrigin = 'anonymous';
    document.head.appendChild(criticalFont);
  }
};

// Optimize network requests for mobile
export const optimizeNetworkRequests = (): void => {
  if (isMobile() && 'serviceWorker' in navigator) {
    // Register service worker for caching
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('Service Worker registration failed:', err);
    });
  }
};

// Implement virtual scrolling for large lists
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private totalItems: number;
  private visibleItems: number;
  private scrollTop: number = 0;
  private renderItem: (index: number) => HTMLElement;
  
  constructor(options: {
    container: HTMLElement;
    itemHeight: number;
    totalItems: number;
    renderItem: (index: number) => HTMLElement;
  }) {
    this.container = options.container;
    this.itemHeight = options.itemHeight;
    this.totalItems = options.totalItems;
    this.visibleItems = Math.ceil(this.container.clientHeight / this.itemHeight) + 2;
    this.renderItem = options.renderItem;
    
    this.setupScrollListener();
    this.render();
  }
  
  private setupScrollListener(): void {
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop;
      this.render();
    }, { passive: true });
  }
  
  private render(): void {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleItems, this.totalItems);
    
    // Clear container
    this.container.innerHTML = '';
    
    // Create spacer for items above viewport
    const topSpacer = document.createElement('div');
    topSpacer.style.height = `${startIndex * this.itemHeight}px`;
    this.container.appendChild(topSpacer);
    
    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.renderItem(i);
      item.style.height = `${this.itemHeight}px`;
      this.container.appendChild(item);
    }
    
    // Create spacer for items below viewport
    const bottomSpacer = document.createElement('div');
    bottomSpacer.style.height = `${(this.totalItems - endIndex) * this.itemHeight}px`;
    this.container.appendChild(bottomSpacer);
  }
  
  updateTotalItems(totalItems: number): void {
    this.totalItems = totalItems;
    this.render();
  }
}

// Touch gesture utilities
export class TouchGestures {
  private element: HTMLElement;
  private startX: number = 0;
  private startY: number = 0;
  private endX: number = 0;
  private endY: number = 0;
  private onSwipeLeft?: () => void;
  private onSwipeRight?: () => void;
  private onSwipeUp?: () => void;
  private onSwipeDown?: () => void;
  
  constructor(element: HTMLElement, options: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
  }) {
    this.element = element;
    this.onSwipeLeft = options.onSwipeLeft;
    this.onSwipeRight = options.onSwipeRight;
    this.onSwipeUp = options.onSwipeUp;
    this.onSwipeDown = options.onSwipeDown;
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    this.element.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;
    }, { passive: true });
    
    this.element.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      this.endX = touch.clientX;
      this.endY = touch.clientY;
      this.handleSwipe();
    }, { passive: true });
  }
  
  private handleSwipe(): void {
    const deltaX = this.endX - this.startX;
    const deltaY = this.endY - this.startY;
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          this.onSwipeRight?.();
        } else {
          this.onSwipeLeft?.();
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          this.onSwipeDown?.();
        } else {
          this.onSwipeUp?.();
        }
      }
    }
  }
}

// Initialize all mobile optimizations
export const initializeMobileOptimizations = (): void => {
  if (isMobile()) {
    optimizeAnimations();
    optimizeTouchEvents();
    preloadCriticalResources();
    optimizeNetworkRequests();
    monitorMemoryUsage();
    
    // Initialize lazy loading after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', lazyLoadImages);
    } else {
      lazyLoadImages();
    }
  }
};

// Export performance monitoring utilities
export const performanceMetrics = {
  // Measure page load time
  measurePageLoadTime: (): number => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation.loadEventEnd - navigation.fetchStart;
  },
  
  // Measure first contentful paint
  measureFirstContentfulPaint: (): number => {
    const paint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint');
    return paint ? paint.startTime : 0;
  },
  
  // Measure largest contentful paint
  measureLargestContentfulPaint: async (): Promise<number> => {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } else {
        resolve(0);
      }
    });
  },
  
  // Log performance metrics
  logMetrics: (): void => {
    console.log('Mobile Performance Metrics:', {
      pageLoadTime: `${this.measurePageLoadTime()}ms`,
      firstContentfulPaint: `${this.measureFirstContentfulPaint()}ms`,
      isMobile: isMobile(),
      isTouchDevice: isTouchDevice(),
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }
};
