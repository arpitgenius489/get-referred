import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../config/firebase';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyEmail() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check if email is verified
    if (currentUser.emailVerified) {
      navigate('/dashboard');
    }

    // Countdown timer for resend button
    const timer = timeLeft > 0 && setInterval(() => setTimeLeft(time => time - 1), 1000);
    return () => clearInterval(timer);
  }, [currentUser, timeLeft, navigate]);

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Send verification email using Firebase
      await sendEmailVerification(currentUser, {
        url: window.location.origin + '/auth',
      });
      
      setTimeLeft(60);
      setMessage('Verification email sent! Please check your inbox.');
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      setError('Failed to resend verification email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Sign out and redirect to login
    auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification email to {currentUser?.email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500">
                Please check your email and click the verification link to continue.
                If you don't see the email, check your spam folder.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleResendVerification}
                disabled={loading || timeLeft > 0}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${loading || timeLeft > 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
              >
                {loading 
                  ? 'Sending...' 
                  : timeLeft > 0 
                    ? `Resend in ${timeLeft}s` 
                    : 'Resend verification email'
                }
              </button>
            </div>

            <div className="text-sm text-center">
              <button
                onClick={handleBackToLogin}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Return to login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}