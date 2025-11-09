import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = {
  // Fetch stock data with EMAs and RSI
  getStockData: async (symbol) => {
    try {
      const response = await axios.get(`${API_BASE}/data/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw error;
    }
  },

  // Get ML prediction
  getPrediction: async (symbol) => {
    try {
      const response = await axios.get(`${API_BASE}/predict/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prediction:', error);
      throw error;
    }
  },

  // Get backtest results
  getBacktest: async (symbol) => {
    try {
      const response = await axios.get(`${API_BASE}/backtest/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching backtest:', error);
      throw error;
    }
  },

  // Chat with AI
  sendChatMessage: async (symbol, query, context) => {
    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        symbol,
        query,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },

  // Fetch historical chart data
  getChartData: async (symbol) => {
    try {
      const response = await axios.get(`${API_BASE}/chart/${symbol}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }
  },

  // Get list of available stocks
  getStocks: async () => {
    try {
      const response = await axios.get(`${API_BASE}/stocks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stocks:', error);
      throw error;
    }
  },

  // Search stocks
  searchStocks: async (query) => {
    try {
      const response = await axios.get(`${API_BASE}/stocks/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  },

  // Get AI summary for stock
  getStockSummary: async (symbol) => {
    try {
      const response = await axios.get(`${API_BASE}/summary/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error;
    }
  },

  // Get news sentiment
  getSentiment: async (symbol) => {
    try {
      const response = await axios.get(`${API_BASE}/sentiment/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      throw error;
    }
  },

  // Get top movers
  getTopMovers: async () => {
    try {
      const response = await axios.get(`${API_BASE}/top-movers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top movers:', error);
      throw error;
    }
  }
};

export default api;