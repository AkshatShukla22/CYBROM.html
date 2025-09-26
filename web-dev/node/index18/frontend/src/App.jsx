import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('message', (messageData) => {
      setMessages(prev => [...prev, { ...messageData, type: 'message' }]);
    });

    newSocket.on('userJoined', (notification) => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        message: notification, 
        type: 'notification' 
      }]);
    });

    newSocket.on('userLeft', (notification) => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        message: notification, 
        type: 'notification' 
      }]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim() && socket) {
      socket.emit('join', username.trim());
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('message', { message: message.trim() });
      setMessage('');
    }
  };

  if (!isJoined) {
    return (
      <div>
        <h1>Chat Application</h1>
        <form onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit">Join Chat</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h2>Chat Room - Welcome {username}!</h2>
      
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === 'notification' ? (
              <div>{msg.message}</div>
            ) : (
              <div>
                <strong>{msg.username}:</strong> {msg.message}
                <small> ({msg.timestamp})</small>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;