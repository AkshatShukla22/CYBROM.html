import { useState, useEffect } from "react";
import axios from "axios";

const Update = () => {
    const [mydata, setMydata] = useState([]);

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

    useEffect(() => {
        loadData();
    }, []);

    return (
        <>
            <h2>Welcome to update page</h2>
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Emp No</th>
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
                                <button>Edit</button> {/* Edit functionality to be added later */}
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
};

export default Update;