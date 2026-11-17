import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Badge } from '../../components/common/Badge';
import { User, Mail, Shield, Key, Calendar, CheckCircle2 } from 'lucide-react';

export const Profile = () => {
  usePageTitle('My Profile');
  const { user, isAdmin, isManager } = useAuth();

  const permissions = user?.role?.permissions || [];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          User Account Profile
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Your credentials, access rights, and security metadata
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
              <Badge variant={isAdmin ? 'purple' : 'blue'}>
                {user?.role?.displayName || 'User'}
              </Badge>
              <Badge variant={user?.status === 'active' ? 'green' : 'red'}>
                {user?.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {user?.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-4 text-xs">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Account Information
            </h3>

            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Account ID:</span>
                <span className="font-mono text-gray-800">{user?._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Member Since:</span>
                <span className="text-gray-800">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Sign-in:</span>
                <span className="text-gray-800">
                  {user?.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : 'Current session'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Authentication:</span>
                <span className="text-green-700 font-medium">JWT httpOnly Cookie</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Role & Permissions
            </h3>

            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-3">
              <div>
                <span className="text-gray-500 block mb-1">Role Description:</span>
                <p className="text-gray-800 leading-relaxed">
                  {user?.role?.description || 'Standard workspace member.'}
                </p>
              </div>

              <div>
                <span className="text-gray-500 block mb-1.5">
                  Granted Capabilities ({isAdmin ? 'All' : permissions.length}):
                </span>
                {isAdmin ? (
                  <Badge variant="purple">Full System Administration (Master Access)</Badge>
                ) : permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {permissions.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 bg-white border border-gray-200 rounded font-mono text-[11px] text-gray-700 inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">No specific granular permissions</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

