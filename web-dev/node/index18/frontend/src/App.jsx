import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [data, setData] = useState(null);

  const setCookies = () => {
    fetch(`http://localhost:8000/cookie?myname=${name}&course=${course}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.text())
      .then((msg) => {
        console.log(msg);
        alert(msg);
      })
      .catch((err) => console.error(err));
  };

  const getCookies = () => {
    fetch("http://localhost:8000/display", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Cookies from server:", result);
        setData(result);
      })
      .catch((err) => console.error(err));
  };

  const clearCookies = () => {
    fetch("http://localhost:8000/clear-cookie", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.text())
      .then((msg) => {
        console.log(msg);
        alert(msg);
        setData(null);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Cookie Playground</h1>

      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginRight: "20px" }}
      />

      <input
        type="text"
        placeholder="Enter course"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
      />

      <div style={{ marginTop: "20px" }}>
        <button onClick={setCookies} style={{ marginRight: "20px" }}>
          Set Cookie
        </button>
        <button onClick={getCookies} style={{ marginRight: "20px" }}>
          Get Cookie
        </button>
        <button onClick={clearCookies}>Clear Cookie</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {data ? (
          <p>
            <b>Name:</b> {data.name} <br />
            <b>Course:</b> {data.course}
          </p>
        ) : (
          <p>No cookies found</p>
        )}
      </div>
    </div>
  );
}

export default App;
