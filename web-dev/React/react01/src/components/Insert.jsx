import React from 'react';
import { useState } from 'react';
import axios from "axios";

const Insert = () => {
    const [input, setInput] = useState({});

    const handleInput=(e)=>{
    let name = e.target.name;
    let value = e.target.value;
    setInput(values=>({...values, [name]: value}))
    console.log(input)
    }

    const handleSubmit=async()=>{
        let api="http://localhost:3000/student";
        const response=await axios.post(api,input )
        alert("data inserted")      
    }
  return (
    <>
    Enter employment:<input type="text" name="rollnum" onChange={handleInput} /><br />
    Enter name:<input type="text" name="name" onChange={handleInput} /><br />
    Enter designation:<input type="text" name="city" onChange={handleInput} /><br />
    Enter city:<input type="text" name="fees" onChange={handleInput} /><br />
    <button onClick={handleSubmit} >Submit</button>
    </>
  );
}

export default Insert;
