import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';
import LoadingPlaceholder from './LoadingPlaceholder';
import { useNavigate } from 'react-router-dom';
import { Toast } from './Toast';

export default function MyProfile() {
  const { currentUser, backendUser, getBackendUser, deleteAccount, loading: authLoading, refreshBackendUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [isEmployee, setIsEmployee] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false); // Only true during update
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [initialProfile, setInitialProfile] = useState({});
  const [changedFields, setChangedFields] = useState([]); // Track changed fields
  const [loadingFields, setLoadingFields] = useState([]); // Track which fields are loading
  const navigate = useNavigate();

  useEffect(() => {
    // Show cached data immediately (from context), but trigger a background refresh
    // This ensures fast UI and up-to-date data
    refreshBackendUser();
  }, []);

  // Only initialize state from backendUser once
  useEffect(() => {
    if (!backendUser) return;
    const user = backendUser.data ? backendUser.data : backendUser;
    setName(user.name || '');
    setEmail(user.email || '');
    setProfilePictureUrl(user.profilePictureUrl || ''); // <-- camelCase
    setGithubLink(user.githubLink || '');
    setLinkedinLink(user.linkedinLink || '');
    setResumeLink(user.resumeLink || '');
    setIsEmployee(!!user.isEmployee);
    setCompanyName(user.companyName || '');
    setUserId(user.id);
    setInitialProfile({
      name: user.name || '',
      profilePictureUrl: user.profilePictureUrl || '',
      githubLink: user.githubLink || '',
      linkedinLink: user.linkedinLink || '',
      resumeLink: user.resumeLink || '',
      isEmployee: !!user.isEmployee,
      companyName: user.companyName || '',
    });
    setEditMode(false); // Reset edit mode on profile refresh
    setChangedFields([]); // Reset changed fields
    setLoadingFields([]); // Reset loading fields
  }, [backendUser]);

  function showToast(message, type = 'success') {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 2500);
  }

  // Helper to track changed fields
  function handleFieldChange(field, value, setter) {
    setter(value);
    if (!editMode) return;
    let changed = false;
    if (field === 'name' && value !== initialProfile.name) changed = true;
    if (field === 'profilePictureUrl' && value !== initialProfile.profilePictureUrl) changed = true;
    if (field === 'githubLink' && value !== initialProfile.githubLink) changed = true;
    if (field === 'linkedinLink' && value !== initialProfile.linkedinLink) changed = true;
    if (field === 'resumeLink' && value !== initialProfile.resumeLink) changed = true;
    if (field === 'isEmployee' && value !== initialProfile.isEmployee) changed = true;
    if (field === 'companyName' && value !== initialProfile.companyName) changed = true;
    setChangedFields((prev) => {
      if (changed && !prev.includes(field)) return [...prev, field];
      if (!changed && prev.includes(field)) return prev.filter(f => f !== field);
      return prev;
    });
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setLoading(true);
    setLoadingFields([...changedFields]);
    try {
      const token = await currentUser.getIdToken();
      const updateUrl = `${API_URL}/api/users/me`;
      // Only send changed fields
      const changedFieldsObj = {};
      if (changedFields.includes('name')) changedFieldsObj.name = name;
      if (changedFields.includes('profilePictureUrl')) changedFieldsObj.profilePictureUrl = profilePictureUrl;
      if (changedFields.includes('githubLink')) changedFieldsObj.githubLink = githubLink;
      if (changedFields.includes('linkedinLink')) changedFieldsObj.linkedinLink = linkedinLink;
      if (changedFields.includes('resumeLink')) changedFieldsObj.resumeLink = resumeLink;
      if (isEmployee && changedFields.includes('companyName')) changedFieldsObj.companyName = companyName;
      if (!isEmployee && initialProfile.isEmployee) changedFieldsObj.companyName = '';
      console.log('Sending to backend:', changedFieldsObj); // Debug log
      if (Object.keys(changedFieldsObj).length === 0) {
        showToast('No changes to update.', 'info');
        setLoading(false);
        setEditMode(false);
        setLoadingFields([]);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(updateUrl, changedFieldsObj, { headers });
      await refreshBackendUser();
      showToast('Profile updated successfully!', 'success');
      setEditMode(false);
      setChangedFields([]);
    } catch (err) {
      showToast('Failed to update profile: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
      setLoadingFields([]);
    }
  }

  if (authLoading) {
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
            value={email || ''}
            disabled
            placeholder="Your email"
          />
        </div>
        <div>
          <label htmlFor="name" className="form-label">Name</label>
          {loading && loadingFields.includes('name') ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
          ) : (
            <input
              type="text"
              id="name"
              className="input"
              value={name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value, setName)}
              placeholder="Enter your name"
              disabled={!editMode}
            />
          )}
        </div>
        <div>
          <label htmlFor="profilePictureUrl" className="form-label">Profile Picture Link</label>
          {loading && loadingFields.includes('profilePictureUrl') ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
          ) : (
            <input
              type="url"
              id="profilePictureUrl"
              className="input"
              value={profilePictureUrl || ''}
              onChange={(e) => handleFieldChange('profilePictureUrl', e.target.value, setProfilePictureUrl)}
              placeholder="Enter your profile picture URL"
              disabled={!editMode}
            />
          )}
        </div>
        <div>
          <label htmlFor="github" className="form-label">GitHub Link</label>
          {loading && loadingFields.includes('githubLink') ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
          ) : (
            <input
              type="url"
              id="github"
              className="input"
              value={githubLink || ''}
              onChange={(e) => handleFieldChange('githubLink', e.target.value, setGithubLink)}
              placeholder="Enter your GitHub link"
              disabled={!editMode}
            />
          )}
        </div>
        <div>
          <label htmlFor="linkedin" className="form-label">LinkedIn Link</label>
          {loading && loadingFields.includes('linkedinLink') ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
          ) : (
            <input
              type="url"
              id="linkedin"
              className="input"
              value={linkedinLink || ''}
              onChange={(e) => handleFieldChange('linkedinLink', e.target.value, setLinkedinLink)}
              placeholder="Enter your LinkedIn link"
              disabled={!editMode}
            />
          )}
        </div>
        <div>
          <label htmlFor="resumeLink" className="form-label">Resume Link</label>
          {loading && loadingFields.includes('resumeLink') ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
          ) : (
            <input
              type="url"
              id="resumeLink"
              className="input"
              value={resumeLink || ''}
              onChange={(e) => handleFieldChange('resumeLink', e.target.value, setResumeLink)}
              placeholder="Enter your resume link"
              disabled={!editMode}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {loading && loadingFields.includes('isEmployee') ? (
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
          ) : (
            <input
              type="checkbox"
              id="isEmployee"
              checked={isEmployee}
              onChange={(e) => handleFieldChange('isEmployee', e.target.checked, setIsEmployee)}
              disabled={!editMode}
            />
          )}
          <label htmlFor="isEmployee" className="form-label mb-0">I am an employee</label>
        </div>
        {isEmployee && (
          <div>
            <label htmlFor="companyName" className="form-label">Company Name</label>
            {loading && loadingFields.includes('companyName') ? (
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
            ) : (
              <input
                type="text"
                id="companyName"
                className="input"
                value={companyName || ''}
                onChange={(e) => handleFieldChange('companyName', e.target.value, setCompanyName)}
                placeholder="Enter your company name"
                disabled={!editMode}
              />
            )}
          </div>
        )}
        <div className="h-4" />
        <div className="mt-8 flex justify-between gap-3">
          {/* Left: Edit Profile or Save */}
          {(!editMode || (editMode && changedFields.length === 0)) && (
            <button
              type="button"
              className="btn btn-primary min-w-fit px-4 font-normal"
              style={{ fontWeight: 400, letterSpacing: '0.02em' }}
              onClick={() => setEditMode(true)}
              disabled={loading || editMode}
            >
              Edit Profile
            </button>
          )}
          {editMode && changedFields.length > 0 && (
            <button
              type="submit"
              className="btn btn-primary min-w-fit px-4"
              style={{ fontWeight: 500, letterSpacing: '0.02em' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          )}
          {/* Right: Delete Account */}
          <button
            type="button"
            className="btn btn-danger min-w-fit px-4 ml-auto"
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
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