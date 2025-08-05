import React, { useState } from 'react';
import axios from 'axios';
import BackendUrl from '../utils/BackendUrl';
import '../styles/Insert.css';

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
    <div className="insert-container">
      <h2 className="insert-heading">Insert Student</h2>
      <form onSubmit={handleSubmit} className="insert-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={input.name} onChange={handleInput} required />
        </div>
        <div className="form-group">
          <label>Roll No</label>
          <input type="text" name="rollno" value={input.rollno} onChange={handleInput} required />
        </div>
        <div className="form-group">
          <label>City</label>
          <input type="text" name="city" value={input.city} onChange={handleInput} required />
        </div>
        <div className="form-group">
          <label>Fees</label>
          <input type="number" name="fees" value={input.fees} onChange={handleInput} required />
        </div>
        <button type="submit" className="btn-submit">Save</button>
      </form>
    </div>
  );
};

export default Insert;
