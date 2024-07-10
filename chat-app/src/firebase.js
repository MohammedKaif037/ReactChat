// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import axios from 'axios';

const firebaseConfig = {
  apiKey: "AIzaSyAt80XvD65YDpM9UuIfi5GCJJh9eoUGh18",

  authDomain: "reactchatapp-df8d3.firebaseapp.com",

  projectId: "reactchatapp-df8d3",

  storageBucket: "reactchatapp-df8d3.appspot.com",

  messagingSenderId: "408420598417",

  appId: "1:408420598417:web:7cce715e95807683d17530",

  measurementId: "G-N9XX8CH317"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Django API
const API_URL = 'http://localhost:8000/api/';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Function to sync Firebase user with Django
export const syncUser = async (firebaseUser) => {
  if (firebaseUser) {
    const token = await firebaseUser.getIdToken();
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      await api.post('sync-user/', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],  // Use display name or email username as fallback
      });
    } catch (error) {
      console.error('Error syncing user:', error);
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
