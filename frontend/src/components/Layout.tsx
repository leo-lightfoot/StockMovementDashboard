import React, { useState } from 'react';
import { ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onRefresh }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (onRefresh) {
      setIsUpdating(true);
      try {
        await fetch('http://localhost:8000/api/v1/stocks/populate-stocks');
        onRefresh();
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Stock Market Dashboard</h1>
            </div>
            {onRefresh && (
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className={`inline-flex items-center px-4 py-2 my-auto border border-transparent text-sm font-medium rounded-md text-white ${
                  isUpdating 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                {isUpdating ? 'Updating...' : 'Update Data'}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-sm mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Data updates once per day • Click "Update Data" to refresh manually
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 