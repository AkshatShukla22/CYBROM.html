import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/cookie", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.text())
      .then((msg) => console.log("Cookie set response:", msg))
      .catch((err) => console.error(err));

    fetchCookies();
  }, []);

  const fetchCookies = () => {
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
        setData(null); 
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h1>Hello World</h1>

      {data ? (
        <p>
          Name: {data.name} <br />
          Course: {data.course}
        </p>
      ) : (
        <p>No cookies found</p>
      )}

      <button onClick={fetchCookies}>Refresh Cookies</button>
      <button onClick={clearCookies}>Remove Cookies</button>
    </>
  );
}

export default App;
