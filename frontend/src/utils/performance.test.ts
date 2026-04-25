// Performance testing utilities for pagination

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  interactionResponse: number;
  scrollPerformance: number;
}

export class PaginationPerformanceTester {
  private static instance: PaginationPerformanceTester;
  private metrics: PerformanceMetrics[] = [];

  private constructor() {}

  public static getInstance(): PaginationPerformanceTester {
    if (!PaginationPerformanceTester.instance) {
      PaginationPerformanceTester.instance = new PaginationPerformanceTester();
    }
    return PaginationPerformanceTester.instance;
  }

  /**
   * Test pagination performance with large datasets
   */
  public async testPaginationPerformance(
    itemCount: number,
    pageSize: number,
    iterations: number = 10
  ): Promise<PerformanceMetrics> {
    console.log(`Testing pagination performance: ${itemCount} items, ${pageSize} page size`);
    
    const results: PerformanceMetrics[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const result = await this.runSinglePerformanceTest(itemCount, pageSize);
      results.push(result);
    }

    // Calculate averages
    const avgMetrics: PerformanceMetrics = {
      renderTime: results.reduce((sum, r) => sum + r.renderTime, 0) / results.length,
      memoryUsage: results.reduce((sum, r) => sum + r.memoryUsage, 0) / results.length,
      interactionResponse: results.reduce((sum, r) => sum + r.interactionResponse, 0) / results.length,
      scrollPerformance: results.reduce((sum, r) => sum + r.scrollPerformance, 0) / results.length,
    };

    console.log('Average Performance Metrics:', avgMetrics);
    this.metrics.push(avgMetrics);
    
    return avgMetrics;
  }

  private async runSinglePerformanceTest(
    itemCount: number,
    pageSize: number
  ): Promise<PerformanceMetrics> {
    // Generate mock data
    const mockData = this.generateMockData(itemCount);
    
    // Measure render time
    const renderStart = performance.now();
    const renderedData = this.paginateData(mockData, 1, pageSize);
    const renderEnd = performance.now();
    
    // Measure memory usage (if available)
    const memoryStart = this.getMemoryUsage();
    
    // Simulate interaction (page change)
    const interactionStart = performance.now();
    const nextPageData = this.paginateData(mockData, 2, pageSize);
    const interactionEnd = performance.now();
    
    const memoryEnd = this.getMemoryUsage();
    
    // Simulate scroll performance for infinite scroll
    const scrollStart = performance.now();
    const scrollData = this.simulateInfiniteScroll(mockData, pageSize * 3);
    const scrollEnd = performance.now();

    return {
      renderTime: renderEnd - renderStart,
      memoryUsage: memoryEnd - memoryStart,
      interactionResponse: interactionEnd - interactionStart,
      scrollPerformance: scrollEnd - scrollStart,
    };
  }

  private generateMockData(count: number): any[] {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        id: `item-${i}`,
        name: `Item ${i}`,
        value: Math.random() * 1000,
        category: `Category ${Math.floor(i / 100)}`,
        timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    return data;
  }

  private paginateData(data: any[], page: number, pageSize: number): any[] {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }

  private simulateInfiniteScroll(data: any[], loadedItems: number): any[] {
    return data.slice(0, loadedItems);
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Test accessibility performance
   */
  public async testAccessibilityPerformance(): Promise<void> {
    console.log('Testing accessibility performance...');
    
    const start = performance.now();
    
    // Simulate screen reader announcements
    for (let i = 0; i < 100; i++) {
      this.simulateScreenReaderAnnouncement(`Page ${i} of 100`);
    }
    
    const end = performance.now();
    console.log(`Accessibility announcements took ${end - start}ms`);
  }

  private simulateScreenReaderAnnouncement(message: string): void {
    // Simulate the time it takes to create and remove ARIA live regions
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 0);
  }

  /**
   * Test infinite scroll performance
   */
  public async testInfiniteScrollPerformance(
    totalItems: number,
    batchSize: number
  ): Promise<{ loadTime: number; renderTime: number; memoryGrowth: number }> {
    console.log(`Testing infinite scroll: ${totalItems} items, ${batchSize} batch size`);
    
    const allData = this.generateMockData(totalItems);
    let loadedData: any[] = [];
    const memoryMeasurements: number[] = [];
    
    const totalStart = performance.now();
    
    // Simulate loading batches
    for (let i = 0; i < Math.ceil(totalItems / batchSize); i++) {
      const batchStart = performance.now();
      
      // Load next batch
      const startIndex = i * batchSize;
      const endIndex = Math.min(startIndex + batchSize, totalItems);
      const batch = allData.slice(startIndex, endIndex);
      
      // Simulate rendering
      loadedData = [...loadedData, ...batch];
      
      const batchEnd = performance.now();
      
      // Measure memory after each batch
      memoryMeasurements.push(this.getMemoryUsage());
      
      // Simulate delay between batches
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const totalEnd = performance.now();
    
    const memoryGrowth = memoryMeasurements.length > 1 
      ? memoryMeasurements[memoryMeasurements.length - 1] - memoryMeasurements[0]
      : 0;
    
    return {
      loadTime: totalEnd - totalStart,
      renderTime: totalEnd - totalStart, // Simplified for demo
      memoryGrowth,
    };
  }

  /**
   * Generate performance report
   */
  public generatePerformanceReport(): string {
    if (this.metrics.length === 0) {
      return 'No performance data available';
    }

    const avgRenderTime = this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.length;
    const avgMemoryUsage = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length;
    const avgInteractionResponse = this.metrics.reduce((sum, m) => sum + m.interactionResponse, 0) / this.metrics.length;
    const avgScrollPerformance = this.metrics.reduce((sum, m) => sum + m.scrollPerformance, 0) / this.metrics.length;

    return `
Pagination Performance Report
=============================
Average Render Time: ${avgRenderTime.toFixed(2)}ms
Average Memory Usage: ${(avgMemoryUsage / 1024 / 1024).toFixed(2)}MB
Average Interaction Response: ${avgInteractionResponse.toFixed(2)}ms
Average Scroll Performance: ${avgScrollPerformance.toFixed(2)}ms

Performance Benchmarks:
- Render Time should be < 50ms: ${avgRenderTime < 50 ? '✅ PASS' : '❌ FAIL'}
- Memory Usage should be reasonable: ${avgMemoryUsage < 50 * 1024 * 1024 ? '✅ PASS' : '❌ FAIL'}
- Interaction Response should be < 100ms: ${avgInteractionResponse < 100 ? '✅ PASS' : '❌ FAIL'}
- Scroll Performance should be smooth: ${avgScrollPerformance < 200 ? '✅ PASS' : '❌ FAIL'}
    `.trim();
  }

  /**
   * Clear performance metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Run comprehensive performance test suite
   */
  public async runFullPerformanceTestSuite(): Promise<void> {
    console.log('Starting comprehensive pagination performance test suite...');
    
    // Test different dataset sizes
    const testCases = [
      { itemCount: 100, pageSize: 10 },
      { itemCount: 1000, pageSize: 25 },
      { itemCount: 10000, pageSize: 50 },
      { itemCount: 50000, pageSize: 100 },
    ];

    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.itemCount} items with page size ${testCase.pageSize}`);
      await this.testPaginationPerformance(testCase.itemCount, testCase.pageSize);
    }

    // Test infinite scroll
    console.log('\nTesting infinite scroll performance...');
    const infiniteScrollResult = await this.testInfiniteScrollPerformance(10000, 50);
    console.log('Infinite Scroll Results:', infiniteScrollResult);

    // Test accessibility
    console.log('\nTesting accessibility performance...');
    await this.testAccessibilityPerformance();

    // Generate final report
    console.log('\n' + this.generatePerformanceReport());
  }
}

// Export singleton instance
export const performanceTester = PaginationPerformanceTester.getInstance();

// Utility function to run performance tests in development
export const runPerformanceTests = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Running pagination performance tests...');
    await performanceTester.runFullPerformanceTestSuite();
  }
};
