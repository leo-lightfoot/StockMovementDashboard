import React from 'react';
import { Stock } from '../services/api';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StockCardProps {
  stock: Stock;
}

const formatNumber = (num: number): string => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const isPositiveChange = stock.change_percent >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{stock.symbol}</h3>
          <p className="text-sm text-gray-500">{stock.name}</p>
        </div>
        <div className={`flex items-center px-3 py-1 rounded-full ${
          isPositiveChange ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isPositiveChange ? (
            <ArrowUpIcon className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 mr-1" />
          )}
          <span className="font-semibold">
            {isPositiveChange ? '+' : ''}{stock.change_percent.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-500">Current Price</p>
          <p className="text-lg font-bold text-gray-900">
            ${stock.current_price.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-500">Volume</p>
          <p className="text-lg font-bold text-gray-900">
            {formatNumber(stock.volume)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-500">Market Cap</p>
          <p className="text-lg font-bold text-gray-900">
            ${formatNumber(stock.market_cap)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-500">Last Updated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(stock.last_updated).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockCard; 