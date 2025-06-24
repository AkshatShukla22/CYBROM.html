// App.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, removeTask, markAsComplete } from './todoSlice';

function App() {
  const [val, setVal] = useState('');
  const Data = useSelector((state) => state.todo.task);
  const dispatch = useDispatch();

  const handleAdd = () => {
    if (val.trim() !== '') {
      dispatch(
        addTask({
          id: Math.floor(Math.random() * 1000), 
          work: val,
          status: 'incomplete',
        })
      );
      setVal('');
    }
  };

  console.log(Data);

  return (
    <>
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>
      <table>
        <tbody>
          {Data.map((key, index) =>
            key.status === 'incomplete' ? (
              <tr key={key.id}>
                <td>{index + 1}</td>
                <td>{key.work}</td>
                <td>
                  <button onClick={() => dispatch(removeTask(key.id))}>
                    Delete
                  </button>
                </td>
                <td>
                  <button onClick={() => dispatch(markAsComplete(key.id))}>
                    Mark as complete
                  </button>
                </td>
              </tr>
            ) : null
          )}
        </tbody>
      </table>
    </>
  );
}

export default App;
