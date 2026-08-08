import React, { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const STAFF_MEMBERS = [
  {
    id: 1,
    name: 'Rahul',
    role: 'Detailing Specialist',
    status: 'BUSY',
    statusBadge: 'bg-blue-100 text-blue-700 border-blue-200',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    currentTask: null,
    vehiclePlate: null,
    completedToday: 4,
    efficiency: '96%',
    progressPercent: 96,
    workingSince: '8:00 AM',
    phone: '+1 (555) 234-5678',
  },
  {
    id: 2,
    name: 'Ajmal',
    role: 'Car Wash Operator',
    status: 'AVAILABLE',
    statusBadge: 'bg-gray-100 text-gray-700 border-gray-200',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    currentTask: 'None',
    vehiclePlate: null,
    completedToday: 6,
    efficiency: '92%',
    progressPercent: 92,
    workingSince: '8:30 AM',
    phone: '+1 (555) 345-6789',
  },
  {
    id: 3,
    name: 'Vikram',
    role: 'Supervisor',
    status: 'BUSY',
    statusBadge: 'bg-blue-100 text-blue-700 border-blue-200',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    currentTask: 'Quality Check',
    vehiclePlate: 'KA 01 GH 3456',
    completedToday: 2,
    efficiency: '98%',
    progressPercent: 98,
    workingSince: '9:00 AM',
    phone: '+1 (555) 456-7890',
  },
];

const Staff = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffList, setStaffList] = useState(STAFF_MEMBERS);

  const filteredStaff = staffList.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStaff = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const role = formData.get('role');
    const phone = formData.get('phone');

    if (name) {
      setStaffList((prev) => [
        ...prev,
        {
          id: Date.now(),
          name,
          role: role || 'Technician',
          status: 'AVAILABLE',
          statusBadge: 'bg-gray-100 text-gray-700 border-gray-200',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          currentTask: 'None',
          vehiclePlate: null,
          completedToday: 0,
          efficiency: '100%',
          progressPercent: 100,
          workingSince: '9:30 AM',
          phone: phone || '+1 (555) 000-0000',
        },
      ]);
    }
    setIsAddStaffOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-blue-100 selection:text-blue-700">
      
      {/* Reusable Admin Sidebar (Handles Desktop Sidebar & Mobile Bottom Nav) */}
      <AdminSidebar activeItem="staff" />

      {/* ========================================================== */}
      {/* MAIN CONTENT AREA                                          */}
      {/* ========================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 sm:pb-36 lg:pb-12">
        
        {/* HEADER */}
        <header className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Staff Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Oversee the vehicle tasks scheduled for today.
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
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Vehicle, Customer, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all placeholder:text-gray-400 text-gray-900 shadow-2xs"
            />
          </div>

          <button
            aria-label="Filter"
            className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs shrink-0"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* ADD STAFF ACTION BUTTON */}
        <div className="mb-6">
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        {/* 5 OVERVIEW STAT CARDS GRID */}
        <section className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {[
              { label: 'TOTAL STAFF', count: '14', icon: Users },
              { label: 'PRESENT TODAY', count: '12', icon: UserCheck },
              { label: 'ACTIVE JOBS', count: '8', icon: Briefcase, badge: '📈' },
              { label: 'AVAILABLE STAFF', count: '4', icon: Clock },
              { label: 'AVG EFFICIENCY', count: '94%', icon: Gauge, badge: '📈' },
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

        {/* 2-COLUMN RESPONSIVE LAYOUT (ENGAGED MEMBERS & PERFORMANCE OVERVIEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT/MAIN COLUMN: ENGAGED TEAM MEMBERS (8 COLS) */}
          <div className="lg:col-span-8 space-y-5">
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight mb-2">
              Engaged Team Members
            </h2>

            {filteredStaff.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all"
              >
                {/* Header Row: Avatar, Name, Role & Status Pill */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shadow-2xs"
                    />
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                        {member.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${member.statusBadge}`}>
                    {member.status}
                  </span>
                </div>

                {/* Subtask info if present */}
                {member.currentTask && (
                  <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-3.5 mb-4 text-xs font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>Current Task:</span>
                      <span className="font-bold text-gray-900">{member.currentTask}</span>
                    </div>
                    {member.vehiclePlate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>Vehicle:</span>
                        <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                          {member.vehiclePlate}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Stats Row & Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                    <div>
                      <span className="text-lg sm:text-xl font-extrabold text-gray-900 mr-1.5">
                        {member.completedToday}
                      </span>
                      <span className="text-gray-500 text-xs font-medium">Completed Today</span>
                    </div>
                    <div>
                      <span className="text-lg sm:text-xl font-extrabold text-gray-900 mr-1.5">
                        {member.efficiency}
                      </span>
                      <span className="text-gray-500 text-xs font-medium">Efficiency</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 h-2 sm:h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-full rounded-full transition-all duration-500"
                      style={{ width: `${member.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Working Info */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Working since {member.workingSince}</span>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-3">
                  <button className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-bold py-2.5 px-4 rounded-2xl text-xs sm:text-sm transition-all shadow-2xs active:scale-98">
                    View Profile
                  </button>

                  <button className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-98">
                    Assign Job
                  </button>

                  <a
                    href={`tel:${member.phone}`}
                    aria-label={`Call ${member.name}`}
                    className="p-3 bg-white hover:bg-gray-50 border border-gray-200/90 text-gray-700 rounded-2xl transition-colors shadow-2xs active:scale-95 shrink-0"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
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
              {/* Item 1: Top Performer */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                    <Trophy className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      TOP PERFORMER
                    </span>
                    <h4 className="text-sm font-extrabold text-gray-900">Vikram</h4>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-gray-900">98% Eff</span>
              </div>

              {/* Item 2: Most Jobs Completed */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      MOST JOBS COMPLETED
                    </span>
                    <h4 className="text-sm font-extrabold text-gray-900">Ajmal</h4>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-gray-900">6 Jobs</span>
              </div>

              {/* Item 3: Fastest Avg Time */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                    <Clock className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      FASTEST AVG TIME
                    </span>
                    <h4 className="text-sm font-extrabold text-gray-900">Rahul</h4>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-gray-900">42m avg</span>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* ========================================================== */}
      {/* MODAL: ADD STAFF FORM                                      */}
      {/* ========================================================== */}
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
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900">Add New Staff Member</h3>
                <button
                  onClick={() => setIsAddStaffOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Staff Name
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
                    Role / Title
                  </label>
                  <input
                    name="role"
                    type="text"
                    required
                    placeholder="e.g. Wash Operator"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="e.g. +1 (555) 888-9999"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
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
                    className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
                  >
                    Save Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Staff;
