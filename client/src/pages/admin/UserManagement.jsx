import React, { useState, useEffect, useCallback } from 'react';
import { userApi } from '../../api/userApi';
import { roleApi } from '../../api/roleApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import { usePageTitle } from '../../hooks/usePageTitle';
import { DataTable } from '../../components/dashboard/DataTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  Mail,
  User as UserIcon,
} from 'lucide-react';

export const UserManagement = () => {
  usePageTitle('User Management');
  const { user: currentUser } = useAuth();
  const toast = useToast();

  // Data states
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Filters & Search
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch roles for filter dropdown and user creation
  const fetchRoles = async () => {
    try {
      const res = await roleApi.getRoles();
      if (res.success && res.data?.roles) {
        setRoles(res.data.roles);
      }
    } catch (err) {
      console.error('Failed to load roles', err);
    }
  };

  // Fetch users with filters
  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy,
        sortOrder,
      };

      const res = await userApi.getUsers(params);
      if (res.success) {
        setUsers(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load users list';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: roles.find((r) => r.name === 'user')?._id || roles[0]?._id || '',
      status: 'active',
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Blank unless admin enters a new password
      role: user.role?._id || user.role,
      status: user.status,
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Detail View Modal
  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (user) => {
    if (user._id === currentUser?._id) {
      toast.error('You cannot delete your own administrative account.');
      return;
    }
    setSelectedUser(user);
    setConfirmDeleteOpen(true);
  };

  // Toggle user status
  const handleToggleStatus = async (user) => {
    if (user._id === currentUser?._id) {
      toast.error('You cannot deactivate your own administrative account.');
      return;
    }

    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await userApi.toggleStatus(user._id, nextStatus);
      if (res.success) {
        toast.success(`User status updated to ${nextStatus}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user status';
      toast.error(msg);
    }
  };

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const res = await userApi.deleteUser(selectedUser._id);
      if (res.success) {
        toast.success('User and associated records successfully deleted.');
        setConfirmDeleteOpen(false);
        setSelectedUser(null);
        fetchUsers(pagination.page);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete user';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Create or Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';
    if (!formData.role) errors.role = 'Role is required';

    if (!selectedUser) {
      // Create mode
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      } else if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
        errors.password = 'Must contain uppercase letters and numbers';
      }
    } else if (formData.password && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setActionLoading(true);
      if (selectedUser) {
        // Update user
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status,
        };
        if (formData.password) payload.password = formData.password;

        const res = await userApi.updateUser(selectedUser._id, payload);
        if (res.success) {
          toast.success('User details updated successfully');
          setFormModalOpen(false);
          fetchUsers(pagination.page);
        }
      } else {
        // Create user
        const res = await userApi.createUser(formData);
        if (res.success) {
          toast.success('New user account created successfully');
          setFormModalOpen(false);
          fetchUsers(1);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save user account';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'User Details',
      key: 'name',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-1.5">
            {row.name}
            {row._id === currentUser?._id && (
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                You
              </span>
            )}
          </div>
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
      render: (row) => {
        const isSelf = row._id === currentUser?._id;
        return (
          <div className="flex items-center gap-2">
            <Badge variant={row.status === 'active' ? 'green' : 'red'}>
              {row.status}
            </Badge>
            <button
              type="button"
              disabled={isSelf}
              onClick={() => handleToggleStatus(row)}
              className={`text-xs underline transition-colors ${
                isSelf
                  ? 'text-gray-300 cursor-not-allowed'
                  : row.status === 'active'
                  ? 'text-red-600 hover:text-red-800'
                  : 'text-green-600 hover:text-green-800'
              }`}
              title={isSelf ? 'Cannot deactivate your own account' : 'Click to toggle status'}
            >
              {row.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        );
      },
    },
    {
      header: 'Created On',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => {
        const isSelf = row._id === currentUser?._id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => handleOpenDetail(row)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
              title="View User Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleOpenEdit(row)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
              title="Edit User"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={isSelf}
              onClick={() => handleOpenDelete(row)}
              className={`p-1 rounded ${
                isSelf
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`}
              title={isSelf ? 'Cannot delete own account' : 'Delete User'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    ...roles.map((r) => ({ value: r._id, label: r.displayName })),
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            View, create, edit, deactivate, and manage access for platform users
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={UserPlus}
          className="self-start sm:self-auto"
        >
          Add New User
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Input
            id="user-search"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={Search}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-40">
            <Select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={roleOptions}
            />
          </div>

          <div className="w-36">
            <Select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>

          <div className="w-36">
            <Select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'createdAt', label: 'Date Created' },
                { value: 'name', label: 'Name' },
                { value: 'email', label: 'Email' },
                { value: 'status', label: 'Status' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        error={error}
        emptyMessage="No users matched your query"
        pagination={pagination}
        onPageChange={(newPage) => fetchUsers(newPage)}
      />

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={selectedUser ? 'Edit User Account' : 'Create New User Account'}
        subtitle={
          selectedUser
            ? `Update credentials and system role for ${selectedUser.name}`
            : 'Fill in details below to provision a new user'
        }
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleFormSubmit}
              loading={actionLoading}
            >
              {selectedUser ? 'Save Changes' : 'Create User'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
            placeholder="e.g. John Doe"
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
            required
            placeholder="john@growthtech.com"
          />

          <Select
            label="Assigned Role"
            name="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={roles.map((r) => ({ value: r._id, label: r.displayName }))}
            error={formErrors.role}
            required
          />

          <Select
            label="Account Status"
            name="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'active', label: 'Active (Login Permitted)' },
              { value: 'inactive', label: 'Inactive (Login Blocked)' },
            ]}
          />

          <Input
            label={selectedUser ? 'New Password (leave blank to keep current)' : 'Password'}
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={formErrors.password}
            required={!selectedUser}
            placeholder={selectedUser ? '••••••••' : 'Min 8 chars (A-Z, a-z, 0-9)'}
          />
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="User Profile Details"
        subtitle="Complete record information for this user"
        footer={
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDetailModalOpen(false)}
          >
            Close
          </Button>
        }
      >
        {selectedUser && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                <p className="text-xs text-gray-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-gray-200 rounded-md">
                <span className="text-xs text-gray-500 block">System Role</span>
                <Badge
                  variant={selectedUser.role?.name === 'admin' ? 'purple' : 'blue'}
                  className="mt-1"
                >
                  {selectedUser.role?.displayName || 'User'}
                </Badge>
              </div>

              <div className="p-3 border border-gray-200 rounded-md">
                <span className="text-xs text-gray-500 block">Account Status</span>
                <Badge
                  variant={selectedUser.status === 'active' ? 'green' : 'red'}
                  className="mt-1"
                >
                  {selectedUser.status}
                </Badge>
              </div>
            </div>

            <div className="p-3 border border-gray-200 rounded-md space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">User ID:</span>
                <span className="font-mono text-gray-700">{selectedUser._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created At:</span>
                <span className="text-gray-700">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Login:</span>
                <span className="text-gray-700">
                  {selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString()
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${selectedUser?.name}" (${selectedUser?.email})? All associated records and projects will also be purged.`}
        confirmText="Permanently Delete"
        loading={actionLoading}
      />
    </div>
  );
};

