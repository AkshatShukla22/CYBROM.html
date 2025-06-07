import React, { useState,useEffect } from 'react';
import axios from 'axios';

const Display = () => {
    const [data,setData] = useState ([]);

    useEffect(() => {
    axios.get("./db.json")
      .then(res => {
        setData(res.data.student);
      })
      .catch(error => {
        console.error("Error fetching JSON data:", error);
      });
  }, [data]);
  return (
    <>
      <h1>This is dispaly page.</h1>
      <ul>
        {data.map(user => (
          <li key={user.id}>
            Roll no.: {user.rollnum} Name: {user.name}, City: {user.city}, Fees: {user.fees}
          </li>
        ))}
      </ul>

      <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Roll no.</th>
              <th>Name</th>
              <th>City</th>
              <th>Fees</th>
            </tr>
          </thead>
          <tbody>
            {data.map(user => (
              <tr key={user.id} border='1'>
                <td>{user.rollnum}</td>
                <td>{user.name}</td>
                <td>{user.city}</td>
                <td>{user.fees}</td>
              </tr>
            ))}
          </tbody>
        </table>


    </>
  );
}

export default Display;
