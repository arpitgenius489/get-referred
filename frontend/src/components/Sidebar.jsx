import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HandRaisedIcon } from '@heroicons/react/24/outline';

const SIDEBAR_LINKS = [
  {
    id: 'profile',
    label: 'My Profile',
    icon: (
      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
  },
  {
    id: 'create-referral',
    label: 'Create Referrals',
    icon: (
      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
    ),
  },
  {
    id: 'view-referrals',
    label: 'View Referrals',
    icon: (
      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
    ),
  },
  {
    id: 'provide-referrals',
    label: 'Provide Referrals',
    // Standard hand raised icon from Heroicons
    icon: (
      <HandRaisedIcon className="h-5 w-5 mr-2" />
    ),
  },
];

const SIGN_OUT_ICON = (
  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
);

const PROFILE_SECTION_HEIGHT = '168px'; // 8 (py-8) + 80 (avatar) + 8 (mb-2) + 24 (name) + 20 (email) + 28 (borders/padding)

const Sidebar = ({
  backendUser,
  currentUser,
  sidebarCollapsed,
  setSidebarCollapsed,
  activeTab,
  setActiveTab,
  handleLogout,
  showSignOutModal,
  setShowSignOutModal,
  signOutLoading,
  signOutError,
  signOut,
  navigate,
}) => {
  const avatarLetter = backendUser?.name?.[0]?.toUpperCase() || backendUser?.email?.[0]?.toLowerCase() || 'U';
  const userName = backendUser?.name || 'User';
  const userEmail = backendUser?.email || '';

  return (
    <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-700 ease-in-out fixed left-0 top-0 z-30`} style={{transitionProperty: 'width, background, box-shadow, opacity'}}>
      {/* Top: Logo, app name, and arrow (in line) */}
      <div className="flex items-center px-6 py-6 border-b border-gray-100 relative flex-shrink-0 transition-all duration-700 ease-in-out" style={{opacity: sidebarCollapsed ? 0.7 : 1, transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1)'}}>
        {/* Logo (clickable) */}
        {!sidebarCollapsed && (
          <span
            className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg cursor-pointer select-none"
            onClick={() => navigate('/')}
            title="Go to Landing Page"
            tabIndex={0}
            style={{ outline: 'none' }}
          >
            GR
          </span>
        )}
        {/* App name (not clickable) */}
        {!sidebarCollapsed && (
          <span className="ml-3 text-xl font-semibold text-gray-900 select-none">Get Referred</span>
        )}
        {/* Arrow icon (always visible, right-aligned) */}
        <button
          className="ml-auto flex items-center justify-center p-1 transition"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          tabIndex={0}
          style={{ outline: 'none' }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? (
            <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
      {/* Profile info: always reserve space, collapse visually only */}
      <div
        className={`border-b border-gray-100 flex-shrink-0 transition-all duration-700 ease-in-out px-6`}
        style={{
          height: PROFILE_SECTION_HEIGHT,
          minHeight: PROFILE_SECTION_HEIGHT,
          maxHeight: PROFILE_SECTION_HEIGHT,
          overflow: 'hidden',
          paddingTop: sidebarCollapsed ? 0 : '2rem',
          paddingBottom: sidebarCollapsed ? 0 : '2rem',
          opacity: sidebarCollapsed ? 0 : 1,
          pointerEvents: sidebarCollapsed ? 'none' : 'auto',
          transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="flex flex-col items-center w-full">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-primary-600 mb-2">{avatarLetter}</div>
          <div className="font-semibold text-gray-900 text-lg text-center w-full truncate">{userName}</div>
          <div className="text-gray-500 text-sm text-center w-full truncate">{userEmail}</div>
        </div>
      </div>
      {/* Section links: always at same vertical position */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-6">
            <ul className="space-y-1">
              {SIDEBAR_LINKS.map(link => (
                <li key={link.id}>
                  <button
                    className={`flex items-center w-full px-6 py-3 text-left transition-colors text-gray-700 hover:bg-primary-50 hover:text-primary-700 text-base font-medium ${activeTab === link.id ? 'bg-primary-50 text-primary-700 font-semibold' : ''}`}
                    style={activeTab === link.id ? { borderRadius: 0 } : {}}
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
      </div>
      {/* Bottom: Sign Out with modal logic restored */}
      <div className="w-full bg-white px-6 py-6 z-10 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold border border-red-100 transition-all duration-200 ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
        >
          <span className={`${sidebarCollapsed ? 'mx-auto' : ''}`}>{React.cloneElement(SIGN_OUT_ICON, { className: `h-5 w-5${sidebarCollapsed ? '' : ' mr-2'}` })}</span>
          {!sidebarCollapsed && 'Sign Out'}
        </button>
        {/* Modal logic for sign out confirmation */}
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
                    if (signOut) {
                      try {
                        await signOut();
                        setShowSignOutModal(false);
                      } catch (error) {
                        // Optionally handle error
                      }
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
      </div>
    </aside>
  );
};

export default Sidebar;
