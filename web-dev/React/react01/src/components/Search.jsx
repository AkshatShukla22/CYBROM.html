import React, { useState } from 'react';
import axios from 'axios';

const Search = () => {
  const [name, setName] = useState('');
  const [myData, setMyData] = useState([]);

  const handleSubmit = async () => {
    try {
      const api = `http://localhost:3000/student`;
      const res = await axios.get(api);
      const filteredData = res.data.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase())
      );
      setMyData(filteredData);
      console.table(filteredData);
    }
    catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const ans = myData.map((item, index) => (
            <tr key={index}>
              <td>{item.rollnum}</td>
              <td>{item.name}</td>
              <td>{item.city}</td>
              <td>{item.fees}</td>
            </tr>
  ))

  return (
    <>
      <h1>Search Data</h1>
      Enter Name:
      <input
        type="text"
        value={name}
        onChange={(e) => {setName(e.target.value); handleSubmit(e.target.value);}}
      />
      <button onClick={handleSubmit}>Search</button>
      <hr />
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
          {ans}
        </tbody>
      </table>
    </>
  );
};

export default Search;
