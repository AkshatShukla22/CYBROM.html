import { createSlice } from "@reduxjs/toolkit";
const todoSlice = createSlice({
    name: "todo",
    initialState:{
        task:[]
    },
    reducers:{
        addtoTask:(state, actions)=>{
            console.log(actions.payload);
            state.task.push(actions.payload);
        }
    }
})
export const {addtoTask} = todoSlice.actions;
export default todoSlice.reducer;