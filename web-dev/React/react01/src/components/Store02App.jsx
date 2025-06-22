import { useSelector, useDispatch } from "react-redux";
import { bgcolorChange } from "./components/colorSlice";
import{ useState } from 'react'

const App = () => {
  const clr=useSelector(state=>state.mycolor.color);
  const dispatech = useDispatch();
  const [txtval, setTxtVal] = useState("");

  return (
    <>
    <h1> Welcome </h1>
    Enter Color: <input type="text" value={txtval} onChange={(e)=>{setTxtVal(e.target.value)}} />
    <button onClick={()=>{dispatech(bgcolorChange(txtval))}}>Change Color</button>
    <div style={{width:"400px", height:"200px", backgroundColor:clr }}></div>
    </>
  );
};

export default App;
