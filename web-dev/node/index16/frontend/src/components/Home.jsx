import { useState } from "react";
import axios from "axios";

const Home = () => {
  const [image, setImage] = useState("");

  const handleImage = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    let api = "http://localhost:8000/upload";
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(api, formData);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <h1> Welcome To Home Page</h1>
      Upload Image : <input type="file" onChange={handleImage} />
      <button onClick={handleSubmit}> Upload </button>
    </>
  );
};

export default Home;
