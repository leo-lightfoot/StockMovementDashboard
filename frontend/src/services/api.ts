import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Stock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
  change_percent: number;
  volume: number;
  market_cap: number;
  sector: string;
  is_active: boolean;
  last_updated: string;
}

export interface MarketMovers {
  gainers: Stock[];
  losers: Stock[];
}

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

export const stockApi = {
  getAllStocks: async (): Promise<Stock[]> => {
    const response = await api.get('/stocks');
    return response.data;
  },

  getMarketMovers: async (): Promise<MarketMovers> => {
    const response = await api.get('/stocks/market-movers');
    return response.data;
  },

  populateStocks: async (limit?: number): Promise<any> => {
    const params = limit ? { limit } : {};
    const response = await api.get('/stocks/populate-stocks', { params });
    return response.data;
  },

  getTopGainers: async (limit: number = 5): Promise<Stock[]> => {
    const response = await api.get(`/stocks/gainers?limit=${limit}`);
    return response.data;
  },

  getTopLosers: async (limit: number = 5): Promise<Stock[]> => {
    const response = await api.get(`/stocks/losers?limit=${limit}`);
    return response.data;
  },
};

export default stockApi; 