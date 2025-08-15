import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Edit = () => {
    const { state } = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        productNum: state?.productNum || "",
        productName: state?.productName || "",
        productQuantity: state?.productQuantity || "",
        netPrice: state?.netPrice || "",
        customerName: state?.customerName || ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
        <>
            <h1>This is Edit Page</h1>
            <input type='text' name='productNum' placeholder='Product Number' value={formData.productNum} onChange={handleInputChange} /> <br />
            <input type='text' name='productName' placeholder='Product Name' value={formData.productName} onChange={handleInputChange} /> <br />
            <input type='text' name='productQuantity' placeholder='Product Quantity' value={formData.productQuantity} onChange={handleInputChange} /> <br />
            <input type='text' name='netPrice' placeholder='Net price' value={formData.netPrice} onChange={handleInputChange} /> <br />
            <input type='text' name='customerName' placeholder='Customer Name' value={formData.customerName} onChange={handleInputChange} /> <br />
            <button onClick={handleUpdate}>Update</button>
            <button onClick={() => navigate("/")}>Cancel</button>
        </>
    );
};

export default Edit;
