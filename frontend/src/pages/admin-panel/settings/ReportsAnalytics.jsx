import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, Calendar, Award, CheckCircle2, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const ReportsAnalytics = () => {
  const [revenueTimeframe, setRevenueTimeframe] = useState('month');

  // Revenue Data for Week, Month, Year
  const REVENUE_DATA = {
    week: {
      total: '₹34,500',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [4000, 5200, 4800, 6100, 5500, 7200, 1700],
    },
    month: {
      total: '₹1,45,000',
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      values: [32000, 38000, 35000, 40000],
    },
    year: {
      total: '₹16,80,000',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: [380000, 420000, 430000, 450000],
    },
  };

  const currentData = REVENUE_DATA[revenueTimeframe];
  const maxVal = Math.max(...currentData.values);

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Reports & Analytics</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Track shop revenue trends, customer metrics, month-over-month growth, and staff monthly targets.
        </p>
      </div>

      {/* TOTAL CUSTOMERS STATUS CARDS (WEEK, MONTH, YEAR) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Weekly Customers
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">42</span>
          <span className="text-xs font-bold text-gray-600 block mt-1">+12% vs last week</span>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Monthly Customers
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">186</span>
          <span className="text-xs font-bold text-gray-600 block mt-1">+18% vs last month</span>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Yearly Customers
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">2,140</span>
          <span className="text-xs font-bold text-gray-600 block mt-1">+24% annual growth</span>
        </div>
      </div>

      {/* REVENUE GRAPH CARD (WEEK, MONTH, YEAR TOGGLE) */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-1 block">
              {currentData.total}
            </span>
          </div>

          {/* Timeframe Selector Segmented Pill */}
          <div className="bg-gray-100 p-1 rounded-2xl flex items-center border border-gray-200 self-start sm:self-auto">
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

        {/* Custom Bar Graph */}
        <div className="pt-4 pb-2">
          <div className="h-44 sm:h-52 flex items-end justify-between gap-3 px-2">
            {currentData.values.map((val, idx) => {
              const heightPercent = Math.round((val / maxVal) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="w-full bg-gray-900 hover:bg-black rounded-t-xl transition-all"
                  />
                  <span className="text-[11px] font-extrabold text-gray-500 truncate w-full text-center">
                    {currentData.labels[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MONTH-OVER-MONTH SALES COMPARISON CARD */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
          Month-over-Month Sales Comparison
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Running Month (Oct)</span>
            <span className="text-2xl font-extrabold text-gray-900 mt-1 block">₹1,45,000</span>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Previous Month (Sep)</span>
            <span className="text-2xl font-extrabold text-gray-900 mt-1 block">₹1,20,000</span>
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700">Net Sales Growth Difference</span>
          <span className="text-sm font-extrabold text-gray-900 bg-white px-3 py-1 rounded-xl border border-gray-300">
            +₹25,000 (+20.8% 📈)
          </span>
        </div>
      </div>

      {/* STAFF MONTHLY PERFORMANCE CHECKUP & TARGETS */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
          Staff Monthly Performance & Target Checkup
        </h3>

        <div className="space-y-4">
          {[
            { name: 'Rahul', role: 'Detailing Specialist', achieved: 48, target: 50, percent: 96, status: 'On Track' },
            { name: 'Ajmal', role: 'Car Wash Operator', achieved: 54, target: 50, percent: 100, status: 'Target Exceeded! 🎉' },
            { name: 'Vikram', role: 'Supervisor', achieved: 42, target: 45, percent: 93, status: 'Near Completion' },
          ].map((staff) => (
            <div key={staff.name} className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                <div>
                  <span className="text-gray-900">{staff.name}</span>
                  <span className="text-xs text-gray-400 font-medium ml-2">({staff.role})</span>
                </div>
                <span className="text-gray-900">{staff.achieved} / {staff.target} Jobs Target</span>
              </div>

              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-black h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(staff.percent, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                <span>Monthly Evaluation</span>
                <span className="text-gray-900 font-bold">{staff.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ReportsAnalytics;
