import React, { useState } from 'react';
import Tooltip from './Tooltip';

export const TooltipExample: React.FC = () => {
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Tooltip Component Examples</h1>
      
      {/* Basic Hover Tooltip */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Hover Tooltip</h2>
        <div className="flex gap-4 flex-wrap">
          <Tooltip content="This is a simple tooltip">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Hover me
            </button>
          </Tooltip>
          
          <Tooltip content="Tooltip with more detailed information that might be longer">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Long content
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Position Variants */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Position Variants</h2>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <Tooltip content="Top positioned tooltip" position="top">
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 w-full">
              Top
            </button>
          </Tooltip>
          
          <Tooltip content="Bottom positioned tooltip" position="bottom">
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 w-full">
              Bottom
            </button>
          </Tooltip>
          
          <Tooltip content="Left positioned tooltip" position="left">
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 w-full">
              Left
            </button>
          </Tooltip>
          
          <Tooltip content="Right positioned tooltip" position="right">
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 w-full">
              Right
            </button>
          </Tooltip>
          
          <Tooltip content="Center positioned tooltip" position="center">
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 w-full">
              Center
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Trigger Types */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Trigger Types</h2>
        <div className="flex gap-4 flex-wrap">
          <Tooltip content="Hover trigger (default)" trigger="hover">
            <button className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
              Hover
            </button>
          </Tooltip>
          
          <Tooltip content="Focus trigger" trigger="focus">
            <input 
              type="text" 
              placeholder="Focus me" 
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Tooltip>
          
          <Tooltip content="Click trigger" trigger="click">
            <button className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
              Click
            </button>
          </Tooltip>
          
          <Tooltip content="Manual trigger" trigger="manual" open={manualOpen}>
            <button 
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              onClick={() => setManualOpen(!manualOpen)}
            >
              Manual ({manualOpen ? 'Open' : 'Closed'})
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Custom Styling */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Custom Styling</h2>
        <div className="flex gap-4 flex-wrap">
          <Tooltip 
            content="Custom styled tooltip" 
            contentClassName="bg-red-500 text-white border-red-600"
            arrow={false}
          >
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              No Arrow
            </button>
          </Tooltip>
          
          <Tooltip 
            content="Wide tooltip with custom max width" 
            maxWidth={500}
          >
            <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
              Wide
            </button>
          </Tooltip>
          
          <Tooltip 
            content="Disabled tooltip" 
            disabled
          >
            <button className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed" disabled>
              Disabled
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Complex Content */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Complex Content</h2>
        <div className="flex gap-4 flex-wrap">
          <Tooltip 
            content={
              <div className="space-y-2">
                <p className="font-semibold">Rich Content</p>
                <p className="text-sm">This tooltip contains multiple elements</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Tag 1</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Tag 2</span>
                </div>
              </div>
            }
          >
            <button className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600">
              Rich Content
            </button>
          </Tooltip>
          
          <Tooltip 
            content={
              <div className="space-y-2">
                <p className="font-semibold text-red-600">⚠️ Warning</p>
                <p className="text-sm">This action cannot be undone!</p>
                <p className="text-xs opacity-75">Please confirm before proceeding.</p>
              </div>
            }
            contentClassName="border-red-300"
          >
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Warning
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Accessibility Features</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            These tooltips include full accessibility support:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Keyboard navigation (Tab, Enter, Space, Escape)</li>
            <li>Screen reader support with proper ARIA attributes</li>
            <li>Focus management</li>
            <li>High contrast mode support</li>
            <li>Reduced motion support</li>
          </ul>
          
          <div className="mt-4">
            <Tooltip 
              content="Try navigating with keyboard: Tab to focus, Enter/Space to open, Escape to close"
              trigger="focus"
            >
              <input 
                type="text" 
                placeholder="Focus me for keyboard tooltip" 
                className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Form Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Form Field Examples</h2>
        <div className="bg-white p-6 rounded-lg border shadow-sm max-w-md">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <Tooltip 
                content="We'll never share your email with anyone else."
                trigger="focus"
                position="right"
              >
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Tooltip>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Tooltip 
                content={
                  <div>
                    <p className="font-semibold mb-1">Password Requirements:</p>
                    <ul className="text-sm space-y-1">
                      <li>• At least 8 characters</li>
                      <li>• One uppercase letter</li>
                      <li>• One number</li>
                      <li>• One special character</li>
                    </ul>
                  </div>
                }
                trigger="focus"
                position="right"
                maxWidth={300}
              >
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Tooltip>
            </div>
            
            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TooltipExample;
