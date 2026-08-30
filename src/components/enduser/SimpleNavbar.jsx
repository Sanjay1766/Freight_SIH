import React from 'react';
import { Ship, DollarSign, Calendar, AlertCircle, FileText, HelpCircle, RotateCw } from 'lucide-react';

export default function SimpleNavbar({ activeTab, onTabChange, onRefresh }) {
  const navItems = [
    { key: 'arrivals', label: 'Vessel Arrivals', icon: Ship },
    { key: 'pricing', label: 'Pricing Check', icon: DollarSign },
    { key: 'scheduling', label: 'Schedule', icon: Calendar },
    { key: 'alerts', label: 'Alerts', icon: AlertCircle },
    { key: 'reports', label: 'Reports', icon: FileText },
    { key: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top Row: Logo & Refresh */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">🚢 Port Operations</h1>
            <p className="text-sm text-gray-600">Freight Management System</p>
          </div>
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            title="Refresh all data"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
