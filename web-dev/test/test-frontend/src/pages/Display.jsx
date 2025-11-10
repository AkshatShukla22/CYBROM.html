import React, { useState, useEffect } from 'react';

const Display = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsResponse = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        
        const postsData = await postsResponse.json();
        
        setPosts(postsData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div>
        <h2>Data</h2>
        {posts.map(post => (
          <div key={post.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
            <p><strong>ID:</strong> {post.id}</p>
            <p><strong>Title:</strong> {post.title}</p>
            <p><strong>Body:</strong> {post.body}</p>
          </div>
        ))}
      </div>

    </>
  );
}

export default Display;