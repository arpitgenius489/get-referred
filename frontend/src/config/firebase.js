import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification 
} from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC710PQkJnRUOoe2uBCvVUSXRt1qhXjQ6s",
  authDomain: "get-referred-dev.firebaseapp.com",
  projectId: "get-referred-dev",
  storageBucket: "get-referred-dev.firebasestorage.app",
  messagingSenderId: "563963605696",
  appId: "1:563963605696:web:a36139fb70335e4fb47325",
  measurementId: "G-72FE1YSX5B"
};

// Initialize Firebase app only for Google OAuth and token verification
const app = initializeApp(firebaseConfig);

// Get auth instance for Google sign-in only
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'  // Always show account selector
});

// Export additional auth methods
export const emailAuth = {
  createUser: createUserWithEmailAndPassword,
  signIn: signInWithEmailAndPassword,
  sendVerification: sendEmailVerification
};

export default app;