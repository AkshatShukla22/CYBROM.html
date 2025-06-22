import { useState } from "react";
import { addtoTask } from './todoSlice';
import { useDispatch, useSelector } from "react-redux";

const App = () => {
  const [txt, setTxt] = useState("");
  const Data = useSelector(state=>state.todo.task);
  const dispatch = useDispatch();

  let sno = 0;
  const ans = Data.map((item)=>{
    sno++;
    return(
      <>
      <tr>
        <td>{sno}</td>
        <td>{item.work}</td>
      </tr>
      </>
    )
  })

  return (
    <>
    <h1> To Do App </h1>
    Enter Task: <input type="text" value={txt} onChange={(e)=>{
      setTxt(e.target.value)
    }} />
    <button onClick={()=>{
      dispatch(addtoTask({work:txt}))
    }}>Add Task</button>
    <hr />
    <br />
    <table>
      <thead>
      <tr>
        <th>#</th>
        <th>My Task</th>
      </tr>
      </thead>
      <tbody>
      {ans}
      </tbody>
    </table>
    </>
  );
};

export default App;
