import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <section aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading" className="text-3xl font-semibold text-foreground">User Dashboard</h2>
        <p className="text-muted-foreground text-lg">
          Manage your utility services and view usage statistics.
        </p>
      </section>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Current Usage</h3>
          <p className="text-3xl font-bold text-primary">245 kWh</p>
          <p className="text-muted-foreground">This month</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Last Payment</h3>
          <p className="text-3xl font-bold text-green-600">$45.20</p>
          <p className="text-muted-foreground">15 days ago</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Next Bill</h3>
          <p className="text-3xl font-bold text-orange-600">$52.80</p>
          <p className="text-muted-foreground">Due in 5 days</p>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Make Payment
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
            View History
          </button>
          <button className="px-4 py-2 bg-outline text-outline-foreground rounded-md hover:bg-outline/90 transition-colors">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
