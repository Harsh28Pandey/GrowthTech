import React, { useState, useEffect } from 'react';
import { roleApi } from '../../api/roleApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import {
  Shield,
  ShieldPlus,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  Users,
  Info,
  Key,
} from 'lucide-react';

export const RoleManagement = () => {
  usePageTitle('Roles & Permissions');
  const toast = useToast();

  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [matrixModalOpen, setMatrixModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [],
  });
  const [createErrors, setCreateErrors] = useState({});

  // Matrix edit state
  const [editedPermissions, setEditedPermissions] = useState([]);

  const fetchRolesData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await roleApi.getRoles();
      if (res.success && res.data) {
        setRoles(res.data.roles || []);
        setAvailablePermissions(res.data.availablePermissions || []);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load roles and permissions';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  // Open Create Role Modal
  const handleOpenCreate = () => {
    setCreateFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: ['records:read'],
    });
    setCreateErrors({});
    setCreateModalOpen(true);
  };

  // Open Permissions Matrix Modal
  const handleOpenMatrix = (role) => {
    setSelectedRole(role);
    setEditedPermissions([...(role.permissions || [])]);
    setMatrixModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (role) => {
    if (role.isSystem || ['admin', 'manager', 'user'].includes(role.name)) {
      toast.error('System roles cannot be deleted.');
      return;
    }
    if (role.userCount > 0) {
      toast.error(`Cannot delete role assigned to ${role.userCount} active users.`);
      return;
    }
    setSelectedRole(role);
    setConfirmDeleteOpen(true);
  };

  // Toggle permission in editedPermissions array
  const togglePermission = (permKey) => {
    if (selectedRole?.name === 'admin' && permKey === 'roles:write') {
      toast.warning('The administrator role must retain roles:write permissions.');
      return;
    }
    setEditedPermissions((prev) =>
      prev.includes(permKey)
        ? prev.filter((k) => k !== permKey)
        : [...prev, permKey]
    );
  };

  // Toggle permission in Create Form
  const toggleCreatePermission = (permKey) => {
    setCreateFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter((k) => k !== permKey)
        : [...prev.permissions, permKey],
    }));
  };

  // Save updated permissions
  const handleSaveMatrix = async () => {
    if (!selectedRole) return;
    try {
      setActionLoading(true);
      const res = await roleApi.updateRole(selectedRole._id, {
        permissions: editedPermissions,
      });
      if (res.success) {
        toast.success(`Permissions updated for role "${selectedRole.displayName}"`);
        setMatrixModalOpen(false);
        fetchRolesData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update permissions';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Create Custom Role
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!createFormData.name.trim()) {
      errors.name = 'Role system identifier is required';
    } else if (!/^[a-z0-9_-]+$/.test(createFormData.name)) {
      errors.name = 'Only lowercase letters, numbers, hyphens, and underscores allowed';
    }

    if (!createFormData.displayName.trim()) {
      errors.displayName = 'Display name is required';
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    try {
      setActionLoading(true);
      const res = await roleApi.createRole(createFormData);
      if (res.success) {
        toast.success(`Custom role "${res.data.displayName}" created!`);
        setCreateModalOpen(false);
        fetchRolesData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create role';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    if (!selectedRole) return;
    try {
      setActionLoading(true);
      const res = await roleApi.deleteRole(selectedRole._id);
      if (res.success) {
        toast.success(`Role "${selectedRole.displayName}" removed successfully.`);
        setConfirmDeleteOpen(false);
        setSelectedRole(null);
        fetchRolesData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete role';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Group available permissions by 'group' (Users, Roles, Records)
  const permissionGroups = availablePermissions.reduce((acc, perm) => {
    const grp = perm.group || 'General';
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(perm);
    return acc;
  }, {});

  if (loading && roles.length === 0) {
    return <Loader size="lg" text="Loading roles and permissions matrix..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Role & Access Control
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure system access roles, define custom roles, and fine-tune permission matrices
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={ShieldPlus}
          className="self-start sm:self-auto"
        >
          Create Custom Role
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map((role) => {
          const isSystem = role.isSystem || ['admin', 'manager', 'user'].includes(role.name);
          const hasAssignedUsers = role.userCount > 0;

          return (
            <div
              key={role._id}
              className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-none"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">
                      {role.displayName}
                    </h3>
                    <code className="text-xs text-gray-400 font-mono">
                      {role.name}
                    </code>
                  </div>
                  <Badge variant={role.name === 'admin' ? 'purple' : isSystem ? 'blue' : 'gray'}>
                    {isSystem ? 'System' : 'Custom'}
                  </Badge>
                </div>

                <p className="mt-2.5 text-xs text-gray-600 min-h-[36px] line-clamp-2">
                  {role.description || 'No specific description provided.'}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      <strong className="text-gray-800">{role.userCount}</strong> assigned
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      <strong className="text-gray-800">{role.permissions?.length || 0}</strong>{' '}
                      permissions
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenMatrix(role)}
                  icon={Edit}
                  className="flex-1"
                >
                  Permissions Matrix
                </Button>

                {!isSystem && (
                  <button
                    type="button"
                    disabled={hasAssignedUsers}
                    onClick={() => handleOpenDelete(role)}
                    className={`p-1.5 rounded border border-gray-200 ${
                      hasAssignedUsers
                        ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                        : 'text-red-600 hover:bg-red-50 hover:border-red-200'
                    }`}
                    title={
                      hasAssignedUsers
                        ? `Cannot delete role assigned to ${role.userCount} users`
                        : 'Delete Custom Role'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Permission Overview Matrix */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              System Permission Matrix Overview
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Read-only matrix comparing access rights across all configured roles
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">
                  Permission / Capability
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">
                  Group
                </th>
                {roles.map((r) => (
                  <th
                    key={r._id}
                    className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-center"
                  >
                    {r.displayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {availablePermissions.map((perm) => (
                <tr key={perm.key} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">
                    <div>{perm.label}</div>
                    <code className="text-[11px] text-gray-400 font-mono">{perm.key}</code>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{perm.group}</td>
                  {roles.map((r) => {
                    const hasPerm =
                      r.name === 'admin' || (r.permissions && r.permissions.includes(perm.key));
                    return (
                      <td key={r._id} className="px-4 py-2.5 text-center">
                        {hasPerm ? (
                          <span className="inline-flex p-1 text-green-600 bg-green-50 rounded">
                            <CheckSquare className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 text-gray-300">
                            <Square className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Permissions Matrix Modal */}
      <Modal
        isOpen={matrixModalOpen}
        onClose={() => setMatrixModalOpen(false)}
        title={`Edit Permissions: ${selectedRole?.displayName}`}
        subtitle={`System identifier: ${selectedRole?.name}`}
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setMatrixModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveMatrix}
              loading={actionLoading}
            >
              Save Permissions Matrix
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {selectedRole?.name === 'admin' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
              <span>
                The administrator role possesses wildcard system capabilities by design.
                Essential permissions cannot be revoked.
              </span>
            </div>
          )}

          {Object.entries(permissionGroups).map(([groupName, perms]) => (
            <div key={groupName} className="border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                {groupName} Management
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {perms.map((perm) => {
                  const isChecked = editedPermissions.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.key)}
                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-gray-800 block">
                          {perm.label}
                        </span>
                        <code className="text-[10px] text-gray-400 font-mono">
                          {perm.key}
                        </code>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Create Custom Role Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Custom Role"
        subtitle="Provision an organization role with custom granular permissions"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleCreateSubmit}
              loading={actionLoading}
            >
              Create Role
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Role Identifier (key)"
              name="name"
              placeholder="e.g. auditor"
              value={createFormData.name}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, name: e.target.value.toLowerCase() })
              }
              error={createErrors.name}
              helperText="Lowercase letters, hyphens only"
              required
            />

            <Input
              label="Display Name"
              name="displayName"
              placeholder="e.g. Security Auditor"
              value={createFormData.displayName}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, displayName: e.target.value })
              }
              error={createErrors.displayName}
              required
            />
          </div>

          <Input
            label="Role Description"
            name="description"
            placeholder="Brief explanation of duties and access level..."
            value={createFormData.description}
            onChange={(e) =>
              setCreateFormData({ ...createFormData, description: e.target.value })
            }
          />

          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Assigned Permissions
            </label>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {Object.entries(permissionGroups).map(([groupName, perms]) => (
                <div key={groupName} className="border border-gray-200 rounded p-3">
                  <div className="text-xs font-bold text-gray-600 mb-2">{groupName}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <label
                        key={perm.key}
                        className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={createFormData.permissions.includes(perm.key)}
                          onChange={() => toggleCreatePermission(perm.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Custom Role"
        message={`Are you sure you want to delete the role "${selectedRole?.displayName}" (${selectedRole?.name})? This action cannot be undone.`}
        confirmText="Delete Role"
        loading={actionLoading}
      />
    </div>
  );
};

