// Mobile Testing Setup and Utilities

// Mock device detection for testing
export const mockMobileViewport = (width: number = 375, height: number = 667) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

export const mockDesktopViewport = (width: number = 1024, height: number = 768) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

export const mockMobileUserAgent = () => {
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  });
};

export const mockDesktopUserAgent = () => {
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });
};

export const mockTouchEvents = () => {
  Object.defineProperty(window, 'ontouchstart', {
    writable: true,
    value: jest.fn(),
  });
  Object.defineProperty(navigator, 'maxTouchPoints', {
    writable: true,
    value: 5,
  });
};

export const mockNetworkConditions = (type: 'slow' | 'fast' | 'offline') => {
  switch (type) {
    case 'slow':
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: {
          effectiveType: 'slow-2g',
          saveData: true,
        },
      });
      break;
    case 'fast':
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: {
          effectiveType: '4g',
          saveData: false,
        },
      });
      break;
    case 'offline':
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      break;
  }
};

// Mobile gesture simulation
export const simulateSwipe = (element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down') => {
  const startX = element.getBoundingClientRect().left + 50;
  const startY = element.getBoundingClientRect().top + 50;
  
  let endX = startX;
  let endY = startY;
  
  switch (direction) {
    case 'left':
      endX = startX - 100;
      break;
    case 'right':
      endX = startX + 100;
      break;
    case 'up':
      endY = startY - 100;
      break;
    case 'down':
      endY = startY + 100;
      break;
  }
  
  // Touch start
  const touchStart = new TouchEvent('touchstart', {
    bubbles: true,
    touches: [
      new Touch({
        identifier: 0,
        target: element,
        clientX: startX,
        clientY: startY,
      }),
    ],
  });
  
  // Touch move
  const touchMove = new TouchEvent('touchmove', {
    bubbles: true,
    touches: [
      new Touch({
        identifier: 0,
        target: element,
        clientX: endX,
        clientY: endY,
      }),
    ],
  });
  
  // Touch end
  const touchEnd = new TouchEvent('touchend', {
    bubbles: true,
    changedTouches: [
      new Touch({
        identifier: 0,
        target: element,
        clientX: endX,
        clientY: endY,
      }),
    ],
  });
  
  element.dispatchEvent(touchStart);
  element.dispatchEvent(touchMove);
  element.dispatchEvent(touchEnd);
};

// Accessibility testing helpers
export const checkTouchTargetSize = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const minSize = 44; // Apple HIG minimum touch target size
  return rect.width >= minSize && rect.height >= minSize;
};

export const checkMobileFocusIndicators = (element: HTMLElement): boolean => {
  const styles = window.getComputedStyle(element);
  return styles.outline !== 'none' || styles.boxShadow !== 'none';
};

// Performance testing helpers
export const measureRenderTime = (component: React.ReactElement): Promise<number> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    render(component);
    const endTime = performance.now();
    resolve(endTime - startTime);
  });
};

export const measureScrollPerformance = (element: HTMLElement, duration: number = 1000): Promise<number> => {
  return new Promise((resolve) => {
    let frames = 0;
    const startTime = performance.now();
    
    const scrollAnimation = () => {
      frames++;
      element.scrollTop += 1;
      
      if (performance.now() - startTime < duration) {
        requestAnimationFrame(scrollAnimation);
      } else {
        resolve(frames);
      }
    };
    
    requestAnimationFrame(scrollAnimation);
  });
};

// Mobile-specific test utilities
export const expectMobileLayout = (container: HTMLElement) => {
  // Check for mobile-specific classes and elements
  expect(container.querySelector('.mobile-container')).toBeInTheDocument();
  expect(container.querySelector('.mobile-touch-target')).toBeInTheDocument();
};

export const expectDesktopLayout = (container: HTMLElement) => {
  // Check for desktop-specific elements
  expect(container.querySelector('.lg\\:block')).toBeInTheDocument();
};

export const expectResponsiveGrid = (container: HTMLElement) => {
  // Check for responsive grid classes
  const grid = container.querySelector('.grid');
  expect(grid).toBeInTheDocument();
  expect(grid).toHaveClass('grid-cols-1', 'lg:grid-cols-2', 'xl:grid-cols-3');
};

// Error boundary testing for mobile
export const simulateLowMemory = () => {
  Object.defineProperty(performance, 'memory', {
    writable: true,
    value: {
      usedJSHeapSize: 90 * 1024 * 1024, // 90MB
      totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    },
  });
};

export const simulateSlowNetwork = () => {
  // Mock slow fetch
  const originalFetch = global.fetch;
  global.fetch = jest.fn(() => 
    new Promise(resolve => setTimeout(() => resolve({ ok: true }), 2000))
  );
  
  return () => {
    global.fetch = originalFetch;
  };
};

// Device orientation testing
export const simulateOrientationChange = (orientation: 'portrait' | 'landscape') => {
  if (orientation === 'landscape') {
    mockMobileViewport(667, 375);
  } else {
    mockMobileViewport(375, 667);
  }
  
  // Trigger orientation change event
  window.dispatchEvent(new Event('orientationchange'));
};

// Viewport testing
export const testViewportBreakpoints = (testFn: (breakpoint: string) => void) => {
  const breakpoints = [
    { name: 'mobile', width: 375 },
    { name: 'tablet', width: 768 },
    { name: 'desktop', width: 1024 },
    { name: 'large-desktop', width: 1440 },
  ];
  
  breakpoints.forEach(({ name, width }) => {
    mockMobileViewport(width);
    testFn(name);
  });
};

// Mobile browser testing
export const mockMobileBrowsers = () => {
  const browsers = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
    'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
  ];
  
  return browsers.map(userAgent => {
    Object.defineProperty(navigator, 'userAgent', { value: userAgent });
    return userAgent;
  });
};

// Setup and teardown helpers
export const setupMobileTest = () => {
  mockMobileViewport();
  mockMobileUserAgent();
  mockTouchEvents();
  mockNetworkConditions('fast');
};

export const setupDesktopTest = () => {
  mockDesktopViewport();
  mockDesktopUserAgent();
  mockNetworkConditions('fast');
};

export const cleanupMobileTest = () => {
  // Reset all mocked properties
  Object.defineProperty(window, 'innerWidth', { value: 1024 });
  Object.defineProperty(window, 'innerHeight', { value: 768 });
  Object.defineProperty(navigator, 'userAgent', { value: '' });
  delete (window as any).ontouchstart;
  delete (navigator as any).connection;
  delete (navigator as any).maxTouchPoints;
};
