import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { KeyboardShortcutProvider } from './contexts/KeyboardShortcutContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeToggle } from './components/ThemeToggle';
import { KeyboardShortcutHelp } from './components/KeyboardShortcutHelp';
import { TokenExpiryHandler } from './components/TokenExpiryHandler';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { createSkipLink, landmarkRoles } from './utils/accessibility';
import './index.css';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'analytics' | 'user-dashboard'>('home');

  useGlobalShortcuts();

  React.useEffect(() => {
    // Add skip link
    const skipLink = createSkipLink('main-content');
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);

  const renderNavigation = () => (
    <nav role={landmarkRoles.navigation} aria-label="Main navigation" className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between py-3">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-foreground">NEPA Platform</h1>
            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => setCurrentView('home')}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  currentView === 'home' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentView('user-dashboard')}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  currentView === 'user-dashboard' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                User Dashboard
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  currentView === 'analytics' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile navigation dropdown */}
            <div className="md:hidden">
              <select
                value={currentView}
                onChange={(e) => setCurrentView(e.target.value as any)}
                className="px-3 py-1 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="home">Home</option>
                <option value="user-dashboard">User Dashboard</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'analytics':
        return (
          <div className="space-y-8">
            <section aria-labelledby="analytics-heading">
              <h2 id="analytics-heading" className="text-3xl font-semibold text-foreground">Analytics Dashboard</h2>
              <p className="text-muted-foreground text-lg">
                Comprehensive analytics and insights for your utility management.
              </p>
            </section>
          </div>
        );
      case 'user-dashboard':
        return (
          <div className="space-y-8">
            <section aria-labelledby="dashboard-heading">
              <h2 id="dashboard-heading" className="text-3xl font-semibold text-foreground">User Dashboard</h2>
              <p className="text-muted-foreground text-lg">
                Manage your utility services and view usage statistics.
              </p>
            </section>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <section aria-labelledby="welcome-heading">
              <h2 id="welcome-heading" className="text-3xl font-semibold text-foreground">Welcome to NEPA</h2>
              <p className="text-muted-foreground text-lg">
                Modern utility management platform with advanced analytics and payment processing.
              </p>
            </section>
            
            <section aria-labelledby="features-heading">
              <h2 id="features-heading" className="sr-only">Platform Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-6">
                <article className="bg-card border border-border rounded-lg p-6 shadow focus-within:ring-2 focus-within:ring-ring">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Payment Processing</h3>
                  <p className="text-muted-foreground">Secure and efficient payment processing with multiple payment options.</p>
                </article>
                
                <article className="bg-card border border-border rounded-lg p-6 shadow focus-within:ring-2 focus-within:ring-ring">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Usage Analytics</h3>
                  <p className="text-muted-foreground">Detailed insights into your utility consumption patterns and trends.</p>
                </article>
                
                <article className="bg-card border border-border rounded-lg p-6 shadow focus-within:ring-2 focus-within:ring-ring">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Smart Monitoring</h3>
                  <p className="text-muted-foreground">Real-time monitoring and alerts for your utility services.</p>
                </article>
              </div>
            </section>
            
            <section aria-labelledby="cta-heading">
              <h2 id="cta-heading" className="text-2xl font-semibold text-foreground mb-4">Get Started</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setCurrentView('user-dashboard')}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  View User Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  View Analytics Dashboard
                </button>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header role={landmarkRoles.banner} className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">NEPA Platform</h1>
          </div>
          <div className="flex items-center gap-4">
            <KeyboardShortcutHelp />
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {renderNavigation()}
      
      <main id="main-content" role={landmarkRoles.main} className="container mx-auto px-4 py-8" tabIndex={-1}>
        {renderContent()}
      </main>
      
      <footer role={landmarkRoles.contentinfo} className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-muted-foreground text-center">
            2029 NEPA Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <KeyboardShortcutProvider>
      <ThemeProvider>
        <AuthProvider>
          <TokenExpiryHandler />
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </KeyboardShortcutProvider>
  );
};

export default App;
