import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../firebase';
import { Link } from 'react-router-dom';
import { interestsList } from './interestList';

function UserList({ currentUser, setActiveChat }) {
  const [users, setUsers] = useState([]);
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [selectedInterest, setSelectedInterest] = useState('');
  const [chatRequests, setChatRequests] = useState([]);
  const [socket, setSocket] = useState(null);

  const connectWebSocket = useCallback(() => {
    const newSocket = new WebSocket('ws://localhost:8000/ws/chat/');
    newSocket.onopen = () => {
      console.log('WebSocket connected');
    };
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
      if (data.type === 'new_interest') {
        console.log('Received new interest:', data);
        setChatRequests(prevRequests => {
          const exists = prevRequests.some(request => request.sender.id === data.sender.id);
          if (!exists) {
            return [...prevRequests, data];
          }
          return prevRequests;
        });
      }
    };
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    newSocket.onclose = (event) => {
      console.log('WebSocket disconnected:', event);
      setTimeout(connectWebSocket, 5000);
    };
    setSocket(newSocket);
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (selectedInterest) {
      fetchMatchedUsers();
    }
    fetchReceivedInterests();
  }, [selectedInterest]);

  useEffect(() => {
    fetchChatRequests();
  }, []);

  useEffect(() => {
    console.log('Chat Requests:', chatRequests);
    console.log('Received Interests:', receivedInterests);
  }, [chatRequests, receivedInterests]);

  const fetchMatchedUsers = async () => {
    try {
      const response = await api.get(`matched-users/?interest=${selectedInterest}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching matched users:', error);
    }
  };

  const fetchReceivedInterests = async () => {
    try {
      const response = await api.get('interests/received/');
      setReceivedInterests(response.data);
    } catch (error) {
      console.error('Error fetching received interests:', error);
    }
  };

  const fetchChatRequests = async () => {
    try {
      const response = await api.get('chat-requests/');
      setChatRequests(response.data);
    } catch (error) {
      console.error('Error fetching chat requests:', error);
    }
  };

  const sendInterest = async (userId) => {
    try {
      const response = await api.post('interests/', { receiver: userId });
      console.log('Interest sent response:', response.data);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'send_interest',
          receiver: userId,
          sender: currentUser.uid
        }));
      } else {
        console.error('WebSocket is not connected');
      }
      alert('Interest sent successfully!');
      await fetchReceivedInterests();
      await fetchChatRequests(); // Refresh the received interests
    } catch (error) {
      console.error('Error sending interest:', error);
      alert('Failed to send interest. Please try again.');
    }
  };

  const handleChatRequest = async (interestId, action) => {
    console.log('Interest ID:', interestId);
    console.log('Action:', action);
    if (!interestId) {
      console.error('Interest ID is undefined');
      return;
    }

    try {
      const response = await api.post(`interests/${interestId}/${action}/`);
      if (response.status === 200) {
        await fetchChatRequests();
        if (action === 'accept') {
          console.log(`Chat accepted with interest ${interestId}`);
          setActiveChat(interestId);
        } else {
          console.log(`Chat rejected with interest ${interestId}`);
          alert('Chat request rejected');
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing chat request:`, error);
    }
  };

  return (
    <div>
      <h2>Matched Users</h2>
      <select onChange={(e) => setSelectedInterest(e.target.value)} value={selectedInterest}>
        <option value="">Select an interest</option>
        {interestsList.map((interest) => (
          <option key={interest} value={interest}>{interest}</option>
        ))}
      </select>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} ({user.email})
            <button onClick={() => sendInterest(user.id)}>Send Interest</button>
            <Link to={`/chat/${user.id}`}>Chat</Link>
          </li>
        ))}
      </ul>

      <h2>Chat Requests</h2>
      {chatRequests.length === 0 ? (
        <p>No chat requests</p>
      ) : (
        <ul>
          {chatRequests.map((request) => (
            <li key={request.id}>
              User {request.sender.username} wants to chat with you
              <button onClick={() => handleChatRequest(request.id, 'accept')}>Accept</button>
              <button onClick={() => handleChatRequest(request.id, 'reject')}>Reject</button>
            </li>
          ))}
        </ul>
      )}

      <h2>Received Interests</h2>
      {receivedInterests.length === 0 ? (
        <p>No received interests</p>
      ) : (
        <ul>
          {receivedInterests.map((interest) => (
            <li key={interest.id}>
              From: {interest.sender.username}
              <button onClick={() => handleChatRequest(interest.id, 'accept')}>Accept</button>
              <button onClick={() => handleChatRequest(interest.id, 'reject')}>Reject</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserList;