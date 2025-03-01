import { useState } from 'react';
import { useQueryClient } from 'react-query';

const REFRESH_INTERVALS = [
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
];

export default function AutoRefresh() {
  const queryClient = useQueryClient();
  const [selectedInterval, setSelectedInterval] = useState(30000); // Default to 30s

  const handleIntervalChange = (interval: number) => {
    setSelectedInterval(interval);
    // Update all queries' refresh interval
    queryClient.setDefaultOptions({
      queries: {
        refetchInterval: interval,
      },
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Auto-refresh:</span>
      <div className="inline-flex rounded-md shadow-sm">
        {REFRESH_INTERVALS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleIntervalChange(value)}
            className={`
              relative inline-flex items-center px-3 py-2 text-sm font-medium
              ${
                selectedInterval === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }
              ${value === REFRESH_INTERVALS[0].value ? 'rounded-l-md' : ''}
              ${
                value === REFRESH_INTERVALS[REFRESH_INTERVALS.length - 1].value
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
  );
} 