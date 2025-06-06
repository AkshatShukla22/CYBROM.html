import React, { useState,useEffect } from 'react';
import axios from 'axios';

const Display = () => {
    const [data,setData] = useState ([]);

    useEffect(() => {
    axios.get("./db.json")
      .then(res => {
        setData(res.data);
      })
      .catch(error => {
        console.error("Error fetching JSON data:", error);
      });
  }, []);
  return (
    <>
      <h1>This is dispaly page.</h1>
      <ul>
        {data.map(user => (
          <li key={user.id}>
            Name: {user.name}, City: {user.city}
          </li>
        ))}
      </ul>
    </>
  );
}

export default Display;
