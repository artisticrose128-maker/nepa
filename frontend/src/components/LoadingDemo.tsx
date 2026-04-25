import React, { useState } from 'react';
import { LoadingButton } from './LoadingButton';
import { LoadingCard, LoadingGrid } from './LoadingCard';
import { LoadingTable } from './LoadingTable';
import { ProgressBar } from './ProgressBar';
import { Skeleton } from './Skeleton';
import { Loading } from './Loading';
import { useLoadingContext } from '../contexts/LoadingContext';

export const LoadingDemo: React.FC = () => {
  const { setLoading, isLoading } = useLoadingContext();
  const [demoLoading, setDemoLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateAsyncOperation = async (key: string, duration: number) => {
    setLoading(key, true);
    setDemoLoading(true);
    
    // Simulate progress
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, duration / steps));
      setProgress((i / steps) * 100);
    }
    
    setLoading(key, false);
    setDemoLoading(false);
    setProgress(0);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Loading States Demo</h1>
        <p className="text-gray-600 mb-8">
          Comprehensive demonstration of the NEPA platform's loading state system with accessibility features.
        </p>

        {/* Loading Button Demo */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Loading Button</h2>
          <div className="flex flex-wrap gap-4">
            <LoadingButton
              loading={demoLoading}
              onClick={() => simulateAsyncOperation('button-demo', 2000)}
              loadingText="Processing..."
            >
              Normal Button
            </LoadingButton>
            
            <LoadingButton
              loading={demoLoading}
              onClick={() => simulateAsyncOperation('button-demo', 2000)}
              loadingText="Submitting..."
              variant="dots"
            >
              Dots Variant
            </LoadingButton>
            
            <LoadingButton
              loading={demoLoading}
              onClick={() => simulateAsyncOperation('button-demo', 2000)}
              loadingText="Saving..."
              variant="pulse"
              className="bg-green-600 hover:bg-green-700"
            >
              Pulse Variant
            </LoadingButton>
          </div>
        </section>

        {/* Progress Bar Demo */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Progress Bar</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Determinate Progress</label>
              <ProgressBar 
                value={progress} 
                showLabel={true}
                variant="default"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Success Progress</label>
              <ProgressBar 
                value={75} 
                showLabel={true}
                variant="success"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warning Progress</label>
              <ProgressBar 
                value={45} 
                showLabel={true}
                variant="warning"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Indeterminate Progress</label>
              <ProgressBar 
                value={0} 
                indeterminate={true}
                showLabel={true}
                variant="info"
              />
            </div>
          </div>
        </section>

        {/* Skeleton Components Demo */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Skeleton Screens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingCard lines={3} showAvatar={true} showButton={true} />
            <LoadingCard lines={2} titleWidth="80%" />
            <LoadingCard variant="custom" height="120px" />
          </div>
        </section>

        {/* Loading Grid Demo */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Loading Grid</h2>
          <LoadingGrid count={6} columns={3} showAvatar={true} />
        </section>

        {/* Loading Table Demo */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Loading Table</h2>
          <LoadingTable rows={5} columns={4} showHeader={true} />
        </section>

        {/* Basic Loading Components */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Loading Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Spinner</h3>
              <Loading variant="spinner" size="md" label="Loading..." />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Dots</h3>
              <Loading variant="dots" size="lg" label="Processing..." />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Pulse</h3>
              <Loading variant="pulse" size="xl" label="Thinking..." />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Skeleton</h3>
              <Loading variant="skeleton" size="md" label="Loading content..." />
            </div>
          </div>
        </section>

        {/* Skeleton Variants */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Skeleton Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Text Skeleton</h3>
              <Skeleton variant="text" lines={3} />
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Avatar Skeleton</h3>
              <Skeleton variant="avatar" />
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Card Skeleton</h3>
              <Skeleton variant="card" />
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Button Skeleton</h3>
              <Skeleton variant="button" />
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Input Skeleton</h3>
              <Skeleton variant="input" />
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Skeleton</h3>
              <Skeleton variant="custom" width="200px" height="100px" />
            </div>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Accessibility Features</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">✅ WCAG 2.1 AA Compliant</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Proper ARIA labels and roles</li>
              <li>Screen reader announcements</li>
              <li>Keyboard navigation support</li>
              <li>Respects prefers-reduced-motion</li>
              <li>High contrast mode support</li>
              <li>Focus management</li>
            </ul>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Interactive Demo</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-4">
              Click the button below to see the complete loading state system in action:
            </p>
            <LoadingButton
              loading={isLoading('interactive-demo')}
              onClick={() => simulateAsyncOperation('interactive-demo', 3000)}
              loadingText="Simulating operation..."
              className="w-full"
            >
              {isLoading('interactive-demo') ? 'Loading...' : 'Start Interactive Demo'}
            </LoadingButton>
            
            {progress > 0 && (
              <div className="mt-4">
                <ProgressBar 
                  value={progress} 
                  showLabel={true}
                  variant="default"
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoadingDemo;
