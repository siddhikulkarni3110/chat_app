import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Ask for a username when the user joins
    const name = prompt('Enter your username:');
    setUsername(name || 'Anonymous');

    // Connect to the FastAPI WebSocket server
    const ws = new WebSocket('ws://localhost:8000/ws');

    // Log WebSocket connection events
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Handle incoming messages
    ws.onmessage = (event) => {
      console.log('Received message:', event.data); // Log received messages
      setChat((prev) => [...prev, event.data]); // Append incoming message to chat
    };

    setSocket(ws);

    // Clean up WebSocket connection on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault(); // Prevent page reload on form submit
    if (message.trim() !== '') {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const messageToSend = `${username}: ${message}`;
        console.log('Sending message:', messageToSend); // Log the message being sent
        
        // Add the message to the chat immediately for the current user
        setChat((prev) => [...prev, messageToSend]); // Add current user's message
        socket.send(messageToSend); // Send the message to the WebSocket server
        setMessage(''); // Clear input after sending
      } else {
        console.error('WebSocket is not open');
      }
    }
  };

  return (
    <div className='app-container'>

    
      <div className="chat-box">
        <h1 className="chat-header">Group Discussion</h1>

        <form onSubmit={sendMessage} className="chat-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message"
            className="chat-input"
          />
          <button type="submit" className="chat-button">
            Send
          </button>
        </form>

        <div className="chat-messages">
          {chat.map((msg, index) => (
            <p key={index} className="chat-message">
              <strong className="chat-username">{msg}</strong>
            </p>
          ))}
        </div>
      </div>
    
    </div>
  );
}

export default App;
