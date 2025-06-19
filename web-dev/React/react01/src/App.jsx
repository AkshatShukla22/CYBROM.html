// App.jsx
import { Increment, Decrement } from "./counterSlice";
import { useSelector, useDispatch } from "react-redux";

const App = () => {
  const cnt = useSelector((state) => state.myCounter.count);
  const dispatch = useDispatch(); 

  return (
    <>
      <h1>Welcome</h1>
      <button onClick={() => dispatch(Increment())}>Increment</button>
      <h1>{cnt}</h1>
      <button onClick={() => dispatch(Decrement())}>Decrement</button>
    </>
  );
};

export default App;
