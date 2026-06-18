import api from './api';

const gameService = {
  // Get list of games with optional params (filters, pagination)
  getGames: async (params = {}) => {
    const response = await api.get('/games', { params });
    return response.data;
  },

  // Search games by string query
  searchGames: async (q, page = 1, limit = 10) => {
    const response = await api.get('/search/games', { params: { q, page, limit } });
    return response.data;
  },

  // Fetch full game profile
  getGameDetails: async (appid) => {
    const response = await api.get(`/games/${appid}`);
    return response.data;
  },

  // Add new game record
  createNewGame: async (gameData) => {
    const response = await api.post('/games', gameData);
    return response.data;
  },

  // Partially edit game record
  updateGame: async (appid, gameData) => {
    const response = await api.patch(`/games/${appid}`, gameData);
    return response.data;
  },

  // Delete a game entry permanently
  deleteGame: async (appid) => {
    const response = await api.delete(`/games/${appid}`);
    return response.data;
  },

  // Fetch screenshots
  getGameScreenshots: async (appid) => {
    const response = await api.get(`/games/${appid}/screenshots`);
    return response.data;
  },

  // Fetch trailers
  getGameTrailers: async (appid) => {
    const response = await api.get(`/games/${appid}/trailers`);
    return response.data;
  },

  // Fetch system requirements
  getSystemRequirements: async (appid) => {
    const response = await api.get(`/games/${appid}/system-requirements`);
    return response.data;
  },

  // Fetch user reviews
  getGameReviews: async (appid) => {
    const response = await api.get(`/games/${appid}/reviews`);
    return response.data;
  },

  // Post a review
  addGameReview: async (appid, reviewData) => {
    const response = await api.post(`/games/${appid}/reviews`, reviewData);
    return response.data;
  },

  // Update a review
  updateGameReview: async (appid, reviewId, reviewData) => {
    const response = await api.patch(`/games/${appid}/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteGameReview: async (appid, reviewId) => {
    const response = await api.delete(`/games/${appid}/reviews/${reviewId}`);
    return response.data;
  },

  // Fetch related game recommendations
  getRelatedGames: async (appid) => {
    const response = await api.get(`/games/${appid}/related`);
    return response.data;
  },
};

export default gameService;
