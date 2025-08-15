import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Display = () => {
  const [data, setData] = useState([]);

  useEffect(()=>{
    const fetchData = async ()=>{
      const api = "http://localhost:3000/student";
      const res = await axios.get(api);
      setData(res.data)
    };
    fetchData();
  }, [])
  return (
    <>
      <h1>This is Display Page.</h1>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Product Number</th>
            <th>Product Name</th>
            <th>Product Quantity</th>
            <th>Net price</th>
            <th>Customer Name</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index)=>(
            <tr key={index}>
              <td>{item.productNum}</td>
              <td>{item.productName}</td>
              <td>{item.productQuantity}</td>
              <td>{item.netPrice}</td>
              <td>{item.customerName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Display;
