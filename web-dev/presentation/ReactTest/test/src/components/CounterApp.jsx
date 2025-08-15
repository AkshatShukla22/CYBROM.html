import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Increment, Decrement } from './counterSlice'; 

const Counter = () => {
  const count = useSelector((state) => state.myCounter.count);
  const dispatch = useDispatch();

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Counter: {count}</h2>
      <button onClick={() => dispatch(Increment())} >
        Increment
      </button>
      <button onClick={() => dispatch(Decrement())}>
        Decrement
      </button>
    </div>
  );
};

export default Counter;
