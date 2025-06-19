import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Load data once on mount
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3000/student');
        setAllData(res.data);
        setFilteredData(res.data); // Initially show all
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter whenever search term changes
    const results = allData.filter(item =>
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(results);
  }, [searchTerm, allData]);

  return (
    <>
      <h1>This is Search Page</h1>
      Enter Customer Name:{" "}
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <hr />
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Product Number</th>
            <th>Product Name</th>
            <th>Product Quantity</th>
            <th>Net Price</th>
            <th>Customer Name</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
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
};

export default Search;
