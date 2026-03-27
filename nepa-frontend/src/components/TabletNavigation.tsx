import React, { useState, useEffect } from 'react';

interface TabletNavigationProps {
  currentView: 'payment' | 'yield' | 'dashboard' | 'analytics';
  onViewChange: (view: 'payment' | 'yield' | 'dashboard' | 'analytics') => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const TabletNavigation: React.FC<TabletNavigationProps> = ({ 
  currentView, 
  onViewChange,
  user = { name: 'John Doe', email: 'john@example.com' }
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Detect screen size for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 641) {
        setScreenSize('mobile');
      } else if (width <= 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleViewChange = (view: 'payment' | 'yield' | 'dashboard' | 'analytics') => {
    onViewChange(view);
    if (screenSize === 'mobile') {
      setIsMenuOpen(false);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'payment', label: 'Bill Payment', icon: '💡' },
    { id: 'yield', label: 'Yield Generation', icon: '📈' },
    { id: 'analytics', label: 'Analytics', icon: '📉' }
  ];

  // Mobile layout
  if (screenSize === 'mobile') {
    return (
      <>
        {/* Mobile Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-blue-600">NEPA 💡</h1>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors tablet-touch-target"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`w-full h-0.5 bg-gray-600 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-full h-0.5 bg-gray-600 transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-full h-0.5 bg-gray-600 transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {isMenuOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsMenuOpen(false)}>
              <div className="bg-white w-72 h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id as any)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors tablet-touch-button ${
                          currentView === item.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // Tablet layout
  if (screenSize === 'tablet') {
    return (
      <>
        {/* Tablet Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="tablet-nav-horizontal">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">NEPA 💡</h1>
            </div>
            
            {/* Tablet Navigation */}
            <nav className="tablet-nav-items">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors tablet-touch-button ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </div>
                </button>
              ))}
            </nav>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop layout (fallback to original behavior)
  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id as any)}
              className={`px-4 py-3 sm:px-6 sm:py-4 rounded-lg font-medium transition-colors touch-manipulation ${
                currentView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default TabletNavigation;
