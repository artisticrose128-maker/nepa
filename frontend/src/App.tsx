import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { KeyboardShortcutProvider } from './contexts/KeyboardShortcutContext';
import { AuthProvider } from './contexts/AuthContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GlobalStateProvider } from './contexts/GlobalStateContext';
import { ThemeToggle } from './components/ThemeToggle';
import { KeyboardShortcutHelp } from './components/KeyboardShortcutHelp';
import { TokenExpiryHandler } from './components/TokenExpiryHandler';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { createSkipLink, landmarkRoles } from './utils/accessibility';
import { BreadcrumbNavigation } from './components/BreadcrumbNavigation';
import AppRoutes from './routes/AppRoutes';
import './index.css';
import { Link, useLocation } from 'react-router-dom';

const AppContent: React.FC = () => {
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
          <ThemeToggle />
        </div>
      </header>

      <Navigation />

      <main id="main-content" role={landmarkRoles.main} className="container mx-auto px-4 py-8" tabIndex={-1}>
        <BreadcrumbNavigation />
        <AppRoutes />
      </main>

      <footer role={landmarkRoles.contentinfo} className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-muted-foreground text-center">
            &copy; 2024 NEPA Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav role={landmarkRoles.navigation} aria-label="Main navigation" className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between py-3">
          <div className="flex items-center space-x-8">
            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => setCurrentView('home')}
                className={`text-sm font-medium transition-colors hover:text-primary ${currentView === 'home' ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentView('user-dashboard')}
                className={`text-sm font-medium transition-colors hover:text-primary ${currentView === 'user-dashboard' ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                User Dashboard
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className={`text-sm font-medium transition-colors hover:text-primary ${currentView === 'analytics' ? 'text-primary' : 'text-muted-foreground'
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/analytics"
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/analytics') ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                Analytics
              </Link>
              <Link
                to="/faq"
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/faq') ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                FAQ
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile navigation dropdown */}
            <div className="md:hidden">
              <select
                value={location.pathname}
                onChange={(e) => window.location.href = e.target.value}
                className="px-3 py-1 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="/">Home</option>
                <option value="/dashboard">Dashboard</option>
                <option value="/analytics">Analytics</option>
                <option value="/faq">FAQ</option>
              </select>
            </div>
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
        </main>

        <footer role={landmarkRoles.contentinfo} className="border-t border-border bg-card mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-muted-foreground">
                  &copy; 2024 NEPA Platform. All rights reserved.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
              </div>
            </div>
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
      <GlobalStateProvider>
        <ThemeProvider>
          <AuthProvider>
            <PaymentProvider>
              <NotificationProvider>
                <TokenExpiryHandler />
                <AppContent />
              </NotificationProvider>
            </PaymentProvider>
          </AuthProvider>
        </ThemeProvider>
      </GlobalStateProvider>
      <ThemeProvider>
        <AuthProvider>
          <TokenExpiryHandler />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </KeyboardShortcutProvider>
  );
};

export default App;
