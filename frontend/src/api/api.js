import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'https://alphacross-ai-powered-moving-average.onrender.com';

export const api = {
  // =====================
  // EXISTING FUNCTIONS
  // =====================

  // Fetch stock data with EMAs and RSI
  getStockData: async (symbol) => {
    try {
      const response = await axios.get(`${API_URL}/data/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw error;
    }
  },

  // Get ML prediction
  getPrediction: async (symbol) => {
    try {
      const response = await axios.get(`${API_URL}/predict/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prediction:', error);
      throw error;
    }
  },

  // Get backtest results (single stock)
  getBacktest: async (symbol) => {
    try {
      const response = await axios.get(`${API_URL}/backtest/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching backtest:', error);
      throw error;
    }
  },

  // Chat with AI (optionally pass conversation history for multi-turn memory)
  sendChatMessage: async (symbol, query, context, conversationHistory = []) => {
    try {
      const response = await axios.post(`${API_URL}/chat`, {
        symbol,
        query,
        context,
        conversation_history: conversationHistory
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
      const response = await axios.get(`${API_URL}/chart/${symbol}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }
  },

  // Get list of available stocks
  getStocks: async () => {
    try {
      const response = await axios.get(`${API_URL}/stocks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stocks:', error);
      throw error;
    }
  },

  // Search stocks
  searchStocks: async (query) => {
    try {
      const response = await axios.get(
        `${API_URL}/stocks/search?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  },

  // Get AI summary for stock
  getStockSummary: async (symbol) => {
    try {
      const response = await axios.get(`${API_URL}/summary/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error;
    }
  },

  // Get news sentiment
  getSentiment: async (symbol) => {
    try {
      const response = await axios.get(`${API_URL}/sentiment/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      throw error;
    }
  },

  // Get top movers
  getTopMovers: async () => {
    try {
      const response = await axios.get(`${API_URL}/top-movers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top movers:', error);
      throw error;
    }
  },

  // =====================
  // 🚀 NSE 500 ADDITIONS
  // =====================

  // Check NSE 500 fetch status
  checkNSE500Status: async () => {
    try {
      const response = await axios.get(`${API_URL}/nse500/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking NSE 500 status:', error);
      throw error;
    }
  },

  // Get full NSE 500 list (with sectors)
  getNSE500List: async () => {
    try {
      const response = await axios.get(`${API_URL}/nse500/list`);
      return response.data;
    } catch (error) {
      console.error('Error fetching NSE 500 list:', error);
      throw error;
    }
  },

  // Screen NSE 500 universe
  screenUniverse: async (config) => {
    try {
      const response = await axios.post(
        `${API_URL}/screen/universe`,
        config
      );
      return response.data;
    } catch (error) {
      console.error('Error screening NSE 500 universe:', error);
      throw error;
    }
  },

  // Run NSE 500 universe backtest
  runUniverseBacktest: async (config) => {
    try {
      const response = await axios.post(
        `${API_URL}/backtest/universe`,
        config
      );
      return response.data;
    } catch (error) {
      console.error('Error running NSE 500 universe backtest:', error);
      throw error;
    }
  },

  // =====================
  // 🧠 NLP ADDITIONS
  // =====================

  // Get AI-generated News Intelligence briefing (headlines, sentiment, summary, risks)
  getNewsIntelligence: async (symbol) => {
    try {
      const response = await axios.get(`${API_URL}/news/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching news intelligence:', error);
      // Return a safe default so the UI can render an "unavailable" state
      return {
        symbol,
        available: false,
        headlines: [],
        sentiment: 'Neutral',
        confidence: 0,
        summary: '',
        risks: [],
        impact: '',
        message: 'Unable to reach news service.'
      };
    }
  },

  // =====================
  // CHART EXPLANATION (POST /explain-chart, unchanged endpoint)
  // =====================
  explainChart: async (symbol, chartData, context = {}) => {
    try {
      const response = await axios.post(`${API_URL}/explain-chart`, {
        symbol,
        chart_data: chartData,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Error explaining chart:', error);
      throw error;
    }
  }
};

export default api;