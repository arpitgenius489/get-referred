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
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Helper to fetch backend user info
  const fetchBackendUser = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBackendUser(response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired or invalid
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
        return { requiresVerification: true };
      }
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Ensure we have a valid user and token
      if (!result.user) {
        throw new Error('Unable to get your Google account information. Please try again.');
      }
      
      const token = await result.user.getIdToken(true); // Force token refresh
      
      if (!token) {
        throw new Error('Unable to verify your Google account. Please try again.');
      }
      
      try {
        const response = await axios.post(`${API_URL}/auth/google`, { idToken: token });
        
        const userData = await fetchBackendUser(token);
        
        if (userData.requiresVerification) {
          return { requiresVerification: true };
        }
        
        return { success: true };
      } catch (error) {
        await signOut(auth);
        
        // Handle different error cases
        if (error.response) {
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
      
      // Handle Firebase specific errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign in was cancelled. Please try again.');
      }
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Please allow pop-ups for this website to sign in with Google.');
      }
      if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign in was cancelled. Please try again.');
      }
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Please check your internet connection and try again.');
      }
      if (error.code === 'auth/too-many-requests') {
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
    setDeleting(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('No user is currently signed in.');
        setLoading(false);
        setDeleting(false);
        return false;
      }
      const idToken = await user.getIdToken();
      // Call backend to delete user
      const response = await axios.delete(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      // Only proceed if backend returns { success: true }
      if (
        response.status === 200 &&
        response.data &&
        response.data.success === true &&
        response.data.message === 'User deleted successfully'
      ) {
        try {
          await user.delete();
        } catch (e) {
          setError('Failed to delete account from Firebase.');
        }
        setLoading(false);
        setDeleting(false);
        return true;
      } else {
        setError('Failed to delete account. Please try again.');
        setLoading(false);
        setDeleting(false);
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to delete account.');
      setLoading(false);
      setDeleting(false);
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
        try {
          const token = await user.getIdToken();
          await fetchBackendUser(token);
        } catch (error) {
          setError('Failed to fetch user data. Please sign in again.');
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setBackendUser(null);
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