import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import axios from 'axios';
import { auth, googleProvider } from '../config/firebase';
import { API_URL } from '../config/api';
import { GoogleAuthProvider } from 'firebase/auth';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Access-Control-Allow-Credentials'] = true;

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await signOut(auth);
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Helper to fetch backend user info
  const fetchBackendUser = async (token) => {
    try {
      console.log('Fetching backend user info...');
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Backend user info received:', response.data);
      setBackendUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching backend user:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, signing out...');
        await signOut(auth);
        setBackendUser(null);
        setCurrentUser(null);
        setLoading(false);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = '/auth';
        return null;
      }
      if (error.response?.status === 403 && error.response?.data?.message?.includes('email not verified')) {
        console.log('Email not verified, returning verification required');
        return { requiresVerification: true };
      }
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google sign in...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign in successful, getting token...');
      
      // Ensure we have a valid user and token
      if (!result.user) {
        console.error('No user object in result');
        throw new Error('Unable to get your Google account information. Please try again.');
      }
      
      const token = await result.user.getIdToken(true); // Force token refresh
      console.log('Token obtained:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.error('No token received from getIdToken');
        throw new Error('Unable to verify your Google account. Please try again.');
      }
      
      try {
        console.log('Sending token to backend...');
        const response = await axios.post(`${API_URL}/auth/google`, { idToken: token });
        console.log('Backend response received:', response.status);
        
        const userData = await fetchBackendUser(token);
        console.log('User data fetched:', userData ? 'Yes' : 'No');
        
        if (userData.requiresVerification) {
          console.log('User requires email verification');
          return { requiresVerification: true };
        }
        
        console.log('Google sign in completed successfully');
        return { success: true };
      } catch (error) {
        console.error('Backend request failed:', error.response?.data || error.message);
        // If backend request fails, sign out from Firebase
        await signOut(auth);
        
        // Handle different error cases
        if (error.response) {
          console.log('Error response status:', error.response.status);
          switch (error.response.status) {
            case 400:
              throw new Error('Unable to sign in. Please try again.');
            case 401:
              throw new Error('Your session has expired. Please sign in again.');
            case 403:
              throw new Error('Access denied. Please contact support if this persists.');
            case 500:
              throw new Error('We\'re experiencing technical difficulties. Please try again later.');
            default:
              throw new Error('Unable to sign in. Please try again.');
          }
        }
        throw new Error('Unable to connect to our servers. Please check your internet connection and try again.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      
      // Handle Firebase specific errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
        throw new Error('Sign in was cancelled. Please try again.');
      }
      if (error.code === 'auth/popup-blocked') {
        console.log('Popup was blocked by browser');
        throw new Error('Please allow pop-ups for this website to sign in with Google.');
      }
      if (error.code === 'auth/cancelled-popup-request') {
        console.log('Popup request was cancelled');
        throw new Error('Sign in was cancelled. Please try again.');
      }
      if (error.code === 'auth/network-request-failed') {
        console.log('Network request failed');
        throw new Error('Please check your internet connection and try again.');
      }
      if (error.code === 'auth/too-many-requests') {
        console.log('Too many sign in attempts');
        throw new Error('Too many sign in attempts. Please try again in a few minutes.');
      }
      
      // For any other errors, use the error message or a default message
      throw new Error('Unable to sign in with Google. Please try again.');
    }
  };

  // Sign in or sign up with email and password
  const handleEmailAuth = async (email, password, isSignUp = false) => {
    try {
      setLoading(true);
      setError(null);

      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const token = await userCredential.user.getIdToken();
      const response = await axios.post(`${API_URL}/auth/login`, { token });

      if (response.status === 403) {
        // Email not verified, redirect to verification page
        navigate('/verify-email');
        return;
      }

      if (response.status === 200) {
        setBackendUser(response.data);
        setCurrentUser(userCredential.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  async function logout() {
    try {
      console.log('Starting logout process...');
      await signOut(auth);
      console.log('Firebase sign out successful');
      setBackendUser(null);
      console.log('User state cleared');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Unable to sign out. Please try again.');
    }
  }

  // Delete account
  const deleteAccount = async () => {
    try {
      // 1. Get the current Firebase ID token
      const idToken = await auth.currentUser?.getIdToken();
      
      if (!idToken) {
        throw new Error('No authentication token available');
      }

      // 2. Make the deletion request
      const response = await axios.delete(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      // 3. Handle success response
      if (response.status === 200 && response.data.status === 'success') {
        // 4. Sign out from Firebase after successful deletion
        await signOut(auth);
        
        // 5. Clear state
        setBackendUser(null);
        setCurrentUser(null);
        setLoading(false);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        
        return { success: true };
      }

      throw new Error('Failed to delete account');
    } catch (error) {
      // Handle different error cases
      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error('Invalid token format: ' + error.response.data.message);
          case 401:
            throw new Error('Authentication failed: ' + error.response.data.message);
          case 500:
            throw new Error('Server error: ' + error.response.data.message);
          default:
            throw new Error(error.response.data.message || 'Failed to delete account');
        }
      }
      throw error;
    }
  };

  // Get current user's token
  async function getToken() {
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  }

  // Get backend user
  function getBackendUser() {
    return backendUser;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const token = await user.getIdToken();
        await fetchBackendUser(token);
      } else {
        setBackendUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    backendUser,
    getBackendUser,
    loginWithGoogle,
    handleEmailAuth,
    logout,
    deleteAccount,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}