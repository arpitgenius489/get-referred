import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';
import LoadingPlaceholder from './LoadingPlaceholder';

const STATUS_OPTIONS = [
  'ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'HIRED'
];

export default function ViewReferrals() {
  const { getBackendUser, currentUser } = useAuth();
  const backendUser = getBackendUser();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/api/referrals/me`;
        if (statusFilter !== 'ALL') {
          url = `${API_URL}/api/referrals/filter?status=${statusFilter}`;
        }
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${currentUser?.accessToken || currentUser?.token}`,
          },
        });
        setReferrals(response.data.data || []);
      } catch (error) {
        setReferrals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, statusFilter]);

  if (loading) return <LoadingPlaceholder />;

  return (
    <div className="">
      <h2 className="text-2xl font-semibold mb-10 text-gray-900">View Referrals</h2>
      <div className="mb-6 flex gap-2 items-center">
        <label htmlFor="statusFilter" className="font-medium text-gray-700">Filter by status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      {referrals.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <span className="text-gray-500 text-lg font-medium" style={{marginTop: '2rem'}}>No referrals found.</span>
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
              <div className="text-gray-700 mb-1">Employee: <span className="font-medium">{referral.employeeName || 'Not assigned'}</span></div>
              {referral.rating && <div className="text-gray-700 mb-1">Rating: <span className="font-medium">{referral.rating}</span></div>}
              <div className="text-gray-500 text-xs">Created: {referral.createdAt?.slice(0,10)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
