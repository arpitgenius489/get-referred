import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function MyRequests() {
  const { getToken, currentUser, backendUser, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [ratingInput, setRatingInput] = useState({}); // To manage rating input for each request

  async function fetchMyRequests() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/api/referral-requests/my-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch requests: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        // Fetch requests logic here
        setRequests([]); // Placeholder
      } catch (err) {
        setError(err.message || 'Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };

    if (backendUser) {
      fetchRequests();
    }
  }, [backendUser]);

  // Show loading state while auth is loading
  if (authLoading) {
    return <LoadingPlaceholder type="table" count={1} />;
  }

  // Show loading state while requests are being fetched
  if (loading) {
    return <LoadingPlaceholder type="table" count={1} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new request.</p>
      </div>
    );
  }

  const handleRatingChange = (requestId, value) => {
    setRatingInput(prev => ({ ...prev, [requestId]: value }));
  };

  async function handleRateRequest(requestId) {
    setLoading(true);
    setError('');
    setMessage('');
    const rating = ratingInput[requestId];

    if (rating === undefined || rating < 1 || rating > 5) {
      setError('Please enter a rating between 1 and 5.');
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      await axios.put(`${API_URL}/api/referral-requests/${requestId}/rating`, 
        {
          rating: parseInt(rating, 10),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('Rating submitted successfully!');
      // Refresh requests to show updated rating or remove rating input
      fetchMyRequests(); 
    } catch (err) {
      setError('Failed to submit rating: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">My Referral Requests</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.company}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.rating ? request.rating : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.status === 'HIRED' && !request.rating && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        className="input w-20 text-center"
                        placeholder="1-5"
                        value={ratingInput[request.id] || ''}
                        onChange={(e) => handleRatingChange(request.id, e.target.value)}
                      />
                      <button
                        onClick={() => handleRateRequest(request.id)}
                        disabled={loading}
                        className="btn btn-primary btn-sm"
                      >
                        Rate
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}