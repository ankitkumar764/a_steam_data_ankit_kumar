import { configureStore } from '@reduxjs/toolkit';
import dummyReducer from './slices/dummySlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    dummy: dummyReducer,
    auth: authReducer,
  },
});
