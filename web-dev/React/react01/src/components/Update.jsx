import { useState, useEffect } from "react";
import axios from "axios";

const Update = () => {
    const [mydata, setMydata] = useState([]);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({});

    const loadData = async () => {
        try {
            const response = await axios.get("http://localhost:3000/student");
            setMydata(response.data); 
        } catch (error) {
            console.error("Error loading data", error);
        }
    };

    const recDelete = async (id) => {
        let confirmDelete = window.confirm("Are you sure you want to delete?");
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:3000/student/${id}`);
                alert("Record deleted successfully");
                loadData();
            } catch (error) {
                console.error("Error deleting record", error);
                alert("Failed to delete record");
            }
        }
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        setFormData({
            rollnum: item.rollnum,
            name: item.name,
            city: item.city,
            fees: item.fees
        })
    }

    const handleInputChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        setFormData({...formData, [name]: value});
    }

    const handleUpdate = async () => {
        try{
            await axios.put(`http://localhost:3000/student/${editId}`, formData);
            setEditId(null);
            setFormData({});
            loadData();
        }
        catch{
            console.error("Error updating record", error);
            alert("failed to update record");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <>
            <h2>Welcome to update page</h2>
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>City</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {mydata.map((item, index) => (
                        <tr key={index}>
                            <td>{item.rollnum}</td>
                            <td>{item.name}</td>
                            <td>{item.city}</td>
                            <td>{item.fees}</td>
                            <td>
                                <button onClick={()=>handleEdit(item)}>Edit</button>
                            </td>
                            <td>
                                <button onClick={() => recDelete(item.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editId !==null && (
                <div style={{ marginTop: "20px" }}>
                <h3>Edit Record</h3>
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
                    <button onClick={() => setEditId(null)} style={{ marginLeft: "10px" }}>
                        Cancel
                    </button>
                </div>
       
            )}
        </>
    );
};

export default Update;