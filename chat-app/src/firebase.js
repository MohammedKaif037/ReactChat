// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import axios from 'axios';

const firebaseConfig = {
  //your firebase config mine hidden due to security reasons
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
