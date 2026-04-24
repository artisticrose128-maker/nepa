import React from 'react';
import { BrowserRouter, Link, useLocation, useNavigate } from 'react-router-dom';
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

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'FAQ', path: '/faq' },
];

const AppContent: React.FC = () => {
  useGlobalShortcuts();

  React.useEffect(() => {
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
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">N</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">NEPA Platform</p>
              <h1 className="text-2xl font-bold text-foreground">Utility management made accessible</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <Navigation />

      <main id="main-content" role={landmarkRoles.main} className="container mx-auto px-4 py-8" tabIndex={-1}>
        <BreadcrumbNavigation />
        <AppRoutes />
      </main>

      <footer role={landmarkRoles.contentinfo} className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground">&copy; 2024 NEPA Platform. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="FAQ page">FAQ</Link>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Privacy policy">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Terms of service">Terms</a>
          </div>
        </div>
      </footer>

      <KeyboardShortcutHelp className="fixed bottom-4 right-4 z-40" />
    </div>
  );
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav role={landmarkRoles.navigation} aria-label="Main navigation" className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <ul className="flex flex-wrap gap-4" role="menubar" aria-label="Primary navigation">
          {navItems.map((item) => (
            <li key={item.path} role="none">
              <Link
                to={item.path}
                role="menuitem"
                className={`text-sm font-medium transition-colors ${isActive(item.path) ? 'text-primary' : 'text-muted-foreground'} hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="md:hidden">
          <label htmlFor="mobile-navigation" className="sr-only">Select page</label>
          <select
            id="mobile-navigation"
            aria-label="Mobile navigation"
            value={location.pathname}
            onChange={(event) => navigate(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {navItems.map((item) => (
              <option key={item.path} value={item.path}>{item.label}</option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => (
  <KeyboardShortcutProvider>
    <GlobalStateProvider>
      <ThemeProvider>
        <AuthProvider>
          <PaymentProvider>
            <NotificationProvider>
              <BrowserRouter>
                <TokenExpiryHandler />
                <AppContent />
              </BrowserRouter>
            </NotificationProvider>
          </PaymentProvider>
        </AuthProvider>
      </ThemeProvider>
    </GlobalStateProvider>
  </KeyboardShortcutProvider>
);

export default App;
