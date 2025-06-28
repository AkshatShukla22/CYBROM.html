import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Pagination = () => {
  const [mydata, setmydata] = useState([]);
  const [visibleRows, setVisibleRows] = useState(5);

  const loadData = async () => {
    try {
      const api = "http://localhost:3000/student";
      const response = await axios.get(api);
      setmydata(response.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showMore = () => {
    setVisibleRows(prev => prev + 5);
  };

  return (
    <>
      <h1>This is display page.</h1>

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
          {mydata.slice(0, visibleRows).map((item, index) => (
            <tr key={index}>
              <td>{item.rollnum}</td>
              <td>{item.name}</td>
              <td>{item.city}</td>
              <td>{item.fees}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {visibleRows < mydata.length && (
        <button onClick={showMore} >Show More</button>
      )}
    </>
  );
};

export default Pagination;
