import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
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
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            View User Dashboard
          </Link>
          <Link
            to="/analytics"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            View Analytics Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
