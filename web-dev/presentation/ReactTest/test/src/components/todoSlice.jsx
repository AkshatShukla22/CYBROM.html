
import { createSlice } from '@reduxjs/toolkit';

const todoSlice = createSlice({
  name: 'todo',
  initialState: {
    task: [],
  },
  reducers: {
    addTask: (state, action) => {
      state.task.push(action.payload);
    },
    removeTask: (state, action) => {
      state.task = state.task.filter((t) => t.id !== action.payload);
    },
    markAsComplete: (state, action) => {
      const index = state.task.findIndex((t) => t.id === action.payload);
      if (index !== -1) {
        state.task[index].status =
          state.task[index].status === 'complete' ? 'incomplete' : 'complete';
      }
    },
    editTask: (state, action) => {
      const index = state.task.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.task[index].work = action.payload.work;
      } 
    },
  },
});

export const { addTask, removeTask, markAsComplete, editTask } = todoSlice.actions;
export default todoSlice.reducer;
