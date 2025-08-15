import React from 'react';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Update = () => {
  const [myData, setMyData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});

  const navigate = useNavigate();

  const loadData = async()=>{
    try {
      const res = await axios.get("http://localhost:3000/student");
      setMyData(res.data);
    } catch (error) {
      console.error("Error loading data", error);
    }
  }

  const recDelete = async(id)=>{
    let confirmDelete = window.confirm("Are you sure you want to delete?");
    if(confirmDelete){
      try {
        await axios.delete(`http://localhost:3000/student/${id}`);
        alert("Record deleted successfully");
        loadData();
        
      } catch (error) {
        console.error("Error deleting record", error);
        alert("Failed to delete record");
      }
    }
  }

  useEffect(() => {
        loadData();
    }, []);

  return (
    <>
      <h1>This is update Page.</h1>
      <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Product Number</th>
                        <th>Product Name</th>
                        <th>Product Quantity</th>
                        <th>Net price</th>
                        <th>Customer Name</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {myData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.productNum}</td>
                            <td>{item.productName}</td>
                            <td>{item.productQuantity}</td>
                            <td>{item.netPrice}</td>
                            <td>{item.customerName}</td>
                            <td>
                                <button onClick={() => navigate(`/Edit/${item.id}`, { state: item })}>Edit</button>
                            </td>
                            <td>
                                <button onClick={() => recDelete(item.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
      </table>
    </>
  );
}

export default Update;
