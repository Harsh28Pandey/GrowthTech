import React, { useState, useEffect, useCallback } from 'react';
import { recordApi } from '../../api/recordApi';
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
  RECORD_CATEGORIES,
  RECORD_STATUSES,
  RECORD_PRIORITIES,
} from '../../utils/constants';
import {
  FolderPlus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  User as UserIcon,
  Clock,
  Tag,
  AlertTriangle,
} from 'lucide-react';

export const Records = () => {
  usePageTitle('Project Records');
  const { user, isAdmin, isManager, hasPermission } = useAuth();
  const toast = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Search and Filter controls
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Engineering',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const canManageAll = isAdmin || isManager;

  const fetchRecords = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError('');
        const params = {
          page,
          limit: 10,
          search: debouncedSearch || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          sortBy,
          sortOrder,
        };

        const res = await recordApi.getRecords(params);
        if (res.success) {
          setRecords(res.data || []);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to fetch project records';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedSearch,
      categoryFilter,
      statusFilter,
      priorityFilter,
      sortBy,
      sortOrder,
      toast,
    ]
  );

  useEffect(() => {
    fetchRecords(1);
  }, [fetchRecords]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setSelectedRecord(null);
    // default due date: 14 days from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const defaultDateStr = d.toISOString().split('T')[0];

    setFormData({
      title: '',
      description: '',
      category: 'Engineering',
      status: 'pending',
      priority: 'medium',
      dueDate: defaultDateStr,
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rec) => {
    setSelectedRecord(rec);
    const dateStr = rec.dueDate
      ? new Date(rec.dueDate).toISOString().split('T')[0]
      : '';

    setFormData({
      title: rec.title,
      description: rec.description,
      category: rec.category,
      status: rec.status,
      priority: rec.priority,
      dueDate: dateStr,
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (rec) => {
    setSelectedRecord(rec);
    setDetailModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (rec) => {
    setSelectedRecord(rec);
    setConfirmDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;
    try {
      setActionLoading(true);
      const res = await recordApi.deleteRecord(selectedRecord._id);
      if (res.success) {
        toast.success('Project record successfully deleted.');
        setConfirmDeleteOpen(false);
        setSelectedRecord(null);
        fetchRecords(pagination.page);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete record';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.title.trim()) errors.title = 'Project title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.dueDate) errors.dueDate = 'Due date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setActionLoading(true);
      if (selectedRecord) {
        // Update
        const res = await recordApi.updateRecord(selectedRecord._id, formData);
        if (res.success) {
          toast.success('Project record updated successfully.');
          setFormModalOpen(false);
          fetchRecords(pagination.page);
        }
      } else {
        // Create
        const res = await recordApi.createRecord(formData);
        if (res.success) {
          toast.success('New project record created successfully.');
          setFormModalOpen(false);
          fetchRecords(1);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save project record';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Title & Description',
      key: 'title',
      render: (row) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{row.title}</div>
          <div className="text-xs text-gray-500 truncate">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      render: (row) => (
        <span className="text-xs text-gray-700 font-medium">{row.category}</span>
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
      header: 'Owner',
      key: 'createdBy',
      render: (row) => {
        const isSelf = row.createdBy?._id === user?._id;
        return (
          <span className="text-xs text-gray-700">
            {row.createdBy?.name || 'Unknown'} {isSelf && '(You)'}
          </span>
        );
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
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => {
        const isOwner = row.createdBy?._id === user?._id;
        const canEdit = isOwner || canManageAll;

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => handleOpenDetail(row)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
              title="View Project Details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(row)}
                  className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
                  title="Edit Project"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDelete(row)}
                  className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Projects & Records
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {canManageAll
              ? 'Organization-wide project record tracking and lifecycle management'
              : 'Manage your personal deliverables, due dates, and project statuses'}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={FolderPlus}
          className="self-start sm:self-auto"
        >
          New Project
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Input
            id="record-search"
            placeholder="Search projects by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={Search}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-36">
            <Select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...RECORD_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>

          <div className="w-32">
            <Select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                ...RECORD_STATUSES.map((s) => ({ value: s.value, label: s.label })),
              ]}
            />
          </div>

          <div className="w-32">
            <Select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Priorities' },
                ...RECORD_PRIORITIES.map((p) => ({ value: p.value, label: p.label })),
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'createdAt', label: 'Created Date' },
                { value: 'dueDate', label: 'Due Date' },
                { value: 'title', label: 'Title' },
                { value: 'status', label: 'Status' },
                { value: 'priority', label: 'Priority' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        error={error}
        emptyMessage="No project records match your current criteria"
        pagination={pagination}
        onPageChange={(newPage) => fetchRecords(newPage)}
      />

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={selectedRecord ? 'Edit Project Record' : 'Create New Project Record'}
        subtitle={
          selectedRecord
            ? `Modify settings for project "${selectedRecord.title}"`
            : 'Enter information below to log a new tracked deliverable'
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
              {selectedRecord ? 'Save Changes' : 'Create Project'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          <Input
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
            required
            placeholder="e.g. Infrastructure Migration"
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`block w-full rounded-md border text-sm text-gray-900 bg-white p-3 ${
                formErrors.description
                  ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
              }`}
              placeholder="Describe goals, milestones, and deliverables..."
              required
            />
            {formErrors.description && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {formErrors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={RECORD_CATEGORIES}
              required
            />

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={RECORD_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={RECORD_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
              required
            />

            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              error={formErrors.dueDate}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Detail View Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Project Details"
        subtitle={selectedRecord?.title}
        maxWidth="max-w-xl"
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
        {selectedRecord && (
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                Description
              </span>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {selectedRecord.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 border border-gray-200 rounded-md">
                <span className="text-xs text-gray-500 block">Category</span>
                <span className="font-semibold text-gray-800 text-xs">
                  {selectedRecord.category}
                </span>
              </div>

              <div className="p-3 border border-gray-200 rounded-md">
                <span className="text-xs text-gray-500 block">Status</span>
                <Badge
                  variant={
                    selectedRecord.status === 'completed'
                      ? 'green'
                      : selectedRecord.status === 'in-progress'
                      ? 'blue'
                      : 'amber'
                  }
                  className="mt-1"
                >
                  {selectedRecord.status}
                </Badge>
              </div>

              <div className="p-3 border border-gray-200 rounded-md">
                <span className="text-xs text-gray-500 block">Priority</span>
                <Badge
                  variant={
                    selectedRecord.priority === 'high'
                      ? 'red'
                      : selectedRecord.priority === 'medium'
                      ? 'amber'
                      : 'gray'
                  }
                  className="mt-1"
                >
                  {selectedRecord.priority}
                </Badge>
              </div>
            </div>

            <div className="p-3 border border-gray-200 rounded-md space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Project ID:</span>
                <span className="font-mono text-gray-700">{selectedRecord._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Owner:</span>
                <span className="text-gray-800 font-medium">
                  {selectedRecord.createdBy?.name} ({selectedRecord.createdBy?.email})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date:</span>
                <span className="text-gray-700">
                  {new Date(selectedRecord.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created At:</span>
                <span className="text-gray-700">
                  {new Date(selectedRecord.createdAt).toLocaleString()}
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
        title="Delete Project Record"
        message={`Are you sure you want to delete "${selectedRecord?.title}"? This record cannot be recovered once removed.`}
        confirmText="Delete Project"
        loading={actionLoading}
      />
    </div>
  );
};

