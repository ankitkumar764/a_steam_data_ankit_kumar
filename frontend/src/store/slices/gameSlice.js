import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch paginated games with query parameters or direct filter grouping paths
export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { filterGroup, sortOption, search, ...query } = params;
      let url = '/games';

      // Route-based filtering override
      if (filterGroup) {
        url = `/games/filter/${filterGroup}`;
      } else if (sortOption) {
        url = `/games/sort/${sortOption}`;
      } else if (search) {
        url = '/search/games';
        query.q = search;
      }

      const response = await api.get(url, { params: query });
      return response; // contains data: [Game] and pagination: {}
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch games');
    }
  }
);

// Fetch details of a single game
export const fetchGameDetails = createAsyncThunk(
  'games/fetchGameDetails',
  async (appid, { rejectWithValue }) => {
    try {
      const response = await api.get(`/games/${appid}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch game details');
    }
  }
);

// Create a new game
export const createGame = createAsyncThunk(
  'games/createGame',
  async (gameData, { rejectWithValue }) => {
    try {
      // Use protected route if possible, or fallback to public one
      const response = await api.post('/protected/games', gameData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create game');
    }
  }
);

// Update a game (PATCH)
export const updateGame = createAsyncThunk(
  'games/updateGame',
  async ({ appid, gameData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/protected/games/${appid}`, gameData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update game');
    }
  }
);

// Delete a game permanently
export const deleteGame = createAsyncThunk(
  'games/deleteGame',
  async (appid, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/protected/games/${appid}`);
      return appid;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete game');
    }
  }
);

// Soft delete (archive) a game
export const archiveGame = createAsyncThunk(
  'games/archiveGame',
  async (appid, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/games/${appid}/archive`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to archive game');
    }
  }
);

// Restore an archived game
export const restoreGame = createAsyncThunk(
  'games/restoreGame',
  async (appid, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/games/${appid}/restore`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to restore game');
    }
  }
);

// Fetch reviews for a game
export const fetchReviews = createAsyncThunk(
  'games/fetchReviews',
  async (appid, { rejectWithValue }) => {
    try {
      const response = await api.get(`/games/${appid}/reviews`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch reviews');
    }
  }
);

// Create a review
export const addReview = createAsyncThunk(
  'games/addReview',
  async ({ appid, reviewData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/games/${appid}/reviews`, reviewData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add review');
    }
  }
);

// Delete a review
export const deleteReview = createAsyncThunk(
  'games/deleteReview',
  async ({ appid, reviewId }, { rejectWithValue }) => {
    try {
      await api.delete(`/games/${appid}/reviews/${reviewId}`);
      return reviewId;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete review');
    }
  }
);

const initialState = {
  games: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  },
  selectedGame: null,
  reviews: [],
  loading: false,
  error: null,
};

const gameSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    clearSelectedGame: (state) => {
      state.selectedGame = null;
      state.reviews = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Games
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload.data;
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Game Details
      .addCase(fetchGameDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGame = action.payload;
      })
      .addCase(fetchGameDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Game
      .addCase(createGame.fulfilled, (state, action) => {
        state.games.unshift(action.payload);
      })
      // Update Game
      .addCase(updateGame.fulfilled, (state, action) => {
        const index = state.games.findIndex(g => g.appid === action.payload.appid);
        if (index !== -1) {
          state.games[index] = action.payload;
        }
        if (state.selectedGame && state.selectedGame.appid === action.payload.appid) {
          state.selectedGame = action.payload;
        }
      })
      // Delete Game
      .addCase(deleteGame.fulfilled, (state, action) => {
        state.games = state.games.filter(g => g.appid !== action.payload);
        if (state.selectedGame && state.selectedGame.appid === action.payload) {
          state.selectedGame = null;
        }
      })
      // Archive/Restore Game
      .addCase(archiveGame.fulfilled, (state, action) => {
        const index = state.games.findIndex(g => g.appid === action.payload.appid);
        if (index !== -1) {
          state.games[index] = action.payload;
        }
      })
      .addCase(restoreGame.fulfilled, (state, action) => {
        const index = state.games.findIndex(g => g.appid === action.payload.appid);
        if (index !== -1) {
          state.games[index] = action.payload;
        }
      })
      // Fetch Reviews
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.reviews = action.payload;
      })
      // Add Review
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviews.push(action.payload);
      })
      // Delete Review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r.reviewId !== action.payload);
      });
  },
});

export const { clearSelectedGame } = gameSlice.actions;
export default gameSlice.reducer;
