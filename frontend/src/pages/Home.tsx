import { useQuery } from 'react-query';
import { stockApi } from '../services/api';
import StockTable from '../components/StockTable';
import AutoRefresh from '../components/AutoRefresh';

export default function Home() {
  const { data: gainersLosers, isLoading, error } = useQuery(
    'gainersLosers',
    stockApi.getGainersLosers
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading stock data. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Market Overview</h1>
        <AutoRefresh />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-600 mb-4">Top Gainers</h2>
          <StockTable stocks={gainersLosers?.gainers || []} />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Top Losers</h2>
          <StockTable stocks={gainersLosers?.losers || []} />
        </div>
      </div>
    </div>
  );
} 