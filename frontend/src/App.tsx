import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MarketMovers from './components/MarketMovers';
import Layout from './components/Layout';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30000, // Consider data stale after 30 seconds
        },
    },
});

function App() {
    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['marketMovers'] });
    };

    return (
        <QueryClientProvider client={queryClient}>
            <Layout onRefresh={handleRefresh}>
                <div className="space-y-8">
                    {/* Market Overview Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Overview</h2>
                        <MarketMovers />
                    </section>

                    {/* Additional sections can be added here */}
                </div>
            </Layout>
        </QueryClientProvider>
    );
}

export default App; 