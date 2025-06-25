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

  // Sign in or sign up with email and password (robust flow, backend expects /api/auth/email and { idToken })
  const handleEmailAuth = async (email, password) => {
    setLoading(true);
    setError(null);
    let userCredential;
    try {
      // 1. Try to sign in
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error.code, error.message);
      // If user not found or invalid-credential (Firebase sometimes returns this instead of user-not-found)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          // 2. Try to create the user
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await sendEmailVerification(userCredential.user);
          // Send token to backend
          const idToken = await userCredential.user.getIdToken();
          await axios.post(`${API_URL}/auth/email`, { idToken });
          navigate('/verify-email');
          setLoading(false);
          return { requiresVerification: true };
        } catch (signupError) {
          console.error('Sign up error:', signupError.code, signupError.message);
          if (signupError.code === 'auth/email-already-in-use') {
            setError('Email already in use');
          } else if (signupError.code === 'auth/weak-password') {
            setError('Password should be at least 6 characters');
          } else if (signupError.code === 'auth/invalid-email') {
            setError('Invalid email format');
          } else {
            setError(signupError.message || 'Sign up failed');
          }
          setLoading(false);
          return { success: false };
        }
      } else if (error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
        setLoading(false);
        return { success: false };
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format');
        setLoading(false);
        return { success: false };
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
        setLoading(false);
        return { success: false };
      } else {
        setError(error.message || 'Sign in failed');
        setLoading(false);
        return { success: false };
      }
    }
    // 3. If sign-in succeeded, check verification
    try {
      const user = userCredential.user;
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        // Get the ID token and send to backend (in case user was created elsewhere but not verified)
        const idToken = await user.getIdToken();
        await axios.post(`${API_URL}/auth/email`, { idToken });
        navigate('/verify-email');
        setLoading(false);
        return { requiresVerification: true };
      }
      // 4. Get token and send to backend (correct endpoint and payload)
      const idToken = await user.getIdToken();
      const response = await axios.post(`${API_URL}/auth/email`, { idToken });
      if (response.status === 403) {
        // Email not verified, redirect to verification page
        navigate('/verify-email');
        setLoading(false);
        return { requiresVerification: true };
      }
      if (response.status === 200) {
        setBackendUser(response.data);
        setCurrentUser(user);
        navigate('/dashboard');
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false };
    } catch (finalError) {
      setError(finalError.message || 'Authentication failed.');
      setLoading(false);
      return { success: false };
    }
  };

  // Delete account function
  const deleteAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('No user is currently signed in.');
        setLoading(false);
        return false;
      }
      const idToken = await user.getIdToken();
      // Call backend to delete user
      const response = await axios.delete(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (response.status === 200 && response.data.status === 'success') {
        // Only after backend confirms, clear state and redirect
        setCurrentUser(null);
        setBackendUser(null);
        setLoading(false);
        localStorage.clear(); // Clear all local storage
        sessionStorage.clear();
        window.location.href = '/'; // Clear all session storage
        return true;
      } else {
        setError('Failed to delete account. Please try again.');
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Delete account error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to delete account.');
      setLoading(false);
      return false;
    }
  };

  // Auth state listener (to persist user state)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        // User is signed in
        setCurrentUser(user);
        console.log('User signed in:', user.email);
        try {
          const token = await user.getIdToken();
          await fetchBackendUser(token);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to fetch user data. Please sign in again.');
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setBackendUser(null);
        console.log('User signed out');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    backendUser,
    loading,
    error,
    loginWithGoogle,
    handleEmailAuth,
    signOut: () => signOut(auth),
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}