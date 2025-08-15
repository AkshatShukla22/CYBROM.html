import { useEffect, useState } from 'react';
import axios from 'axios';
import BackendUrl from '../utils/BackendUrl';
import '../styles/Search.css';

const Search = () => {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);

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

  useEffect(() => {
    const lower = query.toLowerCase();
    const result = students.filter((stu) =>
      stu.name.toLowerCase().includes(lower) || stu.rollno.toLowerCase().includes(lower)
    );
    setFiltered(result);
  }, [query, students]);

  return (
    <div className="search-container">
      <h2 className="search-title">Search Student</h2>
      <input
        type="text"
        placeholder="Enter name or roll no"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />

      <table className="search-table">
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
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-data">No matching records</td>
            </tr>
          ) : (
            filtered.map((stu, index) => (
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

export default Search;
