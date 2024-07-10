import React, { useState, useEffect } from 'react';
import { api } from '../firebase';

export const interestsList = [
  'Travel', 'Foodie', 'Movies', 'Books', 'Sports', 'Art', 'Technology', 'Nature',
  'Fashion', 'Photography', 'History', 'Science', 'Space', 'DIY', 'Wellness'
];

function InterestList({ currentUser }) {
  const [message, setMessage] = useState('');
  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    fetchUserInterests();
  }, []);

  const fetchUserInterests = async () => {
    try {
      const response = await api.get('user-interests/');
      setUserInterests(response.data.interests);
    } catch (error) {
      console.error('Error fetching user interests:', error);
    }
  };

  const handleInterestClick = async (interest) => {
    try {
      await api.post('user-interests/', { interest });
      setMessage(`Added interest: ${interest}`);
      fetchUserInterests();
    } catch (error) {
      console.error('Error adding interest:', error);
      setMessage('Error adding interest. Please try again.');
    }
  };

  return (
    <div>
      <h2>Interests</h2>
      {message && <p>{message}</p>}
      <div>
      {interestsList.map((interest) => (
        <button
          key={interest}
          onClick={() => handleInterestClick(interest)}
          style={{ backgroundColor: userInterests.includes(interest) ? 'lightblue' : 'white' }}
        >
          {interest}
        </button>
      ))}
      </div>
    </div>
  );
}

export default InterestList;