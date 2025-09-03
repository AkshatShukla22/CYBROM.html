import React, { useState, useEffect } from "react";
import axios from "axios";

const Home2 = () => {
  const [input, setInput] = useState({});
  const [employees, setEmployees] = useState([]);

  // Fetch all employees from backend
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:8000/user/all");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:8000/user/add", {
        email: input.email,
        firstName: input.first,
        lastName: input.last,
      });

      setInput({});
      fetchEmployees(); 
    } catch (err) {
      console.error("AxiosError:", err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h1>Employee Data</h1>

      <div>
        Employee ID: <input type="text" name="id" value={input.id || ""} onChange={handleInput} /> <br />
        Email: <input type="email" name="email" value={input.email || ""} onChange={handleInput} /> <br />
        First Name: <input type="text" name="first" value={input.first || ""} onChange={handleInput} /> <br />
        Last Name: <input type="text" name="last" value={input.last || ""} onChange={handleInput} /> <br /><br />

        <button onClick={handleSubmit}>Submit</button>
      </div>

      <hr />

      <h2>Employees List</h2>
      {employees.length === 0 ? (
        <p>No employees found</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.email}</td>
                <td>{emp.firstName}</td>
                <td>{emp.lastName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Home2;
