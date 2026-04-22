import React from 'react';
import { Link, useRouteError } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const error = useRouteError();
  
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-sm text-destructive">
                Error: {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
          
          <div className="flex justify-center space-x-4 text-sm">
            <Link
              to="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/analytics"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Analytics
            </Link>
            <Link
              to="/faq"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
