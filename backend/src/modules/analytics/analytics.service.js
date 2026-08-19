import mongoose from 'mongoose';
import Job from '../jobs/jobs.model.js';
import Customer from '../customers/customers.model.js';
import Staff from '../staff/staff.model.js';

/**
 * Helper to calculate date boundaries for timeframes
 */
const getTimeframeBoundaries = (timeframe, startDateRaw, endDateRaw) => {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  let startDate, endDate;

  const validTimeframes = ['week', 'month', 'year', 'custom'];
  if (timeframe && !validTimeframes.includes(timeframe)) {
    const error = new Error('Invalid timeframe specified. Must be week, month, year, or custom.');
    error.statusCode = 400;
    throw error;
  }

  const selectedTimeframe = timeframe || 'month';

  if (selectedTimeframe === 'week') {
    startDate = new Date(startOfToday);
    startDate.setDate(startDate.getDate() - 6);
    endDate = endOfToday;
  } else if (selectedTimeframe === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    endDate = endOfToday;
  } else if (selectedTimeframe === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    endDate = endOfToday;
  } else if (selectedTimeframe === 'custom') {
    if (!startDateRaw || !endDateRaw) {
      const error = new Error('startDate and endDate are required for custom timeframe (YYYY-MM-DD).');
      error.statusCode = 400;
      throw error;
    }

    startDate = new Date(startDateRaw);
    endDate = new Date(endDateRaw);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      const error = new Error('Invalid date format for startDate or endDate. Use YYYY-MM-DD.');
      error.statusCode = 400;
      throw error;
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
      const error = new Error('startDate cannot be after endDate.');
      error.statusCode = 400;
      throw error;
    }
  }

  return { startDate, endDate, timeframe: selectedTimeframe };
};

/**
 * 1. GET ANALYTICS OVERVIEW
 */
export const getOverviewAnalytics = async (businessId, query = {}) => {
  const bId = new mongoose.Types.ObjectId(String(businessId));
  const { startDate, endDate } = getTimeframeBoundaries(query.timeframe, query.startDate, query.endDate);

  const [
    revenueResult,
    totalJobsCount,
    completedJobsCount,
    cancelledJobsCount,
    newCustomersCount,
    returningCustomersCount,
    paymentBreakdownResult,
  ] = await Promise.all([
    // Total Realized Revenue (Completed jobs within timeframe)
    Job.aggregate([
      {
        $match: {
          businessId: bId,
          status: 'Completed',
          completedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' },
        },
      },
    ]),

    // Total Jobs Created in Timeframe
    Job.countDocuments({
      businessId: bId,
      createdAt: { $gte: startDate, $lte: endDate },
    }),

    // Completed Jobs in Timeframe
    Job.countDocuments({
      businessId: bId,
      status: 'Completed',
      completedAt: { $gte: startDate, $lte: endDate },
    }),

    // Cancelled Jobs in Timeframe
    Job.countDocuments({
      businessId: bId,
      status: 'Cancelled',
      updatedAt: { $gte: startDate, $lte: endDate },
    }),

    // New Customers (firstVisitAt in timeframe)
    Customer.countDocuments({
      businessId: bId,
      firstVisitAt: { $gte: startDate, $lte: endDate },
    }),

    // Returning Customers (lastVisitAt > firstVisitAt & lastVisitAt in timeframe)
    Customer.countDocuments({
      businessId: bId,
      $or: [
        { totalVisits: { $gt: 1 } },
        { $expr: { $gt: ['$lastVisitAt', '$firstVisitAt'] } },
      ],
      lastVisitAt: { $gte: startDate, $lte: endDate },
    }),

    // Payment breakdown aggregation
    Job.aggregate([
      {
        $match: {
          businessId: bId,
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          paidRevenue: { $sum: '$paidAmount' },
          outstandingBalance: { $sum: '$balanceAmount' },
          paidCount: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, 1, 0] } },
          partialCount: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'PARTIAL'] }, 1, 0] } },
          unpaidCount: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'UNPAID'] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue || 0 : 0;
  const paymentBreakdown = (paymentBreakdownResult && paymentBreakdownResult.length > 0) ? paymentBreakdownResult[0] : {};
  const paidRevenue = paymentBreakdown.paidRevenue || 0;
  const outstandingBalance = paymentBreakdown.outstandingBalance || 0;
  const paidCount = paymentBreakdown.paidCount || 0;
  const partialCount = paymentBreakdown.partialCount || 0;
  const unpaidCount = paymentBreakdown.unpaidCount || 0;

  const totalJobs = totalJobsCount || 0;
  const completedJobs = completedJobsCount || 0;
  const avgJobValue = completedJobs > 0 ? Math.round((totalRevenue / completedJobs) * 100) / 100 : 0;
  const completionRate = totalJobs > 0 ? Math.round(((completedJobs / totalJobs) * 100) * 100) / 100 : 0;

  return {
    totalRevenue,
    paidRevenue,
    outstandingBalance,
    paidCount,
    partialCount,
    unpaidCount,
    totalJobs,
    completedJobs,
    cancelledJobs: cancelledJobsCount || 0,
    completionRate,
    avgJobValue,
    newCustomers: newCustomersCount || 0,
    returningCustomers: returningCustomersCount || 0,
  };
};

/**
 * 2. GET REVENUE TREND
 */
export const getRevenueTrend = async (businessId, query = {}) => {
  const bId = new mongoose.Types.ObjectId(String(businessId));
  const timeframe = query.timeframe || 'month';

  if (!['week', 'month', 'year'].includes(timeframe)) {
    const error = new Error('Invalid timeframe for revenue trend. Must be week, month, or year.');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const labels = [];
  const values = [];

  if (timeframe === 'week') {
    // 7 Daily Buckets (6 days ago through today)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      buckets.push({
        label: dayNames[start.getDay()],
        start,
        end,
      });
    }

    const startPeriod = buckets[0].start;
    const endPeriod = buckets[6].end;

    const rawData = await Job.aggregate([
      {
        $match: {
          businessId: bId,
          status: 'Completed',
          completedAt: { $gte: startPeriod, $lte: endPeriod },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' },
            day: { $dayOfMonth: '$completedAt' },
          },
          total: { $sum: '$grandTotal' },
        },
      },
    ]);

    buckets.forEach((b) => {
      labels.push(b.label);
      const match = rawData.find(
        (r) =>
          r._id.year === b.start.getFullYear() &&
          r._id.month === b.start.getMonth() + 1 &&
          r._id.day === b.start.getDate()
      );
      values.push(match ? match.total || 0 : 0);
    });
  } else if (timeframe === 'month') {
    // 4 Weekly Buckets for current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const weekBuckets = [
      { label: 'Week 1', start: new Date(startOfMonth), end: new Date(now.getFullYear(), now.getMonth(), 7, 23, 59, 59, 999) },
      { label: 'Week 2', start: new Date(now.getFullYear(), now.getMonth(), 8, 0, 0, 0, 0), end: new Date(now.getFullYear(), now.getMonth(), 14, 23, 59, 59, 999) },
      { label: 'Week 3', start: new Date(now.getFullYear(), now.getMonth(), 15, 0, 0, 0, 0), end: new Date(now.getFullYear(), now.getMonth(), 21, 23, 59, 59, 999) },
      { label: 'Week 4', start: new Date(now.getFullYear(), now.getMonth(), 22, 0, 0, 0, 0), end: endOfMonth },
    ];

    const rawData = await Job.aggregate([
      {
        $match: {
          businessId: bId,
          status: 'Completed',
          completedAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          jobs: { $push: { completedAt: '$completedAt', grandTotal: '$grandTotal' } },
        },
      },
    ]);

    const completedJobsList = rawData.length > 0 ? rawData[0].jobs : [];

    weekBuckets.forEach((wb) => {
      labels.push(wb.label);
      const total = completedJobsList
        .filter((j) => {
          const dt = new Date(j.completedAt);
          return dt >= wb.start && dt <= wb.end;
        })
        .reduce((sum, j) => sum + (j.grandTotal || 0), 0);
      values.push(total);
    });
  } else if (timeframe === 'year') {
    // 12 Monthly Buckets for current year
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const rawData = await Job.aggregate([
      {
        $match: {
          businessId: bId,
          status: 'Completed',
          completedAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$completedAt' } },
          total: { $sum: '$grandTotal' },
        },
      },
    ]);

    for (let m = 1; m <= 12; m++) {
      labels.push(monthNames[m - 1]);
      const match = rawData.find((r) => r._id.month === m);
      values.push(match ? match.total || 0 : 0);
    }
  }

  return {
    timeframe,
    labels,
    values,
  };
};

/**
 * 3. GET MONTH-OVER-MONTH (MoM) COMPARISON
 */
export const getMoMComparison = async (businessId) => {
  const bId = new mongoose.Types.ObjectId(String(businessId));
  const now = new Date();

  // Current Month: 1st day of current month to current time (23:59:59)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Previous Month: 1st day of previous month to last day of previous month
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [currentResult, previousResult] = await Promise.all([
    Job.aggregate([
      {
        $match: {
          businessId: bId,
          status: 'Completed',
          completedAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' },
        },
      },
    ]),
    Job.aggregate([
      {
        $match: {
          businessId: bId,
          status: 'Completed',
          completedAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' },
        },
      },
    ]),
  ]);

  const currentMonthRevenue = currentResult.length > 0 ? currentResult[0].totalRevenue || 0 : 0;
  const previousMonthRevenue = previousResult.length > 0 ? previousResult[0].totalRevenue || 0 : 0;

  const netGrowth = currentMonthRevenue - previousMonthRevenue;
  const percentageGrowth =
    previousMonthRevenue === 0
      ? 0
      : Math.round(((netGrowth / previousMonthRevenue) * 100) * 100) / 100;

  return {
    currentMonthRevenue,
    previousMonthRevenue,
    netGrowth,
    percentageGrowth,
  };
};

/**
 * 4. GET SERVICE POPULARITY ANALYTICS
 */
export const getServicePopularityAnalytics = async (businessId, query = {}) => {
  const bId = new mongoose.Types.ObjectId(String(businessId));
  const { startDate, endDate } = getTimeframeBoundaries(query.timeframe, query.startDate, query.endDate);

  const rawServices = await Job.aggregate([
    {
      $match: {
        businessId: bId,
        status: 'Completed',
        completedAt: { $gte: startDate, $lte: endDate },
      },
    },
    { $unwind: '$services' },
    {
      $group: {
        _id: {
          serviceId: '$services.serviceId',
          name: '$services.name',
        },
        jobCount: { $sum: 1 },
        revenue: { $sum: '$services.price' },
      },
    },
    { $sort: { jobCount: -1, revenue: -1 } },
  ]);

  const totalUsages = rawServices.reduce((sum, item) => sum + item.jobCount, 0);

  const result = rawServices.map((item) => {
    const jobCount = item.jobCount || 0;
    const percentage = totalUsages > 0 ? Math.round(((jobCount / totalUsages) * 100) * 100) / 100 : 0;
    return {
      serviceId: item._id.serviceId || item._id.name,
      serviceName: item._id.name,
      jobCount,
      revenue: item.revenue || 0,
      percentage,
    };
  });

  return result;
};

/**
 * 5. GET VEHICLE CATEGORY BREAKDOWN ANALYTICS
 */
export const getVehicleBreakdownAnalytics = async (businessId, query = {}) => {
  const bId = new mongoose.Types.ObjectId(String(businessId));
  const { startDate, endDate } = getTimeframeBoundaries(query.timeframe, query.startDate, query.endDate);

  const rawCategories = await Job.aggregate([
    {
      $match: {
        businessId: bId,
        status: 'Completed',
        completedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$vehicleCategory',
        jobCount: { $sum: 1 },
        revenue: { $sum: '$grandTotal' },
      },
    },
    { $sort: { jobCount: -1 } },
  ]);

  const totalCompletedJobs = rawCategories.reduce((sum, item) => sum + item.jobCount, 0);

  const result = rawCategories.map((item) => {
    const jobCount = item.jobCount || 0;
    const percentage =
      totalCompletedJobs > 0 ? Math.round(((jobCount / totalCompletedJobs) * 100) * 100) / 100 : 0;
    return {
      category: item._id || 'Other',
      jobCount,
      revenue: item.revenue || 0,
      percentage,
    };
  });

  return result;
};

/**
 * 6. GET STAFF PERFORMANCE ANALYTICS
 */
export const getStaffPerformanceAnalytics = async (businessId, query = {}) => {
  const bId = new mongoose.Types.ObjectId(String(businessId));
  const { startDate, endDate } = getTimeframeBoundaries(query.timeframe, query.startDate, query.endDate);

  // Fetch all active staff members for this business
  const allStaff = await Staff.find({ businessId: bId });

  // Aggregate completed jobs per staff member
  const rawStaffPerformance = await Job.aggregate([
    {
      $match: {
        businessId: bId,
        status: 'Completed',
        completedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          staffId: '$assignedStaff.staffId',
          name: '$assignedStaff.name',
        },
        completedJobs: { $sum: 1 },
        totalRevenue: { $sum: '$grandTotal' },
      },
    },
    { $sort: { completedJobs: -1 } },
  ]);

  const topCompletedJobs = rawStaffPerformance.length > 0 ? rawStaffPerformance[0].completedJobs : 0;

  // Build unified staff performance map
  const performanceList = [];
  const processedStaffIds = new Set();

  // First map existing staff documents
  allStaff.forEach((staffDoc) => {
    const staffIdStr = staffDoc._id.toString();
    processedStaffIds.add(staffIdStr);

    const match = rawStaffPerformance.find(
      (r) => (r._id && r._id.staffId === staffIdStr) || (r._id && r._id.name === staffDoc.name)
    );

    const completedJobs = match ? match.completedJobs || 0 : 0;
    const totalRevenue = match ? match.totalRevenue || 0 : 0;
    const averageJobValue = completedJobs > 0 ? Math.round((totalRevenue / completedJobs) * 100) / 100 : 0;
    const performancePercentage =
      topCompletedJobs > 0 ? Math.round((completedJobs / topCompletedJobs) * 100) : 0;

    performanceList.push({
      staffId: staffIdStr,
      name: staffDoc.name,
      avatar: staffDoc.avatar || null,
      role: staffDoc.role || 'Specialist',
      completedJobs,
      totalRevenue,
      averageJobValue,
      performancePercentage,
    });
  });

  // Then add any staff snapshots in jobs that might not be in Staff model
  rawStaffPerformance.forEach((r) => {
    if (r._id && r._id.staffId && !processedStaffIds.has(r._id.staffId)) {
      const completedJobs = r.completedJobs || 0;
      const totalRevenue = r.totalRevenue || 0;
      const averageJobValue = completedJobs > 0 ? Math.round((totalRevenue / completedJobs) * 100) / 100 : 0;
      const performancePercentage =
        topCompletedJobs > 0 ? Math.round((completedJobs / topCompletedJobs) * 100) : 0;

      performanceList.push({
        staffId: r._id.staffId,
        name: r._id.name || 'Specialist',
        avatar: null,
        role: 'Specialist',
        completedJobs,
        totalRevenue,
        averageJobValue,
        performancePercentage,
      });
    }
  });

  // Sort by completedJobs descending
  performanceList.sort((a, b) => b.completedJobs - a.completedJobs);

  return performanceList;
};
