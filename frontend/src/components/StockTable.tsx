import React from 'react';
import { StockData } from '../services/api';

interface StockTableProps {
    stocks: StockData[];
    title: string;
}

const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(num);
};

const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) {
        return `$${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
        return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    if (marketCap >= 1e6) {
        return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${formatNumber(marketCap)}`;
};

const StockTable: React.FC<StockTableProps> = ({ stocks, title }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">Symbol</th>
                            <th className="px-4 py-2 text-left">Company</th>
                            <th className="px-4 py-2 text-right">Price</th>
                            <th className="px-4 py-2 text-right">Change %</th>
                            <th className="px-4 py-2 text-right">Volume</th>
                            <th className="px-4 py-2 text-right">Market Cap</th>
                            <th className="px-4 py-2 text-left">Sector</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((stock) => (
                            <tr key={stock.symbol} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium">{stock.symbol}</td>
                                <td className="px-4 py-2">{stock.company_name}</td>
                                <td className="px-4 py-2 text-right">
                                    ${formatNumber(stock.current_price)}
                                </td>
                                <td className={`px-4 py-2 text-right ${
                                    stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {formatNumber(stock.change_percent)}%
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {new Intl.NumberFormat('en-US').format(stock.volume)}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {formatMarketCap(stock.market_cap)}
                                </td>
                                <td className="px-4 py-2">{stock.sector}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTable; 