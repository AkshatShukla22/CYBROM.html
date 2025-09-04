import React, { useState, useEffect } from "react";
import axios from "axios";

const Home2 = () => {
  const [input, setInput] = useState({});
  const [authors, setAuthors] = useState([]);

  const fetchAuthors = async () => {
    try {
      const res = await axios.get("http://localhost:8000/author/authorall");
      setAuthors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:8000/author/authorsave", {
        email: input.email,
        authorName: input.authorName,
        bookname: input.bookname,
        price: input.price,
      });

      setInput({});
      fetchAuthors();
      alert("Author and book saved successfully!");
    } catch (err) {
      console.error("AxiosError:", err.response?.data || err.message);
      alert("Error saving data: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <h1>Author & Books Management</h1>

      <div>
        <h3>Add Author with Book</h3>
        Author Name: <input 
          type="text" 
          name="authorName" 
          value={input.authorName || ""} 
          onChange={handleInput} 
          placeholder="Enter author name"
        /> <br />
        Email: <input 
          type="email" 
          name="email" 
          value={input.email || ""} 
          onChange={handleInput} 
          placeholder="Enter email"
        /> <br />
        Book Name: <input 
          type="text" 
          name="bookname" 
          value={input.bookname || ""} 
          onChange={handleInput} 
          placeholder="Enter book name"
        /> <br />
        Price: <input 
          type="number" 
          name="price" 
          value={input.price || ""} 
          onChange={handleInput} 
          placeholder="Enter price"
          step="0.01"
        /> <br /><br />

        <button onClick={handleSubmit}>Submit</button>
      </div>

      <hr />

      <h2>Authors and Their Books</h2>
      {authors.length === 0 ? (
        <p>No authors found</p>
      ) : (
        <div>
          {authors.map((author) => (
            <div key={author._id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
              <h3>Author: {author.authorName}</h3>
              <p><strong>Email:</strong> {author.email}</p>
              <p><strong>Created:</strong> {new Date(author.createdAt).toLocaleDateString()}</p>
              
              <h4>Books:</h4>
              {author.books && author.books.length > 0 ? (
                <table border="1" cellPadding="5" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Book Name</th>
                      <th>Price</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {author.books.map((book) => (
                      <tr key={book._id}>
                        <td>{book.bookname}</td>
                        <td>{book.price}</td>
                        <td>{new Date(book.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No books found for this author</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home2;