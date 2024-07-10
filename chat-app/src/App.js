import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth, syncUser, api } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/login';
import Register from './components/signup';
import UserList from './components/userList';
import InterestList from './components/interestList';
import Chat from './components/chat';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncUser(firebaseUser);
        setUser(firebaseUser);
        fetchUsername(firebaseUser.uid);
        setupWebSocket(firebaseUser.uid);
      } else {
        setUser(null);
        setUsername('');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const setupWebSocket = (userId) => {
    const socket = new WebSocket('ws://localhost:8000/ws/chat/');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat_notification') {
        if (data.action === 'accept' && data.receiver === userId) {
          setActiveChat(data.sender);
        }
      }
    };

    return () => {
      socket.close();
    };
  };


  const fetchUsername = async (uid) => {
    try {
      const response = await api.get(`user-profile/${uid}/`);
      setUsername(response.data.username);
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1>Chat Application</h1>
      {user ? (
        <>
          <div>
            <p>Welcome, {username}!</p>
            <button onClick={() => auth.signOut()}>Logout</button>
          </div>
          {activeChat ? (
            <Chat currentUser={user} userId={activeChat} onClose={() => setActiveChat(null)} />
          ) : (
            <Routes>
              <Route path="/" element={
                <>
                  <InterestList currentUser={user} />
                  <UserList currentUser={user} setActiveChat={setActiveChat} />                </>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  );
}

export default App;