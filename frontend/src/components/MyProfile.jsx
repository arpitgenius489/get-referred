import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function MyProfile() {
  const { getToken, backendUser, getBackendUser, deleteAccount, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      const updateUrl = `${API_URL}/users/${userId}`;
      await axios.put(updateUrl, 
        {
          name,
          linkedinUrl,
          githubUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return <LoadingPlaceholder type="profile" count={1} />;
  }

  if (!backendUser) {
    return <LoadingPlaceholder type="profile" count={1} />;
  }

  return (
    <div className="card mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">My Profile</h2>
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
      <form onSubmit={handleUpdateProfile}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            id="email"
            className="input bg-gray-100 cursor-not-allowed"
            value={email}
            disabled
          />
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="linkedin" className="block text-gray-700 text-sm font-bold mb-2">LinkedIn URL</label>
          <input
            type="url"
            id="linkedin"
            className="input"
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="github" className="block text-gray-700 text-sm font-bold mb-2">GitHub URL</label>
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
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
      {/* Delete Account Button */}
      <div className="mt-4 flex justify-end">
        <button
          className="btn btn-danger px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 text-sm"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </button>
      </div>
      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-xs">
            <h3 className="text-base font-semibold mb-2 text-gray-900">Delete Account?</h3>
            <p className="mb-4 text-gray-700 text-sm">This action cannot be undone. All your data will be permanently deleted.</p>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-secondary px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setError('');
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 text-sm"
                onClick={async () => {
                  setDeleteLoading(true);
                  setError('');
                  try {
                    const result = await deleteAccount();
                    if (result.success) {
                      window.location.href = '/';
                    }
                  } catch (err) {
                    setError(err.message || 'Failed to delete account');
                  } finally {
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