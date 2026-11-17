import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Record } from '../models/Record.js';
import { Role } from '../models/Role.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const isAdminOrManager = ['admin', 'manager'].includes(req.user.role?.name?.toLowerCase());

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (isAdminOrManager) {
      // 1. Basic Counts
      const [totalUsers, activeUsers, inactiveUsers, totalRecords, newUsersThisMonth] =
        await Promise.all([
          User.countDocuments(),
          User.countDocuments({ status: 'active' }),
          User.countDocuments({ status: 'inactive' }),
          Record.countDocuments(),
          User.countDocuments({ createdAt: { $gte: startOfMonth } }),
        ]);

      // 2. Users grouped by Role (Aggregation)
      const usersByRoleAgg = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'roles',
            localField: '_id',
            foreignField: '_id',
            as: 'roleInfo',
          },
        },
        { $unwind: '$roleInfo' },
        {
          $project: {
            _id: 0,
            role: '$roleInfo.name',
            name: '$roleInfo.displayName',
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);

      // 3. User Registrations over last 6 months (Aggregation)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const registrationsAgg = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
          },
        },
      ]);

      // Format last 6 months labels even if some months have 0 registrations
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const registrationsLast6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const monthLabel = `${months[m - 1]} ${y.toString().slice(-2)}`;

        const match = registrationsAgg.find(
          (item) => item._id.year === y && item._id.month === m
        );

        registrationsLast6Months.push({
          month: monthLabel,
          users: match ? match.count : 0,
        });
      }

      // 4. Recent Users (latest 5)
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('role', 'name displayName')
        .select('-password');

      // 5. Recent Records (latest 5)
      const recentRecords = await Record.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('createdBy', 'name email');

      return apiResponse(res, 200, 'Admin dashboard statistics retrieved', {
        isAdmin: true,
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          totalRecords,
          newUsersThisMonth,
        },
        charts: {
          usersByRole: usersByRoleAgg,
          registrationsLast6Months,
        },
        recentUsers,
        recentRecords,
      });
    }

    // Regular User Dashboard View
    const userId = req.user._id;

    const [totalUserRecords, pendingRecords, inProgressRecords, completedRecords] =
      await Promise.all([
        Record.countDocuments({ createdBy: userId }),
        Record.countDocuments({ createdBy: userId, status: 'pending' }),
        Record.countDocuments({ createdBy: userId, status: 'in-progress' }),
        Record.countDocuments({ createdBy: userId, status: 'completed' }),
      ]);

    const recordsByPriorityAgg = await Record.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityMap = { low: 0, medium: 0, high: 0 };
    recordsByPriorityAgg.forEach((item) => {
      if (item._id && priorityMap.hasOwnProperty(item._id)) {
        priorityMap[item._id] = item.count;
      }
    });

    const recentRecords = await Record.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    return apiResponse(res, 200, 'User dashboard statistics retrieved', {
      isAdmin: false,
      stats: {
        totalRecords: totalUserRecords,
        pendingRecords,
        inProgressRecords,
        completedRecords,
      },
      priorityBreakdown: [
        { name: 'Low', count: priorityMap.low },
        { name: 'Medium', count: priorityMap.medium },
        { name: 'High', count: priorityMap.high },
      ],
      recentRecords,
      profile: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role?.displayName || 'User',
        status: req.user.status,
        lastLogin: req.user.lastLogin,
        memberSince: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

