import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { StatCard } from '../../components/dashboard/StatCard';
import { DataTable } from '../../components/dashboard/DataTable';
import { UsersByRoleChart, RegistrationsChart } from '../../components/dashboard/Charts';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import {
  Users,
  UserCheck,
  UserX,
  FolderKanban,
  UserPlus,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard = () => {
  usePageTitle('Admin Overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardApi.getStats();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch dashboard statistics.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !data) {
    return <Loader size="lg" text="Loading administrative dashboard..." />;
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentUsers = data?.recentUsers || [];
  const recentRecords = data?.recentRecords || [];

  const userColumns = [
    {
      header: 'Name',
      key: 'name',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      render: (row) => (
        <Badge variant={row.role?.name === 'admin' ? 'purple' : 'blue'}>
          {row.role?.displayName || 'User'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'green' : 'red'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Joined',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const recordColumns = [
    {
      header: 'Project Title',
      key: 'title',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 truncate max-w-xs">{row.title}</div>
          <div className="text-xs text-gray-500">{row.category}</div>
        </div>
      ),
    },
    {
      header: 'Owner',
      key: 'createdBy',
      render: (row) => (
        <span className="text-xs text-gray-700">
          {row.createdBy?.name || 'Unknown'}
        </span>
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            System Overview
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time platform metrics, user access distribution, and recent activity
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
          {error}
        </div>
      )}

      {/* 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Registered platform accounts"
        />
        <StatCard
          label="Active Users"
          value={stats.activeUsers}
          icon={UserCheck}
          badgeText="Operational"
          badgeVariant="green"
        />
        <StatCard
          label="Inactive Users"
          value={stats.inactiveUsers}
          icon={UserX}
          badgeText="Suspended"
          badgeVariant="red"
        />
        <StatCard
          label="Total Records"
          value={stats.totalRecords}
          icon={FolderKanban}
          description="Projects across organization"
        />
        <StatCard
          label="New This Month"
          value={stats.newUsersThisMonth}
          icon={UserPlus}
          badgeText="Growth"
          badgeVariant="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Users by Role</h2>
              <p className="text-xs text-gray-500">Access role breakdown across members</p>
            </div>
          </div>
          <UsersByRoleChart data={charts.usersByRole} />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Registrations</h2>
              <p className="text-xs text-gray-500">New user sign-ups over the last 6 months</p>
            </div>
          </div>
          <RegistrationsChart data={charts.registrationsLast6Months} />
        </div>
      </div>

      {/* Tables Section (Recent 5 Users & Recent 5 Records) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Users</h2>
            <Link
              to="/admin/users"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Manage all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <DataTable
            columns={userColumns}
            data={recentUsers}
            loading={loading}
            emptyMessage="No recent users recorded"
          />
        </div>

        {/* Recent Records */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Projects</h2>
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
            emptyMessage="No recent records recorded"
          />
        </div>
      </div>
    </div>
  );
};

