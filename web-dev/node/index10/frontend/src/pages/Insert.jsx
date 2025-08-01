import React from 'react';
import { useState } from 'react';

const Insert = () => {
  const [input, setInput] = useState({
    name: '',
    rollno: '',
    city: '',
    fees: ''
  });
  const handleInput = (e) => {
    let name = e.target.name;
    let input = e.target.value;
    setInput(prevState => ({
      ...prevState,
      [name]: input
    }));
  }
  return (
    <>
      <div className="container">
        <h1>Insert Data</h1>
        <form>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" className="form-control" id="name" name="name" value={input.name} onChange={handleInput} />  
          </div>
          <div className="mb-3">
            <label htmlFor="rollno" className="form-label">Roll No</label>
            <input type="text" className="form-control" id="rollno" name="rollno" value={input.rollno} onChange={handleInput} />
          </div>
          <div className="mb-3">
            <label htmlFor="city" className="form-label">City</label> 
            <input type="text" className="form-control" id="city" name="city" value={input.city} onChange={handleInput} />
          </div>
          <div className="mb-3">
            <label htmlFor="fees" className="form-label">Fees</label>
            <input type="text" className="form-control" id="fees" name="fees" value={input.fees} onChange={handleInput} />
          </div>  
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      </div>
    </>
  );
}

export default Insert;
