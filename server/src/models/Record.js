import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Engineering',
          'Marketing',
          'Sales',
          'Design',
          'Operations',
          'Finance',
          'Human Resources',
          'Other',
        ],
        message: 'Invalid category',
      },
      default: 'Engineering',
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: 'Status must be pending, in-progress, or completed',
      },
      default: 'pending',
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy user reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance searches and filters
recordSchema.index({ createdBy: 1 });
recordSchema.index({ status: 1 });
recordSchema.index({ priority: 1 });
recordSchema.index({ category: 1 });
recordSchema.index({ createdAt: -1 });

export const Record = mongoose.model('Record', recordSchema);

