import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { useAuth } from '../../hooks/useAuth';
import { usePageTitle } from '../../hooks/usePageTitle';
import { StatCard } from '../../components/dashboard/StatCard';
import { DataTable } from '../../components/dashboard/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import {
  FolderKanban,
  Clock,
  PlayCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Shield,
  Calendar,
  User as UserIcon,
} from 'lucide-react';

export const UserDashboard = () => {
  usePageTitle('Workspace Dashboard');
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardApi.getStats();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to retrieve dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  if (loading && !data) {
    return <Loader size="lg" text="Loading personal workspace..." />;
  }

  const stats = data?.stats || {};
  const recentRecords = data?.recentRecords || [];
  const profile = data?.profile || {};

  const recordColumns = [
    {
      header: 'Title',
      key: 'title',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-xs text-gray-500">{row.category}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const variant =
          row.status === 'completed'
            ? 'green'
            : row.status === 'in-progress'
            ? 'blue'
            : 'amber';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (row) => {
        const variant =
          row.priority === 'high'
            ? 'red'
            : row.priority === 'medium'
            ? 'amber'
            : 'gray';
        return <Badge variant={variant}>{row.priority}</Badge>;
      },
    },
    {
      header: 'Due Date',
      key: 'dueDate',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {new Date(row.dueDate).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track your assigned projects, manage deliverables, and review workflow status.
          </p>
        </div>
        <Link to="/records">
          <Button variant="primary" icon={Plus}>
            Manage Projects
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
          {error}
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Projects"
          value={stats.totalRecords}
          icon={FolderKanban}
          description="Projects assigned to you"
        />
        <StatCard
          label="Pending"
          value={stats.pendingRecords}
          icon={Clock}
          badgeText="To Do"
          badgeVariant="amber"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgressRecords}
          icon={PlayCircle}
          badgeText="Active"
          badgeVariant="blue"
        />
        <StatCard
          label="Completed"
          value={stats.completedRecords}
          icon={CheckCircle2}
          badgeText="Done"
          badgeVariant="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-blue-600" />
            Profile Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-500 block">Full Name:</span>
              <span className="font-semibold text-gray-800 text-sm">
                {profile.name || user?.name}
              </span>
            </div>

            <div>
              <span className="text-gray-500 block">Email:</span>
              <span className="text-gray-700">{profile.email || user?.email}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-gray-500">Access Role:</span>
              <Badge variant="blue">{profile.role || 'Standard User'}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Account Status:</span>
              <Badge variant={profile.status === 'active' ? 'green' : 'red'}>
                {profile.status || 'active'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Member Since:</span>
              <span className="text-gray-700">
                {profile.memberSince
                  ? new Date(profile.memberSince).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Records Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              My Recent Projects
            </h2>
            <Link
              to="/records"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <DataTable
            columns={recordColumns}
            data={recentRecords}
            loading={loading}
            emptyMessage="You have not created any projects yet."
          />
        </div>
      </div>
    </div>
  );
};

