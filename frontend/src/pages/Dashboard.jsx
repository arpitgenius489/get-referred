import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import MyProfile from '../components/MyProfile';
import CreateRequest from '../components/CreateRequest';
import MyRequests from '../components/MyRequests';
import ReceivedRequests from '../components/ReceivedRequests';
import AdminPanel from '../components/AdminPanel';
import LoadingPlaceholder from '../components/LoadingPlaceholder';

const SIDEBAR_LINKS = [
  { id: 'profile', label: 'My Profile', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ) },
  { id: 'my-requests', label: 'My Requests', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
  ) },
  { id: 'create-request', label: 'Create Referral Requests', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
  ) },
  { id: 'received-requests', label: 'Employee View', icon: (
    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg>
  ) },
];

const SIGN_OUT_ICON = (
  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
);

export default function Dashboard() {
  const { currentUser, backendUser, loading: authLoading, logout, signOut, token } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowSignOutModal(true);
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      // You might want to add a toast notification here
    }
  };

  // Loading states
  if (authLoading) {
    return <div className="min-h-screen bg-gray-50"><LoadingPlaceholder type="card" count={3} /></div>;
  }
  if (!backendUser) {
    return <div className="min-h-screen bg-gray-50"><LoadingPlaceholder type="card" count={2} /></div>;
  }

  // Sidebar links: always show My Profile, My Requests, Create Referral Requests; show Employee View if employee
  const sidebarLinks = [SIDEBAR_LINKS[0], SIDEBAR_LINKS[1], SIDEBAR_LINKS[2]];
  if (currentUser?.role === 'EMPLOYEE') {
    sidebarLinks.push(SIDEBAR_LINKS[3]);
  }

  // Avatar letter
  const avatarLetter = backendUser?.name?.[0]?.toUpperCase() || backendUser?.email?.[0]?.toLowerCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-200 flex flex-col justify-between min-h-screen transition-all duration-200`}>
        <div>
          {/* Logo, app name, and arrow */}
          <div className="flex items-center px-6 py-6 border-b border-gray-100 relative">
            {/* Logo (clickable) */}
            <div
              className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg cursor-pointer"
              onClick={() => navigate('/')}
              title="Go to Landing Page"
            >
              GR
            </div>
            {/* App name (not clickable) */}
            {!sidebarCollapsed && (
              <span className="ml-3 text-xl font-semibold text-gray-900 select-none">Get Referred</span>
            )}
            {/* Arrow icon */}
            <button
              className="ml-3 flex items-center justify-center p-1 rounded hover:bg-gray-100 transition absolute right-4 top-1/2 -translate-y-1/2"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              tabIndex={0}
              style={{ outline: 'none' }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {/* Left arrow for expanded, right arrow for collapsed */}
              {sidebarCollapsed ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
          {/* User info */}
          <div className={`flex flex-col items-center py-8 border-b border-gray-100 transition-all duration-200 ${sidebarCollapsed ? 'px-0' : 'px-6'}`}>
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-primary-600 mb-2">{avatarLetter}</div>
            {!sidebarCollapsed && <div className="font-semibold text-gray-900 text-lg">{backendUser?.name || 'User'}</div>}
            {!sidebarCollapsed && <div className="text-gray-500 text-sm">{backendUser?.email}</div>}
          </div>
          {/* Navigation */}
          <nav className="flex-1 mt-6">
            <ul className="space-y-1">
              {sidebarLinks.map(link => (
                <li key={link.id}>
                  <button
                    className={`flex items-center w-full px-6 py-3 text-left rounded-lg transition-colors text-gray-700 hover:bg-primary-50 hover:text-primary-700 text-base font-medium ${activeTab === link.id ? 'bg-primary-50 text-primary-700 font-semibold' : ''}`}
                    onClick={() => setActiveTab(link.id)}
                  >
                    <span className={`${sidebarCollapsed ? 'mx-auto' : ''}`}>{React.cloneElement(link.icon, { className: `h-5 w-5${sidebarCollapsed ? '' : ' mr-2'}` })}</span>
                    {!sidebarCollapsed && link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Sign Out */}
        <div className="px-6 py-6">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold border border-red-100 transition-all duration-200 ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
          >
            <span className={`${sidebarCollapsed ? 'mx-auto' : ''}`}>{React.cloneElement(SIGN_OUT_ICON, { className: `h-5 w-5${sidebarCollapsed ? '' : ' mr-2'}` })}</span>
            {!sidebarCollapsed && 'Sign Out'}
          </button>
        </div>
        {/* Sign Out Confirmation Modal */}
        {showSignOutModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-200">
              <h3 className="text-lg font-bold mb-2 text-gray-900">Sign Out?</h3>
              <p className="mb-4 text-gray-700 text-base">Are you sure you want to sign out?</p>
              {signOutError && (
                <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative text-base" role="alert">
                  <span className="block sm:inline">{signOutError}</span>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-secondary px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-base"
                  onClick={() => setShowSignOutModal(false)}
                  disabled={signOutLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 text-base font-semibold"
                  onClick={async () => {
                    setSignOutLoading(true);
                    setSignOutError('');
                    try {
                      await signOut();
                      setShowSignOutModal(false);
                      setSignOutLoading(false);
                      navigate('/');
                    } catch (error) {
                      setSignOutError(error.message || 'Failed to sign out.');
                      setSignOutLoading(false);
                    }
                  }}
                  disabled={signOutLoading}
                >
                  {signOutLoading ? 'Signing Out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome back, {backendUser?.name || backendUser?.email?.split('@')[0] || 'User'}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {currentUser?.role === 'JOB_SEEKER'
              ? 'Manage and monitor the platform'
              : currentUser?.role === 'EMPLOYEE'
              ? 'Manage and monitor the platform'
              : 'Manage and monitor the platform'}
          </p>
        </div>
        {/* Section Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'profile' && <MyProfile />}
          {activeTab === 'create-request' && currentUser?.role === 'JOB_SEEKER' && <CreateRequest />}
          {activeTab === 'my-requests' && currentUser?.role === 'JOB_SEEKER' && <MyRequests />}
          {activeTab === 'received-requests' && currentUser?.role === 'EMPLOYEE' && <ReceivedRequests />}
          {activeTab === 'admin-panel' && currentUser?.role === 'ADMIN' && <AdminPanel />}
        </div>
      </main>
    </div>
  );
}