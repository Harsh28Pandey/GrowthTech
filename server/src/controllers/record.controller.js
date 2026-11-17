import { Record } from '../models/Record.js';
import { ApiError } from '../utils/ApiError.js';
import { apiResponse } from '../utils/apiResponse.js';

/**
 * List records with search, filter by category/status/priority, sorting, and pagination
 * Admins and managers can see all records; regular users only see their own records.
 */
export const getRecords = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const {
      search,
      category,
      status,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    const roleName = req.user.role?.name?.toLowerCase();
    const canViewAll = ['admin', 'manager'].includes(roleName) ||
      (req.user.role?.permissions || []).includes('records:manage_all');

    if (!canViewAll) {
      query.createdBy = req.user._id;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const sortOption = {};
    const validSortFields = ['title', 'status', 'priority', 'dueDate', 'createdAt', 'category'];
    const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOption[actualSortField] = sortOrder === 'asc' ? 1 : -1;

    const [records, total] = await Promise.all([
      Record.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Record.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return apiResponse(res, 200, 'Records retrieved successfully', records, {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get record by ID
 */
export const getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id).populate('createdBy', 'name email');
    if (!record) {
      return next(ApiError.notFound('Record not found'));
    }

    const roleName = req.user.role?.name?.toLowerCase();
    const isOwner = record.createdBy?._id?.toString() === req.user._id.toString();
    const canViewAll = ['admin', 'manager'].includes(roleName);

    if (!isOwner && !canViewAll) {
      return next(ApiError.forbidden('You do not have permission to view this record.'));
    }

    return apiResponse(res, 200, 'Record retrieved successfully', record);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new record
 */
export const createRecord = async (req, res, next) => {
  try {
    const { title, description, category, status, priority, dueDate } = req.body;

    const record = await Record.create({
      title,
      description,
      category,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate,
      createdBy: req.user._id,
    });

    const populatedRecord = await Record.findById(record._id).populate(
      'createdBy',
      'name email'
    );

    return apiResponse(res, 201, 'Record created successfully', populatedRecord);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing record
 */
export const updateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, status, priority, dueDate } = req.body;

    const record = await Record.findById(id);
    if (!record) {
      return next(ApiError.notFound('Record not found'));
    }

    const roleName = req.user.role?.name?.toLowerCase();
    const isOwner = record.createdBy.toString() === req.user._id.toString();
    const canManageAll = ['admin', 'manager'].includes(roleName);

    if (!isOwner && !canManageAll) {
      return next(ApiError.forbidden('You do not have permission to modify this record.'));
    }

    if (title) record.title = title;
    if (description) record.description = description;
    if (category) record.category = category;
    if (status) record.status = status;
    if (priority) record.priority = priority;
    if (dueDate) record.dueDate = dueDate;

    await record.save();

    const updated = await Record.findById(id).populate('createdBy', 'name email');

    return apiResponse(res, 200, 'Record updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a record
 */
export const deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await Record.findById(id);
    if (!record) {
      return next(ApiError.notFound('Record not found'));
    }

    const roleName = req.user.role?.name?.toLowerCase();
    const isOwner = record.createdBy.toString() === req.user._id.toString();
    const canManageAll = ['admin', 'manager'].includes(roleName);

    if (!isOwner && !canManageAll) {
      return next(ApiError.forbidden('You do not have permission to delete this record.'));
    }

    await Record.findByIdAndDelete(id);

    return apiResponse(res, 200, 'Record deleted successfully');
  } catch (error) {
    next(error);
  }
};

