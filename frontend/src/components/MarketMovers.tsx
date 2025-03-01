import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockApi, MarketMovers as MarketMoversType } from '../services/api';
import StockCard from './StockCard';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MarketMovers: React.FC = () => {
  const { data, isLoading, error, isError, refetch } = useQuery<MarketMoversType>({
    queryKey: ['marketMovers'],
    queryFn: stockApi.getMarketMovers,
    refetchInterval: false,
    staleTime: Infinity,
    retry: 3,
  });

  const handlePopulateData = async () => {
    try {
      await stockApi.populateStocks();
      refetch();
    } catch (err) {
      console.error('Error populating stocks:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="bg-gray-50 rounded-lg p-3">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Market Data</h3>
        <p className="text-red-600 mb-4">
          {error instanceof Error ? error.message : 'Please check your connection and try again.'}
        </p>
        <div className="space-y-4">
          <p className="text-sm text-red-500">
            Make sure the backend server is running and stocks are populated.
          </p>
          <button
            onClick={handlePopulateData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Populate Stock Data
          </button>
        </div>
      </div>
    );
  }

  if (!data?.gainers?.length && !data?.losers?.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Stock Data Available</h3>
        <p className="text-yellow-600 mb-4">
          Click the button below to populate the initial stock data:
        </p>
        <button
          onClick={handlePopulateData}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          Populate Stock Data
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 p-4">
      <div>
        <h2 className="text-2xl font-bold text-green-600 mb-4">Top Gainers</h2>
        <div className="space-y-4">
          {data.gainers.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-red-600 mb-4">Top Losers</h2>
        <div className="space-y-4">
          {data.losers.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketMovers; 