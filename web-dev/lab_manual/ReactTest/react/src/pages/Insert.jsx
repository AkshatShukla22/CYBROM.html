import React from 'react';
import { useState } from 'react';
import axios from 'axios';

const Insert = () => {
  const [input, setInput] = useState({});

  const handleInput=(e)=>{
    let name = e.target.name;
    let value = e.target.value;
    setInput(values=>({...values, [name]: value}));
  }

  const handleSubmit=async()=>{
    let api="http://localhost:3000/student";
    const res=await axios.post(api, input);
    alert("data inserted");
  }

  return (
    <>
      <h1>This Is insert page.</h1>
      Enter Product no. : 
      <input 
      type="text"
      name="productNum"
      onChange={handleInput}
      /> <br />

      Enter Product Name : 
      <input 
      type="text"
      name="productName"
      onChange={handleInput}
      /> <br />

      Enter Product Quantity : 
      <input 
      type="text"
      name="productQuantity"
      onChange={handleInput}
      /> <br />

      Net Price : 
      <input 
      type="text"
      name="netPrice"
      onChange={handleInput}
      /> <br />

      Customer Name : 
      <input 
      type="text"
      name="customerName"
      onChange={handleInput}
      /> <br />

      <button onClick={handleSubmit}>
        Submit
      </button>

    </>
  );
}

export default Insert;
