import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { KeyboardShortcutProvider } from './contexts/KeyboardShortcutContext';
import { AuthProvider } from './contexts/AuthContext';
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
};

const App: React.FC = () => {
  return (
    <KeyboardShortcutProvider>
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
