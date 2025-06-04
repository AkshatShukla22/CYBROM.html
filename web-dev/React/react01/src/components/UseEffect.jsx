import { useState, useEffect } from "react";

const App = () => {
  // const [myval, setMyVal] = useState(0);
  // => Runs for every render infinitely
  // useEffect(()=>{
  //   setTimeout(()=>{
  //     setMyVal(myval+1);
  //   }, 1000)
  // })

  // =>It will run only once after giving empty array as dependenct
  // const [myval, setMyVal] = useState(0);
  // useEffect(()=>{
  //   setTimeout(()=>{
  //     setMyVal(myval+1);
  //   }, 1000)
  // }, []) 

  //=> It will runs only when the valuse changes
  const [count, setCount] = useState(0);
  const [multi, setMulti] = useState(0);
  useEffect(()=>{
    setMulti(count*2);
  }, [count])

  return (
    <>
      {/* <h1>Welcome To My App: {myval}</h1> */}

      {/* <h1>Welcome To My App: {myval}</h1> */}

      <h1>Welcome To My App</h1>
      <h1>Count: {count}</h1>
      <h1>Multiplication: {multi}</h1>
      <button onClick={()=>{setCount(count+1)}}>Click here!</button>

    </>
  );
};

export default App;
