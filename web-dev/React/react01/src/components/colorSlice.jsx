import { createSlice } from "@reduxjs/toolkit";
const colorSlice = createSlice({
    name:"mycolor",
    initialState:{
        color:"red"
    },
    reducers:{
        bgcolorChange:(state, action)=>{
            state.color=action.payload;
        }
    }
})
export const {bgcolorChange} =colorSlice.actions;
export default colorSlice.reducer;