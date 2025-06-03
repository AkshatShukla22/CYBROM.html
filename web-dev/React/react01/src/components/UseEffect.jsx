import { useState, useEffect } from "react";

const App = () => {
  const [myval, setMyVal] = useState(0);
  useEffect(()=>{
    setTimeout(()=>{
      setMyVal(myval+1);
    }, 1000)
  })

  return (
    <>
      <h1>Welcome To My App: {myval}</h1>
    </>
  );
};

export default App;
