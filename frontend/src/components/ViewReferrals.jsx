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
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const handleCopy = (email, id) => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    }
  };

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
        setError('Failed to fetch referrals.');
        setReferrals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, statusFilter]);

  // Always show header and filter; only grid area is replaced by skeleton
  return (
    <div className="">
      <h2 className="text-2xl font-semibold mb-10 text-gray-900">View Referrals</h2>
      <div className="mb-6 w-full max-w-xs">
        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by status</label>
        <div className="relative">
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input pr-10 bg-white text-gray-700 cursor-pointer appearance-none"
          >
            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </span>
        </div>
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
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <span className="text-gray-500 text-lg font-medium" style={{marginTop: '2rem'}}>No referrals found.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {referrals.map(referral => {
            const showEmployee = referral.status === 'ACCEPTED' || referral.status === 'HIRED';
            const showEmployeeRating = referral.status === 'HIRED' && referral.rating;
            return (
              <div key={referral.id} className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-2 border border-gray-100">
                {/* Top row: Job Title (with jobId in brackets if present) and job link icon */}
                <div className="flex items-center gap-2 mb-0 min-w-0">
                  <span
                    className="font-medium text-base text-gray-900 truncate min-w-0 max-w-[60%]"
                    title={referral.jobTitle}
                  >
                    {referral.jobTitle}
                  </span>
                  {referral.jobId && (
                    <span
                      className="text-gray-500 ml-1 truncate min-w-0 max-w-[30%] whitespace-nowrap"
                      title={referral.jobId}
                    >
                      ({referral.jobId})
                    </span>
                  )}
                  {referral.jobLink && (
                    <a
                      href={referral.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-primary-600 hover:text-primary-800 align-middle relative"
                      aria-label="Open Job Link"
                      title="Open Job Link"
                      style={{ top: '-2px' }}
                    >
                      {/* Modern external link icon (Heroicons outline/external-link, w-4 h-4) */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline align-middle">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 13.5V19.125A2.625 2.625 0 0 1 15.375 21.75H4.875A2.625 2.625 0 0 1 2.25 19.125V8.625A2.625 2.625 0 0 1 4.875 6H10.5m4.125-3h6.375m0 0v6.375m0-6.375L10.5 13.5" />
                      </svg>
                    </a>
                  )}
                  <span className={
                    `ml-auto px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ` +
                    (referral.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                     referral.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                     referral.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                     referral.status === 'HIRED' ? 'bg-primary-100 text-primary-700' :
                     'bg-gray-100 text-gray-700')
                  }>
                    {referral.status}
                  </span>
                </div>
                {/* Company Name - reduce margin to group with job title */}
                {referral.companyName && (
                  <div className="text-gray-700 font-medium mb-0 truncate" title={referral.companyName}>
                    {referral.companyName}
                  </div>
                )}
                {/* Divider */}
                <div className="border-t border-gray-200 my-2" />
                {/* Bottom row: Created, Applied With, Employee, Employee Rating (all in one horizontal flex row, consistent style) */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 items-center">
                  {/* Created */}
                  <div className="flex items-center" title={referral.createdAt?.slice(0,10)}>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-1">{referral.createdAt?.slice(0,10)}</span>
                  </div>
                  {/* Applied With */}
                  {(referral.githubUrl || referral.linkedinUrl || referral.resumeLink) && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700">Applied With:</span>
                      {referral.githubUrl && (
                        <a
                          href={referral.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-gray-700 hover:text-black ml-2 align-middle"
                          aria-label="GitHub Profile"
                          title="GitHub Profile"
                        >
                          {/* Standard GitHub icon (FontAwesome/Octicons style) */}
                          <svg className="w-5 h-5 inline align-text-bottom" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.847-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.578.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
                          </svg>
                        </a>
                      )}
                      {referral.linkedinUrl && (
                        <a
                          href={referral.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-blue-700 hover:text-blue-900 ml-2 align-middle"
                          aria-label="LinkedIn Profile"
                          title="LinkedIn Profile"
                        >
                          {/* Standard LinkedIn icon (FontAwesome style) */}
                          <svg className="w-5 h-5 inline align-text-bottom" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.784 1.764-1.75 1.764zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v5.597z" />
                          </svg>
                        </a>
                      )}
                      {referral.resumeLink && (
                        <a
                          href={referral.resumeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-gray-700 hover:text-black ml-2 align-middle"
                          aria-label="Resume"
                          title="Resume"
                        >
                          {/* Paperclip/Document icon (w-5 h-5) */}
                          <svg className="w-5 h-5 inline align-text-bottom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l7.07-7.07a4 4 0 00-5.657-5.657l-7.071 7.07a6 6 0 108.485 8.485l7.071-7.07" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                  {/* Employee and Employee Rating if accepted/hired */}
                  {showEmployee && referral.employeeEmail && (
                    <div className="flex items-center gap-1" title={referral.employeeEmail}>
                      <span className="font-medium text-gray-700">Employee:</span>
                      <span className="ml-1">{referral.employeeEmail}</span>
                      <button
                        type="button"
                        className="ml-1 text-gray-400 hover:text-primary-600 focus:outline-none"
                        aria-label="Copy Email"
                        title={copiedId === referral.id ? "Copied!" : "Copy Email"}
                        onClick={() => handleCopy(referral.employeeEmail, referral.id)}
                      >
                        {/* Clipboard icon (w-4 h-4) */}
                        <svg className="w-4 h-4 inline align-text-bottom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      {copiedId === referral.id && <span className="text-xs text-green-600 ml-1">Copied!</span>}
                    </div>
                  )}
                  {showEmployeeRating && (
                    <div title={referral.rating} className="flex items-center">
                      <span className="font-medium text-gray-700">Employee Rating:</span>
                      <span className="ml-1">{referral.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
