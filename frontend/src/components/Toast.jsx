import React from 'react';

export function Toast({ message, type = 'success', onClose }) {
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
