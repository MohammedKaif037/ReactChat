import React, { useState, useEffect } from 'react';
import { api } from '../firebase';

function ChatInterface({ chatSessionId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get(`chat-messages/${chatSessionId}/`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      }
    };

    fetchMessages();
  }, [chatSessionId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      await api.post('chat-messages/', {
        chat_session: chatSessionId,
        content: newMessage,
        sender: currentUser.uid,
      });

      setNewMessage('');
      // Refresh the messages list
      const response = await api.get(`chat-messages/${chatSessionId}/`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.sender.username}: </strong>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatInterface;
