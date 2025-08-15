// App.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, removeTask, markAsComplete, editTask } from './todoSlice02';

function App() {
  const [val, setVal] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
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

  const handleEdit = () => {
    if (val.trim() !== '' && editId !== null) {
      dispatch(editTask({ id: editId, work: val }));
      setVal('');
      setEditMode(false);
      setEditId(null);
    }
  };

  const initiateEdit = (task) => {
    setVal(task.work);
    setEditMode(true);
    setEditId(task.id);
  };

  return (
    <>
      <h1>Add Task -- </h1>
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      {editMode ? (
        <button onClick={handleEdit}>Edit</button>
      ) : (
        <button onClick={handleAdd}>Add</button>
      )}

      <table>
        <thead>
          <tr>
            <th>S.no</th>
            <th>Task</th>
            <th>Delete</th>
            <th>Mark Task</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {Data.map((key, index) => (
            <tr key={key.id}>
              <td>{index + 1}</td>
              <td style={{ color: key.status === 'complete' ? 'red' : 'black' }}>
                {key.work}
              </td>
              <td>
                <button onClick={() => dispatch(removeTask(key.id))}>
                  Delete
                </button>
              </td>
              <td>
                <button onClick={() => dispatch(markAsComplete(key.id))}>
                  {key.status === 'complete' ? 'Mark as incomplete' : 'Mark as complete'}
                </button>
              </td>
              <td>
                <button onClick={() => initiateEdit(key)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default App;
