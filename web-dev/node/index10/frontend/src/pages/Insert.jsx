import React, { useState } from 'react';
import axios from 'axios';
import BackendUrl from '../utils/BackendUrl';

const Insert = () => {
  const [input, setInput] = useState({
    name: '',
    rollno: '',
    city: '',
    fees: ''
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const api = `${BackendUrl}students/save`;
      const payload = { ...input, fees: Number(input.fees) };
      const res = await axios.post(api, payload);
      alert(res.data);
    } catch (error) {
      alert('Something went wrong: ' + error.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '30px' }}>
      <h2>Insert Student</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Name</label>
          <input type="text" name="name" value={input.name} onChange={handleInput} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Roll No</label>
          <input type="text" name="rollno" value={input.rollno} onChange={handleInput} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>City</label>
          <input type="text" name="city" value={input.city} onChange={handleInput} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Fees</label>
          <input type="number" name="fees" value={input.fees} onChange={handleInput} className="form-control" required />
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
    </div>
  );
};

export default Insert;
