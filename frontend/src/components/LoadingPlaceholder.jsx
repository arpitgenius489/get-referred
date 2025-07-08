import React from 'react';

export default function LoadingPlaceholder({ type = 'card', count = 1 }) {
  const renderPlaceholder = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        );
      case 'referral-card':
        return (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse flex flex-col gap-2">
            <div className="flex justify-between items-center mb-2">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-1" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-1/3 mt-2" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="mb-4">
          {renderPlaceholder()}
        </div>
      ))}
    </>
  );
} 