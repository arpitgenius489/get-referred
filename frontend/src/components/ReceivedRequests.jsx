import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function ReceivedRequests() {
  const { getToken, currentUser, backendUser, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'hired'

  async function fetchReceivedRequests() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = await getToken();
      let url = `${API_URL}/api/referral-requests/received-requests`;
      if (filter === 'pending') {
        url = `${API_URL}/api/referral-requests/pending`;
      } else if (filter === 'hired') {
        url = `${API_URL}/api/referral-requests/hired`;
      }

      const response = await axios.get(url, {
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
    if (backendUser) {
      fetchReceivedRequests();
    }
  }, [getToken, filter, backendUser]); // Re-fetch when filter changes

  async function handleUpdateStatus(requestId, status) {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = await getToken();
      await axios.put(`${API_URL}/api/referral-requests/${requestId}/status`, 
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(`Request ${requestId} status updated to ${status} successfully!`);
      fetchReceivedRequests(); // Refresh the list
    } catch (err) {
      setError('Failed to update request status: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

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
        <p className="mt-1 text-sm text-gray-500">You haven't received any referral requests yet.</p>
      </div>
    );
  }

  return (
    <div className="card mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Received Referral Requests</h2>
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="filter" className="mr-2 text-gray-700">Filter by status:</label>
        <select 
          id="filter" 
          className="input w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="hired">Hired</option>
        </select>
      </div>

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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(request.id, 'ACCEPTED')}
                        disabled={loading}
                        className="btn btn-primary btn-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(request.id, 'REJECTED')}
                        disabled={loading}
                        className="btn btn-secondary btn-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {request.status !== 'PENDING' && (
                    <span className="text-gray-500">No actions available</span>
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