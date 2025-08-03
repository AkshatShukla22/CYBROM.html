import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BackendUrl from '../utils/BackendUrl';

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
    <div className="container" style={{ marginTop: '30px' }}>
      <h2>Student Records</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Roll No</th>
            <th>City</th>
            <th>Fees</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No data found</td>
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
