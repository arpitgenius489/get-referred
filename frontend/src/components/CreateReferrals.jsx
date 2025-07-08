import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function CreateReferrals() {
  const [formData, setFormData] = useState({
    jobId: '',
    companyName: '',
    linkedinUrl: '',
    githubUrl: '',
    resumeLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await axios.post(`${API_URL}/api/referrals`, formData, {
        headers: {
          Authorization: `Bearer ${currentUser?.accessToken || currentUser?.token}`,
        },
      });
      setSuccess(true);
      setFormData({ jobId: '', companyName: '', linkedinUrl: '', githubUrl: '', resumeLink: '' });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create referral. Please check your input and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingPlaceholder />;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Referral</h2>
      {success && <div className="mb-4 p-3 rounded bg-green-50 text-green-700 font-medium">Referral created successfully!</div>}
      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 font-medium">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="jobId" className="block text-sm font-medium text-gray-700 mb-1">Job ID/Title<span className="text-red-500">*</span></label>
          <input
            type="text"
            id="jobId"
            name="jobId"
            value={formData.jobId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name<span className="text-red-500">*</span></label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
          <input
            type="url"
            id="linkedinUrl"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
          <input
            type="url"
            id="githubUrl"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="resumeLink" className="block text-sm font-medium text-gray-700 mb-1">Resume Link</label>
          <input
            type="url"
            id="resumeLink"
            name="resumeLink"
            value={formData.resumeLink}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 shadow"
          >
            Create Referral
          </button>
        </div>
      </form>
    </div>
  );
}
