
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
      if (state.count > 0) {
        state.count -= 1;
      }else{
        alert("Counter cannot be less than 0");
      }
    }
  }
});

export const { Increment, Decrement } = counterSlice.actions;
export default counterSlice.reducer;
