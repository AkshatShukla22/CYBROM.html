import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const Edit = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rollnum: state?.rollnum || "",
    name: state?.name || "",
    city: state?.city || "",
    fees: state?.fees || ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/student/${id}`, formData);
      alert("Record updated successfully");
      navigate("/");
    } catch (error) {
      console.error("Error updating record", error);
      alert("Failed to update record");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Record</h2>
      <input
        type="text"
        name="rollnum"
        placeholder="Roll No"
        value={formData.rollnum}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="city"
        placeholder="City"
        value={formData.city}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="fees"
        placeholder="Fees"
        value={formData.fees}
        onChange={handleInputChange}
      />
      <button onClick={handleUpdate}>Update</button>
      <button onClick={() => navigate("/")} style={{ marginLeft: "10px" }}>
        Cancel
      </button>
    </div>
  );
};

export default Edit;
