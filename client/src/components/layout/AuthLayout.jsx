import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 7-7 7 7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5" />
            </svg>
          </div>
          <span className="font-bold text-2xl text-gray-900 tracking-tight">
            Growth Tech
          </span>
        </Link>
        <p className="mt-2 text-xs text-gray-500 uppercase tracking-widest font-medium">
          User & Access Management Platform
        </p>
      </div>

      {/* Main Card Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-gray-200 rounded-lg shadow-sm">
          <Outlet />
        </div>

        {/* Minimal Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Growth Tech Platform &copy; {new Date().getFullYear()}. All rights reserved.
        </div>
      </div>
    </div>
  );
};

