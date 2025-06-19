// counterSlice.jsx
import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "myCounter",
  initialState: {
    count: 0
  },
  reducers: {
    Increment: (state) => {
      state.count += 1;
    },
    Decrement: (state) => {
      state.count -= 1;
    }
  }
});

export const { Increment, Decrement } = counterSlice.actions;
export default counterSlice.reducer;
