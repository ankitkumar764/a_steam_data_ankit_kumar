import { configureStore } from '@reduxjs/toolkit';
import dummyReducer from './slices/dummySlice';

export const store = configureStore({
  reducer: {
    dummy: dummyReducer,
  },
});
