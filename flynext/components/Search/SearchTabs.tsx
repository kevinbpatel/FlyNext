'use client';

import { ReactNode } from 'react';

interface SearchTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children?: ReactNode;
}

export const SearchTabs = ({ activeTab, setActiveTab, children }: SearchTabsProps) => {
  return (
    <div className="bg-gray-50 rounded-lg shadow-md">
      {/* Tabs with rounded corners */}
      <div className="inline-flex">
        <div 
          onClick={() => setActiveTab('flights')} 
          className={`flex items-center px-6 py-3 cursor-pointer rounded-tl-lg rounded-tr-lg ${
            activeTab === 'flights' ? 'bg-indigo-600 text-white' : 'bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Flights
        </div>
        <div 
          onClick={() => setActiveTab('hotels')} 
          className={`flex items-center px-6 py-3 cursor-pointer rounded-tl-lg rounded-tr-lg ml-1 ${
            activeTab === 'hotels' ? 'bg-indigo-600 text-white' : 'bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Hotels
        </div>
      </div>
      {/* Content area */}
      <div className="bg-gray-100 p-4 rounded-lg rounded-tl-none">
        {children}
      </div>
    </div>
  );
};