"use client";

import React from 'react';

// Define types for navigation items
export type NavigationItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

interface SidebarProps {
  navigationItems: NavigationItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  navigationItems,
  activeTab,
  setActiveTab,
  className = "",
}) => {
  return (
    <div className={`w-full md:w-64 bg-card rounded-lg shadow-sm border border-border overflow-hidden ${className}`}>
      <nav className="flex flex-col">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center px-4 py-3 text-left transition-colors ${
              activeTab === item.id
                ? "bg-primary/10 text-primary border-l-4 border-primary"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <span className={`mr-3 ${activeTab === item.id ? "text-primary" : "text-muted-foreground"}`}>{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;