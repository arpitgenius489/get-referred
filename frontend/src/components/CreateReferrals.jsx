import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function CreateReferrals() {
  const { currentUser, getBackendUser } = useAuth();
  const backendUser = getBackendUser();
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobId: '',
    jobLink: '',
    companyName: '',
    linkedinUrl: '',
    githubUrl: '',
    resumeLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Prefill LinkedIn, GitHub, Resume from backendUser
  useEffect(() => {
    if (backendUser) {
      setFormData((prev) => ({
        ...prev,
        linkedinUrl: backendUser.linkedinLink || '',
        githubUrl: backendUser.githubLink || '',
        resumeLink: backendUser.resumeLink || '',
      }));
    }
  }, [backendUser]);

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
      setFormData({ jobTitle: '', jobId: '', jobLink: '', companyName: '', linkedinUrl: backendUser?.linkedinLink || '', githubUrl: backendUser?.githubLink || '', resumeLink: backendUser?.resumeLink || '' });
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
    <div className="">
      <h2 className="text-2xl font-semibold mb-10 text-gray-900">Create Referral</h2>
      {success && <div className="mb-4 p-3 rounded bg-green-50 text-green-700 font-medium">Referral created successfully!</div>}
      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 font-medium">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="jobTitle" className="form-label">Job Title<span className="text-red-500">*</span></label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            className="input"
            value={formData.jobTitle}
            onChange={handleChange}
            required
            placeholder="Enter job title"
          />
        </div>
        <div>
          <label htmlFor="jobId" className="form-label">Job ID</label>
          <input
            type="text"
            id="jobId"
            name="jobId"
            className="input"
            value={formData.jobId}
            onChange={handleChange}
            placeholder="Enter job ID"
          />
        </div>
        <div>
          <label htmlFor="jobLink" className="form-label">Job Link</label>
          <input
            type="url"
            id="jobLink"
            name="jobLink"
            className="input"
            value={formData.jobLink}
            onChange={handleChange}
            placeholder="Enter job link"
          />
        </div>
        <div>
          <label htmlFor="companyName" className="form-label">Company Name<span className="text-red-500">*</span></label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            className="input"
            value={formData.companyName}
            onChange={handleChange}
            required
            placeholder="Enter company name"
          />
        </div>
        <div>
          <label htmlFor="linkedinUrl" className="form-label">LinkedIn URL</label>
          <input
            type="url"
            id="linkedinUrl"
            name="linkedinUrl"
            className="input"
            value={formData.linkedinUrl}
            onChange={handleChange}
            placeholder="Enter your LinkedIn URL"
          />
        </div>
        <div>
          <label htmlFor="githubUrl" className="form-label">GitHub URL</label>
          <input
            type="url"
            id="githubUrl"
            name="githubUrl"
            className="input"
            value={formData.githubUrl}
            onChange={handleChange}
            placeholder="Enter your GitHub URL"
          />
        </div>
        <div>
          <label htmlFor="resumeLink" className="form-label">Resume Link</label>
          <input
            type="url"
            id="resumeLink"
            name="resumeLink"
            className="input"
            value={formData.resumeLink}
            onChange={handleChange}
            placeholder="Enter your Resume link"
          />
        </div>
        <div className="h-4" />
        <div className="pt-2">
          <button
            type="submit"
            className="btn btn-primary min-w-fit px-4 font-normal"
          >
            Create Referral
          </button>
        </div>
      </form>
    </div>
  );
}
