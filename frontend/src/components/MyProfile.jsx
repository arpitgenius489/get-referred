import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';
import LoadingPlaceholder from './LoadingPlaceholder';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151&size=128&rounded=true';

export default function MyProfile() {
  const { getToken, backendUser, getBackendUser, deleteAccount, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [pendingProfilePicture, setPendingProfilePicture] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      const backendUserObj = getBackendUser && getBackendUser();
      if (!backendUserObj) {
        setLoading(false);
        return;
      }
      try {
        setError('');
        setMessage('');
        setName(backendUserObj.name || '');
        setEmail(backendUserObj.email || '');
        setLinkedinUrl(backendUserObj.linkedinUrl || '');
        setGithubUrl(backendUserObj.githubUrl || '');
        setProfilePicture(backendUserObj.profilePicture || '');
        setPendingProfilePicture('');
        setUserId(backendUserObj.id);
      } catch (err) {
        setError('Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [getBackendUser, backendUser]);

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    if (!userId) {
      setError('User ID not found from backend. Cannot update profile.');
      setLoading(false);
      return;
    }
    try {
      const token = await getToken();
      const updateUrl = `${API_URL}/api/users/${userId}`;
      let data;
      let headers = { Authorization: `Bearer ${token}` };
      if (pendingProfilePicture) {
        data = new FormData();
        data.append('profilePicture', pendingProfilePicture);
        data.append('name', name);
        data.append('linkedinUrl', linkedinUrl);
        data.append('githubUrl', githubUrl);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        data = { name, linkedinUrl, githubUrl };
      }
      const response = await axios.put(updateUrl, data, { headers });
      setMessage('Profile updated successfully!');
      setProfilePicture(response.data.profilePicture || profilePicture);
      setPendingProfilePicture('');
    } catch (err) {
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPendingProfilePicture(file);
    setMessage('Avatar will be updated after clicking Update Profile.');
  }

  if (authLoading || loading) {
    return <LoadingPlaceholder type="profile" count={1} />;
  }

  if (!backendUser) {
    return <LoadingPlaceholder type="profile" count={1} />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900">My Profile</h2>
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src={pendingProfilePicture ? URL.createObjectURL(pendingProfilePicture) : (profilePicture || DEFAULT_AVATAR)}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-primary-600 shadow"
          />
          <button
            type="button"
            className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 shadow hover:bg-primary-700 focus:outline-none"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title="Upload new avatar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </div>
        <div className="text-xs text-gray-500 mt-2">JPG, PNG, or GIF. Max 2MB.</div>
      </div>
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
      <form className="space-y-4" onSubmit={handleUpdateProfile}>
        <div>
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            className="input bg-gray-100 cursor-not-allowed"
            value={email}
            disabled
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
          {!name && <div className="text-xs text-red-500 mt-1">Name not set. Please update.</div>}
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
          {!linkedinUrl && <div className="text-xs text-red-500 mt-1">LinkedIn URL not set. Please update.</div>}
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
          {!githubUrl && <div className="text-xs text-red-500 mt-1">GitHub URL not set. Please update.</div>}
        </div>
        <div className="flex justify-between gap-3 mt-6">
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
            {error && (
              <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative text-base" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-secondary px-5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-base"
                onClick={() => {
                  setShowDeleteModal(false);
                  setError('');
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger px-5 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 text-base font-semibold"
                onClick={async () => {
                  setDeleteLoading(true);
                  setError('');
                  try {
                    const result = await deleteAccount();
                    if (result === true) {
                      setShowDeleteModal(false);
                      setDeleteLoading(false);
                      navigate('/');
                    }
                  } catch (err) {
                    setError(err.message || 'Failed to delete account');
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