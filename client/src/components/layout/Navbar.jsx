import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { Badge } from '../common/Badge';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand text */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 7-7 7 7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Growth Tech</span>
        </div>
      </div>

      {/* User info and actions */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-gray-900 leading-tight">
                {user.name}
              </span>
              <span className="text-xs text-gray-500">
                {user.email}
              </span>
            </div>

            <Badge variant={isAdmin ? 'purple' : 'blue'}>
              {user.role?.displayName || 'User'}
            </Badge>

            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-red-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

