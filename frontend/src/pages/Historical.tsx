import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { stockApi } from '../services/api';

const PERIODS = [
  { label: '1 Day', value: '1d' },
  { label: '5 Days', value: '5d' },
  { label: '1 Month', value: '1mo' },
  { label: '3 Months', value: '3mo' },
  { label: '6 Months', value: '6mo' },
  { label: '1 Year', value: '1y' },
];

export default function Historical() {
  const { symbol } = useParams<{ symbol: string }>();
  const [selectedPeriod, setSelectedPeriod] = useState('1mo');

  const { data: historicalData, isLoading, error } = useQuery(
    ['historical', symbol, selectedPeriod],
    () => stockApi.getHistoricalData(symbol!, selectedPeriod)
  );

  const { data: stockInfo } = useQuery(['stock', symbol], () =>
    stockApi.getStock(symbol!)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !symbol) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading historical data. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{stockInfo?.name}</h1>
          <p className="text-gray-500">{symbol}</p>
        </div>
        <div className="inline-flex rounded-md shadow-sm">
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSelectedPeriod(value)}
              className={`
                relative inline-flex items-center px-3 py-2 text-sm font-medium
                ${
                  selectedPeriod === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }
                ${value === PERIODS[0].value ? 'rounded-l-md' : ''}
                ${
                  value === PERIODS[PERIODS.length - 1].value
                    ? 'rounded-r-md'
                    : ''
                }
                border border-gray-300
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) =>
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                  }).format(value)
                }
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#2563eb"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 