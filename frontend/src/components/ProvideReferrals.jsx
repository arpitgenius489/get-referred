import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';
import LoadingPlaceholder from './LoadingPlaceholder';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ProvideReferrals() {
  const { getBackendUser, currentUser } = useAuth();
  const backendUser = getBackendUser();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(true);

  const fetchReferrals = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/referrals/received`, {
        headers: {
          Authorization: `Bearer ${currentUser?.accessToken || currentUser?.token}`,
        },
      });
      setReferrals(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch referrals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
    // eslint-disable-next-line
  }, [currentUser]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/referrals/${id}/status`, JSON.stringify(newStatus), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.accessToken || currentUser?.token}`,
        },
      });
      fetchReferrals();
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  return (
    <div className="">
      <div className="flex items-center mb-10 gap-2">
        <h2 className="text-2xl font-semibold text-gray-900">Provide Referrals</h2>
        <button
          type="button"
          onClick={fetchReferrals}
          className="ml-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-300"
          aria-label="Refresh Referrals"
          title="Refresh Referrals"
        >
          <ArrowPathIcon className="w-5 h-5 text-gray-500 hover:text-primary-600 transition-colors" />
        </button>
      </div>
      {error && showError && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setShowError(false)} className="ml-2 text-lg font-bold leading-none rounded-full hover:bg-red-100 p-1 focus:outline-none" aria-label="Close notification">×</button>
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingPlaceholder type="referral-card" count={4} />
        </div>
      ) : referrals.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px] w-full">
          <span className="text-gray-500 text-lg font-medium text-center">
            No referrals found.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {referrals.map(referral => (
            <div key={referral.id} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-lg text-primary-700">{referral.jobId}</span>
                <span className="text-sm text-gray-500 font-semibold uppercase">{referral.status}</span>
              </div>
              <div className="text-gray-700 mb-1">Company: <span className="font-medium">{referral.companyName}</span></div>
              <div className="text-gray-700 mb-1">Job Seeker: <span className="font-medium">{referral.jobSeekerName}</span></div>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-4 rounded transition-colors duration-200 shadow"
                  onClick={() => handleStatusUpdate(referral.id, 'ACCEPTED')}
                >
                  Accept
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-4 rounded transition-colors duration-200 shadow"
                  onClick={() => handleStatusUpdate(referral.id, 'REJECTED')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
