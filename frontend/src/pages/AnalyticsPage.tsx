import React from 'react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <section aria-labelledby="analytics-heading">
        <h2 id="analytics-heading" className="text-3xl font-semibold text-foreground">Analytics Dashboard</h2>
        <p className="text-muted-foreground text-lg">
          Comprehensive analytics and insights for your utility management.
        </p>
      </section>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Usage Trends</h3>
          <div className="h-64 bg-muted rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Chart visualization would go here</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Cost Analysis</h3>
          <div className="h-64 bg-muted rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Cost breakdown chart would go here</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Average Daily Usage</h3>
          <p className="text-3xl font-bold text-primary">8.2 kWh</p>
          <p className="text-muted-foreground">-12% from last month</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Peak Usage Hour</h3>
          <p className="text-3xl font-bold text-orange-600">7 PM</p>
          <p className="text-muted-foreground">Most active time</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Efficiency Score</h3>
          <p className="text-3xl font-bold text-green-600">85%</p>
          <p className="text-muted-foreground">Good performance</p>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Recommendations</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li>Consider shifting heavy usage to off-peak hours to save costs</li>
          <li>Your usage has been consistent, which is great for budgeting</li>
          <li>Setting up automated payments could help avoid late fees</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsPage;
