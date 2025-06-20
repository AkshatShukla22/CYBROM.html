import React, { useRef, useState } from 'react';

const UseRef = () => {
    // const [count, setCount] = useState(0);
    // let val = useRef(0);
    // function handleIncrement() {
    //     val.current = val.current+1;
    //     console.log("Value of val: ", val.current )
    //     setCount(count+1);
    // }

    // let btnRef = useRef();
    // function changeColor(){
    //     btnRef.current.style.backgroundColor = "red";
    // }

    const [time, setTime] = useState(0);
    let timerRef = useRef(null);
    function startTimer(){
        timerRef.current = setInterval(()=>{
            setTime(time => time+1)
        },1000)
    }
    function stopTimer(){
        clearInterval(timerRef.current);
        timerRef.current = null;
    }
    function resetTimer(){
        stopTimer();
        setTime(0);
    }

  return (
    <>
      {/* <button onClick={handleIncrement}>
        Increment
      </button>
      <br />
      <div>{count}</div> */}

        {/* <button ref={btnRef}>Change</button>
        <br />
        <br />
        <button onClick={changeColor}>Change Color</button> */}

        <h1>StopWatch: {time}</h1>
        <button onClick={startTimer}>Start</button><br /><br />
        <button onClick={stopTimer}>Stop</button><br /><br />
        <button onClick={resetTimer}>Reset</button><br /><br />

    </>
  );
}

export default UseRef;
