import { useState, useEffect, useCallback } from 'react';

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [chatRequests, setChatRequests] = useState([]);
  const [receivedInterests, setReceivedInterests] = useState([]);

  const connectWebSocket = useCallback(() => {
    const newSocket = new WebSocket(url);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
      if (data.type === 'new_interest') {
        console.log('Received new interest:', data);
        setChatRequests((prevRequests) => {
          const exists = prevRequests.some((request) => request.sender === data.sender);
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
  }, [url]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connectWebSocket]);

  return { socket, chatRequests, setChatRequests, receivedInterests, setReceivedInterests };
};

export default useWebSocket;
