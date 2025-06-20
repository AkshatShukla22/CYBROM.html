import React from 'react';
import { Increment, Decrement } from "./counterSlice";
import { useSelector, useDispatch } from "react-redux";

const Redux = () => {
  const cnt = useSelector((state) => state.myCounter.count);
  const dispatch = useDispatch(); 
  return (
    <>
      {/* --> install redux tool kit -> npm install @reduxjs/toolkit 
      after that command use this ->  npm install react-redux 

      -->there are one store.jsx which intacts with GUI and files are devided into Slices
      */}
      <h1>Welcome</h1>
            <button onClick={() => dispatch(Increment())}>Increment</button>
            <h1>{cnt}</h1>
            <button onClick={() => dispatch(Decrement())}>Decrement</button>
    </>
  );
}

export default Redux;
