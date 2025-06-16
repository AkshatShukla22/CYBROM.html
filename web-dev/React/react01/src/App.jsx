import { useMemo, useState } from "react";

// const App = () => {
//   const [add, setAdd] = useState(0);
//   const [minus, setMinus] = useState(100);
//   const multi = useMemo(()=>{
//     console.log("*****")
//     return add*2
//   }, [add]);
//   return (
//     <>
//     <h1>Welcome</h1>
//     <h1>Multiplication: {multi}</h1>
//     <h1>Addition: {add}</h1>
//     <h1>Substraction: {minus}</h1>
//     <button onClick={()=>{setAdd(add+1)}}>Add</button>
//     <button onClick={()=>{setMinus(minus-1)}}>Minus</button>
//     </>
//   );
// };

const App = () => {
  const [num, setNum] = useState(0);
  const [city, setCity] = useState("");
  const ExpansiveVAl = useMemo(() =>{
    for(var i= 0; i<10000000; i++){}
    return num*2;
  },[num])

  // const ExpensiveCityVal2 = useMemo(() => {
  //   let result = 0;
  //   for (let i = 0; i < 1000000000; i++) {}
  //   return city.toUpperCase();
  // }, [city]);

  return (
    <>
    <h1>Welcome</h1>
    Select Number : <input type="number" value={num} onChange={(e)=>{
      setNum(e.target.value);
    }} />
    Entr City : <input type="text" value={city} onChange={(e)=>{
      setCity(e.target.value);
      // ExpensiveCityVal2;
    }} />
    <h2>My Count : {ExpansiveVAl}</h2>
    </>
  );
};

export default App;