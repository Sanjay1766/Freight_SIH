import React, { useState } from 'react';
import SimpleNavbar from './components/enduser/SimpleNavbar';
import ArrivalsDashboard from './components/enduser/ArrivalsDashboard';
import PricingStatus from './components/enduser/PricingStatus';
import SchedulingBoard from './components/enduser/SchedulingBoard';
import AlertsPanel from './components/enduser/AlertsPanel';
import QuickReports from './components/enduser/QuickReports';
import HelpSupport from './components/enduser/HelpSupport';

export default function AppEndUser() {
  const [activeTab, setActiveTab] = useState('arrivals');
  const [refreshCount, setRefreshCount] = useState(0);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Navbar for Port Employees */}
      <SimpleNavbar activeTab={activeTab} onTabChange={setActiveTab} onRefresh={handleRefresh} />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Port Operations Center</h1>
          <p className="text-gray-600 mt-1">Welcome back. Here's what's happening at your port today.</p>
        </div>

        {/* Tab Content */}
        {activeTab === 'arrivals' && <ArrivalsDashboard key={refreshCount} />}
        {activeTab === 'pricing' && <PricingStatus key={refreshCount} />}
        {activeTab === 'scheduling' && <SchedulingBoard key={refreshCount} />}
        {activeTab === 'alerts' && <AlertsPanel key={refreshCount} />}
        {activeTab === 'reports' && <QuickReports key={refreshCount} />}
        {activeTab === 'help' && <HelpSupport />}
      </div>
    </div>
  );
}
