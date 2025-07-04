import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import MyProfile from '../components/MyProfile';
import CreateReferrals from '../components/CreateReferrals';
import ViewReferrals from '../components/ViewReferrals';
import ProvideReferrals from '../components/ProvideReferrals';
import AdminPanel from '../components/AdminPanel';
import LoadingPlaceholder from '../components/LoadingPlaceholder';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser, backendUser, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowSignOutModal(true);
  };

  // Loading states
  if (authLoading) {
    return <div className="min-h-screen bg-gray-50"><LoadingPlaceholder type="card" count={3} /></div>;
  }
  if (!backendUser) {
    return <div className="min-h-screen bg-gray-50"><LoadingPlaceholder type="card" count={2} /></div>;
  }

  // Sidebar width for margin
  const sidebarPx = sidebarCollapsed ? 80 : 288; // Tailwind w-20 = 80px, w-72 = 288px
  const contentSpacing = 24; // px-6 or 1.5rem (24px) for spacing between sidebar and content

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        backendUser={backendUser}
        currentUser={currentUser}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        showSignOutModal={showSignOutModal}
        setShowSignOutModal={setShowSignOutModal}
        signOutLoading={signOutLoading}
        signOutError={signOutError}
        signOut={signOut}
        navigate={navigate}
      />
      {/* Main Content */}
      <main
        className="transition-all duration-300 overflow-auto"
        style={{ marginLeft: sidebarPx + contentSpacing, minHeight: '100vh', padding: 24, boxSizing: 'border-box' }}
      >
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
          {activeTab === 'create-referral' && currentUser?.role === 'JOB_SEEKER' && <CreateReferrals />}
          {activeTab === 'view-referrals' && currentUser?.role === 'JOB_SEEKER' && <ViewReferrals />}
          {activeTab === 'provide-referrals' && currentUser?.role === 'EMPLOYEE' && <ProvideReferrals />}
          {activeTab === 'admin-panel' && currentUser?.role === 'ADMIN' && <AdminPanel />}
        </div>
      </main>
    </div>
  );
}