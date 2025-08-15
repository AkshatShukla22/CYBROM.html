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

  const [mydata, setmydata] = useState([]);
    const loadData = async () => {
        let api = "http://localhost:3000/student";
        const response = await axios.get(api);
        setmydata(response.data);
        console.log(response.data);
    };
    useEffect(() => {
        loadData();
    }, []);

  return (
    <>
      <h1>This is dispaly page.</h1>
      
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

        <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Roll no.</th>
                        <th>Name</th>
                        <th>City</th>
                        <th>Fees</th>
                    </tr>
                </thead>
                <tbody>
                    {mydata.map((item, index) => (
                        <tr key={index}>
                            <td>{item.rollnum}</td>
                            <td>{item.name}</td>
                            <td>{item.city}</td>
                            <td>{item.fees}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

    </>
  );
}

export default Display;
