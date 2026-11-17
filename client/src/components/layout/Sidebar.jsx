import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FolderKanban,
  UserCheck,
  LogOut,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isManager, logout } = useAuth();

  const adminNavItems = [
    {
      to: '/admin/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      to: '/admin/users',
      label: 'User Management',
      icon: Users,
    },
    {
      to: '/admin/roles',
      label: 'Roles & Access',
      icon: ShieldCheck,
    },
    {
      to: '/records',
      label: 'Projects / Records',
      icon: FolderKanban,
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: UserCheck,
    },
  ];

  const userNavItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/records',
      label: 'My Projects',
      icon: FolderKanban,
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: UserCheck,
    },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 7-7 7 7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-base tracking-tight">
              Growth Tech
            </span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              {isAdmin ? 'Admin Console' : 'Workspace'}
            </span>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Profile summary & signout */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-[11px] text-gray-500 truncate">
              {user?.role?.displayName || 'User'}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-gray-100"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (No animation, instant toggle) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-gray-900/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 w-64 z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

