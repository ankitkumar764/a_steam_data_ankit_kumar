import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
};

export const dummySlice = createSlice({
  name: 'dummy',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

export const { increment, decrement } = dummySlice.actions;
export default dummySlice.reducer;
