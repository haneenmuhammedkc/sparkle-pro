import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  SlidersHorizontal,
  Plus,
  Phone,
  UserPlus,
  Users,
  UserCheck,
  Briefcase,
  Clock,
  Gauge,
  Trophy,
  CheckCircle2,
  X,
  TrendingUp,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Mail,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import Sidebar from '../../../../components/layout/Sidebar';
import * as staffService from '../services/staffService';

const STATUS_BADGES = {
  AVAILABLE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  BUSY: 'bg-blue-100 text-blue-800 border-blue-200',
  OFFLINE: 'bg-gray-100 text-gray-700 border-gray-200',
};

const Staff = () => {
  const navigate = useNavigate();

  // Primary Data State
  const [staffList, setStaffList] = useState([]);
  const [stats, setStats] = useState({
    totalStaff: 0,
    presentToday: 0,
    activeJobs: 0,
    availableStaff: 0,
    avgEfficiency: '94%',
  });

  // UI Control State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Modals State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedStaff, setDetailedStaff] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  // Fetch Staff List and Overview Statistics
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: searchQuery,
        page: currentPage,
        limit: 10,
      };
      if (selectedStatusFilter !== 'ALL') {
        params.status = selectedStatusFilter;
      }

      const [staffRes, statsRes] = await Promise.all([
        staffService.getStaff(params),
        staffService.getStaffStats(),
      ]);

      if (staffRes.success && staffRes.data) {
        setStaffList(staffRes.data.staff || []);
        setTotalPages(staffRes.data.totalPages || 1);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load staff records from backend.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatusFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search handler
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Add Staff Handler
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      role: formData.get('role'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      status: formData.get('status') || 'AVAILABLE',
      workingSince: formData.get('workingSince') || '8:00 AM',
    };

    try {
      const res = await staffService.createStaff(payload);
      if (res.success) {
        setIsAddStaffOpen(false);
        loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create staff member.');
    } finally {
      setSaving(false);
    }
  };

  // Edit Staff Handler
  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;

    setSaving(true);
    setFormError(null);

    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      role: formData.get('role'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      status: formData.get('status'),
      workingSince: formData.get('workingSince'),
    };

    try {
      const res = await staffService.updateStaff(editingStaff._id, payload);
      if (res.success) {
        setIsEditStaffOpen(false);
        setEditingStaff(null);
        loadData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update staff member.');
    } finally {
      setSaving(false);
    }
  };

  // Quick Status Change Handler
  const handleStatusToggle = async (staffId, newStatus) => {
    try {
      const res = await staffService.updateStaff(staffId, { status: newStatus });
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update staff status.');
    }
  };

  // Delete Staff Handler
  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;
    setSaving(true);
    try {
      const res = await staffService.deleteStaff(staffToDelete._id);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setStaffToDelete(null);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete staff member.');
    } finally {
      setSaving(false);
    }
  };

  // Open Details Modal with Full Workload History
  const handleOpenDetails = async (staffId) => {
    setIsDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const res = await staffService.getStaffById(staffId);
      if (res.success && res.data) {
        setDetailedStaff(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to load staff details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-blue-100 selection:text-blue-700">
      {/* Reusable Admin Sidebar */}
      <Sidebar activeItem="staff" />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 sm:pb-36 lg:pb-12">
        {/* HEADER */}
        <header className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Staff Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Oversee shop technicians, workflow status, and live task assignments.
            </p>
          </div>

          <button
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            className="p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full" />
          </button>
        </header>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Staff by Name, Role, Phone, Email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all placeholder:text-gray-400 text-gray-900 shadow-2xs"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-1.5 rounded-2xl shadow-2xs overflow-x-auto">
            {['ALL', 'AVAILABLE', 'BUSY', 'OFFLINE'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                  selectedStatusFilter === status
                    ? 'bg-black text-white shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Add Staff Button */}
          <button
            onClick={() => {
              setFormError(null);
              setIsAddStaffOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        {/* 5 OVERVIEW STAT CARDS GRID */}
        <section className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {[
              { label: 'TOTAL STAFF', count: stats.totalStaff, icon: Users },
              { label: 'PRESENT TODAY', count: stats.presentToday, icon: UserCheck },
              { label: 'ACTIVE JOBS', count: stats.activeJobs, icon: Briefcase, badge: '📈' },
              { label: 'AVAILABLE STAFF', count: stats.availableStaff, icon: Clock },
              { label: 'AVG EFFICIENCY', count: stats.avgEfficiency || '94%', icon: Gauge, badge: '📈' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider text-gray-400 uppercase">
                      {stat.label}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100 shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                      {stat.count}
                    </span>
                    {stat.badge && (
                      <span className="text-xs text-emerald-600 font-bold">{stat.badge}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ERROR STATE BANNER */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-4 text-red-800 text-sm font-semibold">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-2xs shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* 2-COLUMN RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* MAIN COLUMN: STAFF MEMBERS LIST (8 COLS) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                Staff Members ({staffList.length})
              </h2>
            </div>

            {/* LOADING STATE */}
            {loading && (
              <div className="bg-white border border-gray-200/90 rounded-3xl p-12 text-center shadow-2xs space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-black mx-auto" />
                <p className="text-sm font-bold text-gray-600">Loading staff records from database...</p>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && staffList.length === 0 && (
              <div className="bg-white border border-gray-200/90 rounded-3xl p-12 text-center shadow-2xs space-y-3">
                <Users className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-extrabold text-gray-900">No staff members found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto font-medium">
                  {searchQuery || selectedStatusFilter !== 'ALL'
                    ? 'No staff matched your current search query or status filter.'
                    : 'Click "Add Staff" to create your first workshop team member.'}
                </p>
                {searchQuery || selectedStatusFilter !== 'ALL' ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedStatusFilter('ALL');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-black underline pt-2"
                  >
                    Clear Filters
                  </button>
                ) : null}
              </div>
            )}

            {/* LIVE STAFF CARDS LIST */}
            {!loading &&
              !error &&
              staffList.map((member) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all"
                >
                  {/* Header Row: Avatar, Name, Role & Interactive Status Selector */}
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-100 shadow-2xs flex items-center justify-center overflow-hidden font-extrabold text-gray-800 text-sm shrink-0">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                          {member.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Status Selector */}
                    <div className="relative group">
                      <select
                        value={member.status}
                        onChange={(e) => handleStatusToggle(member._id, e.target.value)}
                        className={`text-xs font-extrabold px-3 py-1.5 rounded-full border cursor-pointer appearance-none pr-7 focus:outline-none transition-all ${
                          STATUS_BADGES[member.status] || STATUS_BADGES.AVAILABLE
                        }`}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="BUSY">BUSY</option>
                        <option value="OFFLINE">OFFLINE</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </div>

                  {/* Active Task Info Banner */}
                  {member.currentTask && member.currentTask !== 'None' && (
                    <div className="bg-gray-50/90 border border-gray-200/80 rounded-2xl p-3.5 mb-4 text-xs font-semibold flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>Active Task:</span>
                        <span className="font-extrabold text-gray-900">{member.currentTask}</span>
                      </div>
                      {member.vehiclePlate && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>Vehicle:</span>
                          <span className="font-extrabold text-gray-900 bg-white px-2.5 py-0.5 rounded-md border border-gray-200">
                            {member.vehiclePlate}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats Row & Working Hours */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs">
                    <div className="bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Active Workload</span>
                      <span className="text-base font-extrabold text-gray-900">{member.activeJobsCount || 0} Jobs</span>
                    </div>
                    <div className="bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Completed Today</span>
                      <span className="text-base font-extrabold text-gray-900">{member.completedToday || 0} Jobs</span>
                    </div>
                    <div className="bg-gray-50/60 p-2.5 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Shift Hours</span>
                      <span className="text-base font-extrabold text-gray-900">Since {member.workingSince || '8:00 AM'}</span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => handleOpenDetails(member._id)}
                      className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-bold py-2.5 px-3 rounded-2xl text-xs sm:text-sm transition-all shadow-2xs active:scale-98"
                    >
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setEditingStaff(member);
                        setFormError(null);
                        setIsEditStaffOpen(true);
                      }}
                      className="p-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl transition-colors shadow-2xs active:scale-95 shrink-0"
                      aria-label="Edit Staff Profile"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setStaffToDelete(member);
                        setIsDeleteConfirmOpen(true);
                      }}
                      className="p-2.5 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-2xl transition-colors shadow-2xs active:scale-95 shrink-0"
                      aria-label="Delete Staff Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        aria-label={`Call ${member.name}`}
                        className="p-2.5 bg-black hover:bg-gray-800 text-white rounded-2xl transition-colors shadow-2xs active:scale-95 shrink-0"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PERFORMANCE OVERVIEW (4 COLS) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
              Performance Overview
            </h2>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between p-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                    <Trophy className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      TOTAL ACTIVE STAFF
                    </span>
                    <h4 className="text-sm font-extrabold text-gray-900">{stats.totalStaff} Members</h4>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-gray-900">{stats.availableStaff} Available</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      ACTIVE WORKSHOP JOBS
                    </span>
                    <h4 className="text-sm font-extrabold text-gray-900">{stats.activeJobs} Vehicles</h4>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-600">In Service</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                    <Gauge className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      WORKSHOP EFFICIENCY
                    </span>
                    <h4 className="text-sm font-extrabold text-gray-900">{stats.avgEfficiency}</h4>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-600">Optimal</span>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* MODAL: ADD STAFF FORM */}
      <AnimatePresence>
        {isAddStaffOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddStaffOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add New Staff Member</h3>
                <button
                  onClick={() => setIsAddStaffOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Staff Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Role / Specialization *
                  </label>
                  <input
                    name="role"
                    type="text"
                    required
                    placeholder="e.g. Detailing Specialist, Wash Operator"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="e.g. +1 (555) 888-9999"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="e.g. alex@sparklepro.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue="AVAILABLE"
                      className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="BUSY">BUSY</option>
                      <option value="OFFLINE">OFFLINE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Working Since
                    </label>
                    <input
                      name="workingSince"
                      type="text"
                      defaultValue="8:00 AM"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT STAFF FORM */}
      <AnimatePresence>
        {isEditStaffOpen && editingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditStaffOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Edit Staff Profile</h3>
                <button
                  onClick={() => setIsEditStaffOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleEditStaffSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Staff Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingStaff.name}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Role / Title *
                  </label>
                  <input
                    name="role"
                    type="text"
                    required
                    defaultValue={editingStaff.role}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    defaultValue={editingStaff.phone}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingStaff.email}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={editingStaff.status}
                      className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="BUSY">BUSY</option>
                      <option value="OFFLINE">OFFLINE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Working Since
                    </label>
                    <input
                      name="workingSince"
                      type="text"
                      defaultValue={editingStaff.workingSince || '8:00 AM'}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditStaffOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Update Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: STAFF DETAILS & WORKLOAD HISTORY */}
      <AnimatePresence>
        {isDetailsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg border border-gray-100 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Staff Profile & History</h3>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detailsLoading ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-black mx-auto" />
                  <p className="text-xs font-semibold text-gray-500">Loading staff workload history...</p>
                </div>
              ) : detailedStaff ? (
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Header info */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-black text-white font-black text-base flex items-center justify-center overflow-hidden shrink-0">
                      {detailedStaff.avatar ? (
                        <img src={detailedStaff.avatar} alt={detailedStaff.name} className="w-full h-full object-cover" />
                      ) : (
                        detailedStaff.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-extrabold text-gray-900">{detailedStaff.name}</h4>
                      <p className="text-xs text-gray-500 font-semibold">{detailedStaff.role}</p>
                      <span className={`inline-block mt-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${STATUS_BADGES[detailedStaff.status]}`}>
                        {detailedStaff.status}
                      </span>
                    </div>
                  </div>

                  {/* Summary metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-400 text-[10px] font-bold uppercase">Active Jobs</span>
                      <span className="block text-lg font-extrabold text-gray-900">{detailedStaff.activeJobsCount || 0}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-400 text-[10px] font-bold uppercase">Completed Jobs</span>
                      <span className="block text-lg font-extrabold text-gray-900">{detailedStaff.completedJobsCount || 0}</span>
                    </div>
                  </div>

                  {/* Assigned Jobs History */}
                  <div>
                    <h5 className="font-extrabold text-gray-900 mb-2">Assigned Jobs History</h5>
                    {detailedStaff.assignedJobs && detailedStaff.assignedJobs.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {detailedStaff.assignedJobs.map((j) => (
                          <div key={j._id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-gray-900 block">{j.vehiclePlate} ({j.vehicleModel})</span>
                              <span className="text-gray-400 text-[10px]">{j.workflowStep} • {j.status}</span>
                            </div>
                            <span className="font-extrabold text-gray-900">₹{j.grandTotal}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl border border-gray-100">
                        No assigned jobs recorded yet.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setIsDetailsOpen(false)}
                    className="w-full mt-2 bg-black text-white font-bold py-3 rounded-2xl text-xs"
                  >
                    Close Profile
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DELETE CONFIRMATION */}
      <AnimatePresence>
        {isDeleteConfirmOpen && staffToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm border border-gray-100 shadow-2xl relative z-10 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Staff Profile?</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Are you sure you want to remove <strong>{staffToDelete.name}</strong>? This action will erase their profile from your workshop backend.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={saving}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Staff;
