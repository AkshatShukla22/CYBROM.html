import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BackendUrl from '../utils/BackendUrl';
import '../styles/Display.css'; 

const Display = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${BackendUrl}students/all`);
        setStudents(res.data);
      } catch (error) {
        alert('Error fetching students: ' + error.message);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="display-container">
      <h2 className="display-heading">Student Records</h2>
      <table className="display-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Roll No</th>
            <th>City</th>
            <th>Fees</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-data">No data found</td>
            </tr>
          ) : (
            students.map((stu, index) => (
              <tr key={stu._id}>
                <td>{index + 1}</td>
                <td>{stu.name}</td>
                <td>{stu.rollno}</td>
                <td>{stu.city}</td>
                <td>{stu.fees}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Display;
