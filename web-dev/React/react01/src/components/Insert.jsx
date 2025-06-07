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
    Enter Roll no.:<input type="text" name="rollnum" onChange={handleInput} /><br />
    Enter Name:<input type="text" name="name" onChange={handleInput} /><br />
    Enter City:<input type="text" name="city" onChange={handleInput} /><br />
    Enter Fees:<input type="text" name="fees" onChange={handleInput} /><br />
    <button onClick={handleSubmit} >Submit</button>
    </>
  );
}

export default Insert;
