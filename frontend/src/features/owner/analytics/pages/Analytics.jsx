import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Car,
  Wrench,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as analyticsService from "../services/analyticsService.js";

const ReportsAnalytics = () => {
  const [revenueTimeframe, setRevenueTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live Backend Data States
  const [overviewData, setOverviewData] = useState(null);
  const [trendData, setTrendData] = useState({ labels: [], values: [] });
  const [momData, setMomData] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [staffData, setStaffData] = useState([]);

  const fetchAllAnalytics = async (timeframe) => {
    try {
      setLoading(true);
      setError(null);

      const params = { timeframe };

      const [overviewRes, trendRes, momRes, servicesRes, vehiclesRes, staffRes] = await Promise.all([
        analyticsService.getAnalyticsOverview(params),
        analyticsService.getRevenueTrend(params),
        analyticsService.getMomComparison(),
        analyticsService.getServicePopularity(params),
        analyticsService.getVehicleBreakdown(params),
        analyticsService.getStaffPerformance(params),
      ]);

      if (overviewRes.success) setOverviewData(overviewRes.data);
      if (trendRes.success) setTrendData(trendRes.data);
      if (momRes.success) setMomData(momRes.data);
      if (servicesRes.success) setServicesData(servicesRes.data || []);
      if (vehiclesRes.success) setVehiclesData(vehiclesRes.data || []);
      if (staffRes.success) setStaffData(staffRes.data || []);
    } catch (err) {
      console.error('Analytics Fetch Error:', err);
      setError(err.message || 'Failed to load analytics data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics(revenueTimeframe);
  }, [revenueTimeframe]);

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '₹0';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  // Calculate max graph bar height dynamically
  const graphValues = trendData?.values || [];
  const maxVal = graphValues.length > 0 ? Math.max(...graphValues, 1) : 1;

  if (loading && !overviewData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 space-y-3">
        <Loader2 className="w-9 h-9 animate-spin text-black" />
        <span className="text-sm font-semibold">Loading live shop analytics...</span>
      </div>
    );
  }

  if (error && !overviewData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-6 text-center space-y-4 my-6">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <div>
          <h3 className="text-lg font-bold">Analytics Data Unavailable</h3>
          <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>
        </div>
        <button
          onClick={() => fetchAllAnalytics(revenueTimeframe)}
          className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-all shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900">
      {/* HEADER & TIMEFRAME SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Reports & Analytics</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Track shop revenue trends, customer metrics, month-over-month growth, service popularity, vehicle breakdown, and staff performance.
          </p>
        </div>

        {/* Timeframe Selector Segmented Pill */}
        <div className="bg-gray-100 p-1 rounded-2xl flex items-center border border-gray-200 self-start sm:self-auto shadow-2xs">
          {['week', 'month', 'year'].map((tf) => (
            <button
              key={tf}
              onClick={() => setRevenueTimeframe(tf)}
              className={`px-4 py-1.5 text-xs font-extrabold capitalize rounded-xl transition-all ${
                revenueTimeframe === tf
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Realized Revenue */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Realized Revenue
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight block">
            {formatCurrency(overviewData?.totalRevenue)}
          </span>
          <span className="text-xs font-semibold text-gray-500 block">
            Avg Job Value: <strong className="text-gray-900">{formatCurrency(overviewData?.avgJobValue)}</strong>
          </span>
        </div>

        {/* Jobs Completed & Rate */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Completed Jobs
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight block">
            {overviewData?.completedJobs || 0}{' '}
            <span className="text-xs font-semibold text-gray-400">/ {overviewData?.totalJobs || 0} created</span>
          </span>
          <span className="text-xs font-semibold text-emerald-600 block">
            {overviewData?.completionRate || 0}% Completion Rate
          </span>
        </div>

        {/* New & Returning Customers */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              New / Returning
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight block">
            {overviewData?.newCustomers || 0}{' '}
            <span className="text-xs font-semibold text-gray-400">new</span> / {overviewData?.returningCustomers || 0}{' '}
            <span className="text-xs font-semibold text-gray-400">returning</span>
          </span>
          <span className="text-xs font-semibold text-gray-500 block">
            Total visit evidence in timeframe
          </span>
        </div>

        {/* Cancelled Jobs */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Cancelled Jobs
            </span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight block">
            {overviewData?.cancelledJobs || 0}
          </span>
          <span className="text-xs font-semibold text-gray-500 block">
            Excluded from realized revenue
          </span>
        </div>
      </div>

      {/* REVENUE GRAPH CARD */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Total Realized Revenue ({revenueTimeframe})
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-1 block">
              {formatCurrency(overviewData?.totalRevenue)}
            </span>
          </div>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {trendData?.labels?.length || 0} Period Buckets
          </div>
        </div>

        {/* Custom Bar Graph */}
        <div className="pt-4 pb-2">
          {graphValues.length > 0 ? (
            <div className="h-44 sm:h-52 flex items-end justify-between gap-3 px-2">
              {graphValues.map((val, idx) => {
                const heightPercent = Math.round((val / maxVal) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="w-full bg-gray-900 hover:bg-black rounded-t-xl transition-all"
                    />
                    <span className="text-[11px] font-extrabold text-gray-500 truncate w-full text-center">
                      {trendData?.labels[idx] || `P${idx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-xs font-semibold text-gray-400">
              No revenue trend data available for this timeframe.
            </div>
          )}
        </div>
      </div>

      {/* MONTH-OVER-MONTH SALES COMPARISON CARD */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-black" />
            Month-over-Month Sales Comparison
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Current Month Realized Revenue
            </span>
            <span className="text-2xl font-extrabold text-gray-900 mt-1 block">
              {formatCurrency(momData?.currentMonthRevenue)}
            </span>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Previous Month Realized Revenue
            </span>
            <span className="text-2xl font-extrabold text-gray-900 mt-1 block">
              {formatCurrency(momData?.previousMonthRevenue)}
            </span>
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-gray-700">Net Sales Growth Difference</span>
          <span
            className={`text-sm font-extrabold px-3 py-1 rounded-xl border ${
              (momData?.netGrowth || 0) >= 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {(momData?.netGrowth || 0) >= 0 ? '+' : ''}
            {formatCurrency(momData?.netGrowth)} (
            {(momData?.percentageGrowth || 0) >= 0 ? '+' : ''}
            {momData?.percentageGrowth || 0}%{' '}
            {(momData?.netGrowth || 0) >= 0 ? '📈' : '📉'})
          </span>
        </div>
      </div>

      {/* SERVICE POPULARITY & VEHICLE BREAKDOWN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SERVICE POPULARITY CARD */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Wrench className="w-5 h-5 text-black" />
              Service Popularity Breakdown
            </h3>
            <span className="text-xs font-semibold text-gray-400 uppercase">
              {servicesData.length} Services
            </span>
          </div>

          {servicesData.length > 0 ? (
            <div className="space-y-3">
              {servicesData.map((svc) => (
                <div key={svc.serviceId || svc.serviceName} className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="text-gray-900 truncate">{svc.serviceName}</span>
                    <span className="text-gray-900 font-extrabold">
                      {svc.jobCount} jobs ({formatCurrency(svc.revenue)})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(svc.percentage || 0, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500">
                    <span>Usage Share</span>
                    <span className="font-bold text-gray-900">{svc.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs font-semibold text-gray-400 bg-gray-50 rounded-2xl border border-gray-200/80">
              No completed service popularity records found for this timeframe.
            </div>
          )}
        </div>

        {/* VEHICLE CATEGORY BREAKDOWN CARD */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Car className="w-5 h-5 text-black" />
              Vehicle Category Distribution
            </h3>
            <span className="text-xs font-semibold text-gray-400 uppercase">
              {vehiclesData.length} Categories
            </span>
          </div>

          {vehiclesData.length > 0 ? (
            <div className="space-y-3">
              {vehiclesData.map((veh) => (
                <div key={veh.category} className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="text-gray-900">{veh.category}</span>
                    <span className="text-gray-900 font-extrabold">
                      {veh.jobCount} jobs ({formatCurrency(veh.revenue)})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(veh.percentage || 0, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500">
                    <span>Category Share</span>
                    <span className="font-bold text-gray-900">{veh.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs font-semibold text-gray-400 bg-gray-50 rounded-2xl border border-gray-200/80">
              No completed vehicle breakdown records found for this timeframe.
            </div>
          )}
        </div>
      </div>

      {/* STAFF PERFORMANCE & TARGET CHECKUP */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-black" />
            Staff Monthly Performance Checkup
          </h3>
          <span className="text-xs font-semibold text-gray-400 uppercase">
            {staffData.length} Staff Members
          </span>
        </div>

        {staffData.length > 0 ? (
          <div className="space-y-4">
            {staffData.map((staff) => {
              const evalText =
                staff.performancePercentage === 100 && staff.completedJobs > 0
                  ? 'Top Performer! 🎉'
                  : staff.performancePercentage >= 75
                  ? 'High Performing'
                  : staff.completedJobs > 0
                  ? 'Active Workload'
                  : 'No Completed Jobs';

              return (
                <div key={staff.staffId || staff.name} className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                    <div>
                      <span className="text-gray-900">{staff.name}</span>
                      <span className="text-xs text-gray-400 font-medium ml-2">({staff.role})</span>
                    </div>
                    <span className="text-gray-900">
                      {staff.completedJobs} Completed Jobs | Total: {formatCurrency(staff.totalRevenue)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(staff.performancePercentage || 0, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                    <span>Avg Job Value: <strong className="text-gray-900">{formatCurrency(staff.averageJobValue)}</strong></span>
                    <span className="text-gray-900 font-bold">{evalText} ({staff.performancePercentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs font-semibold text-gray-400 bg-gray-50 rounded-2xl border border-gray-200/80">
            No staff members found for performance checkup.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsAnalytics;
