import { useState, useEffect } from "react";
import BackendURL from "../utils/BackendUrl";
import axios from "axios";
import "../styles/Update.css";

const Update = () => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({
    _id: "",
    name: "",
    rollno: "",
    city: "",
    fees: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${BackendURL}students/all`);
      setStudents(res.data);
    } catch (error) {
      alert("Failed to load data: " + error.message);
    }
  };

  const handleEditClick = (student) => {
    setEditData(student);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await axios.delete(`${BackendURL}students/delete/${id}`);
      fetchStudents();
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    await axios.put(`${BackendURL}students/update/${editData._id}`, editData);
    setShowModal(false);
    fetchStudents();
  };

  return (
    <div className="update-container">
      <h2 className="update-heading">Student Records</h2>
      
      <table className="update-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Name</th>
          <th>Roll No</th>
          <th>City</th>
          <th>Fees</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.length === 0 ? (
          <tr>
            <td colSpan="6" className="no-data">No data available</td>
          </tr>
        ) : (
          students.map((stu, index) => (
            <tr key={stu._id}>
              <td>{index + 1}</td>
              <td>{stu.name}</td>
              <td>{stu.rollno}</td>
              <td>{stu.city}</td>
              <td>{stu.fees}</td>
              <td>
                <button className="btn edit-btn" onClick={() => handleEditClick(stu)}>Edit</button>
                <button className="btn delete-btn" onClick={() => handleDelete(stu._id)}>Delete</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Edit Student</h4>
            <input name="name" value={editData.name} onChange={handleChange} placeholder="Name" />
            <input name="rollno" value={editData.rollno} onChange={handleChange} placeholder="Roll No" />
            <input name="city" value={editData.city} onChange={handleChange} placeholder="City" />
            <input name="fees" value={editData.fees} onChange={handleChange} placeholder="Fees" />

            <div className="modal-actions">
              <button className="btn btn-success" onClick={handleUpdate}>Save</button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Update;
