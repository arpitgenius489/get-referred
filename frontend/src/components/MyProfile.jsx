import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';
import LoadingPlaceholder from './LoadingPlaceholder';
import { useNavigate } from 'react-router-dom';

function Toast({ message, type = 'success', onClose }) {
  // Industry-standard, simple alert style
  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center px-4 py-3 rounded-lg shadow-md border-l-4 text-base bg-white min-w-[220px] max-w-[340px]
        ${type === 'error' ? 'border-red-500 text-red-700' : 'border-green-500 text-green-700'}`}
      role="alert"
    >
      <span className="flex-1 font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-lg font-bold leading-none rounded-full hover:bg-gray-100 p-1 focus:outline-none"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export default function MyProfile() {
  const { currentUser, backendUser, getBackendUser, deleteAccount, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [isEmployee, setIsEmployee] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      const backendUserObj = getBackendUser && getBackendUser();
      if (!backendUserObj) {
        setLoading(false);
        return;
      }
      try {
        setName(backendUserObj.name || '');
        setEmail(backendUserObj.email || '');
        setProfilePictureUrl(backendUserObj.profilePicture || '');
        setGithubUrl(backendUserObj.githubUrl || '');
        setLinkedinUrl(backendUserObj.linkedinUrl || '');
        setResumeLink(backendUserObj.resumeLink || '');
        setIsEmployee(!!backendUserObj.isEmployee);
        setCompanyName(backendUserObj.companyName || '');
        setUserId(backendUserObj.id);
      } catch (err) {
        showToast('Failed to fetch profile.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
    // eslint-disable-next-line
  }, [getBackendUser, backendUser]);

  function showToast(message, type = 'success') {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 2500);
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const updateUrl = `${API_URL}/api/users/me`;
      const data = {
        name,
        profilePicture: profilePictureUrl,
        githubUrl,
        linkedinLink: linkedinUrl, // Backend expects linkedinLink
        resumeLink,
        isEmployee,
        companyName: isEmployee ? companyName : '',
      };
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(updateUrl, data, { headers });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return <LoadingPlaceholder type="profile" count={1} />;
  }

  if (!backendUser) {
    return <LoadingPlaceholder type="profile" count={1} />;
  }

  return (
    <div>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: toast.type })} />
      )}
      <h2 className="text-2xl font-semibold mb-10 text-gray-900">My Profile</h2>
      <form className="space-y-4" onSubmit={handleUpdateProfile}>
        <div>
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            className="input bg-gray-100 cursor-not-allowed"
            value={email}
            disabled
            placeholder="Your email"
          />
        </div>
        <div>
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label htmlFor="profilePictureUrl" className="form-label">Profile Picture URL</label>
          <input
            type="url"
            id="profilePictureUrl"
            className="input"
            value={profilePictureUrl}
            onChange={(e) => setProfilePictureUrl(e.target.value)}
            placeholder="https://your-image-url.com/profile.jpg"
          />
        </div>
        <div>
          <label htmlFor="github" className="form-label">GitHub URL</label>
          <input
            type="url"
            id="github"
            className="input"
            placeholder="https://github.com/yourprofile"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="linkedin" className="form-label">LinkedIn URL</label>
          <input
            type="url"
            id="linkedin"
            className="input"
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="resumeLink" className="form-label">Resume Link</label>
          <input
            type="url"
            id="resumeLink"
            className="input"
            placeholder="https://your-resume-link.com"
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isEmployee"
            checked={isEmployee}
            onChange={(e) => setIsEmployee(e.target.checked)}
          />
          <label htmlFor="isEmployee" className="form-label mb-0">I am an employee</label>
        </div>
        {isEmployee && (
          <div>
            <label htmlFor="companyName" className="form-label">Company Name</label>
            <input
              type="text"
              id="companyName"
              className="input"
              placeholder="Enter your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        )}
        <div className="h-4" />
        <div className="mt-8 flex justify-between gap-3">
          <button type="submit" className="btn btn-primary min-w-[140px]">
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
          <button
            type="button"
            className="btn btn-danger min-w-[140px]"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </button>
        </div>
      </form>
      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg border border-gray-200">
            <h3 className="text-xl font-bold mb-3 text-gray-900">Delete Account?</h3>
            <p className="mb-6 text-gray-700 text-base">This action cannot be undone. All your data will be permanently deleted.</p>
            {toast.show && toast.type === 'error' && (
              <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: toast.type })} />
            )}
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-secondary px-5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-base"
                onClick={() => {
                  setShowDeleteModal(false);
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger px-5 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 text-base font-semibold"
                onClick={async () => {
                  setDeleteLoading(true);
                  try {
                    const result = await deleteAccount();
                    if (result === true) {
                      setShowDeleteModal(false);
                      setDeleteLoading(false);
                      navigate('/');
                    }
                  } catch (err) {
                    showToast(err.message || 'Failed to delete account', 'error');
                    setDeleteLoading(false);
                  }
                }}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}