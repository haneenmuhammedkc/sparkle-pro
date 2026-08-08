import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Briefcase,
  Car,
  Users,
  Settings,
  Bell,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  ClipboardList,
  Hourglass,
  Droplet,
  Sparkles,
  ShieldCheck,
  Key,
  ChevronRight,
  UserCheck,
  MoreHorizontal,
  X,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';

// Mock Data
const INITIAL_STATS = [
  { id: 'vehicles', label: 'VEHICLES ACTIVE', mobileLabel: 'VEHICLES', count: 24, icon: Car, color: 'text-gray-700' },
  { id: 'completed', label: 'COMPLETED TODAY', mobileLabel: 'COMPLETED', count: 16, icon: CheckCircle2, color: 'text-gray-700' },
  { id: 'pending', label: 'PENDING STARTS', mobileLabel: 'PENDING', count: 8, icon: Clock, color: 'text-gray-700' },
  { id: 'customers', label: 'CUSTOMERS SERVED', mobileLabel: 'CUSTOMERS', count: 12, icon: Users, color: 'text-gray-700' },
];

const INITIAL_WORKFLOW = [
  { id: 'waiting', name: 'Waiting', count: 3, icon: Hourglass },
  { id: 'washing', name: 'In Washing', count: 6, icon: Droplet, active: true },
  { id: 'interior', name: 'Interior Spa', mobileName: 'Interior', count: 4, icon: Sparkles },
  { id: 'qc', name: 'Quality Check', count: 2, icon: ShieldCheck },
  { id: 'ready', name: 'Ready to Go', count: 5, icon: Key },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    title: 'Vehicle Delivery Picked Up',
    mobileTitle: 'Vehicle Delivery',
    desc: 'Car TS-08-XX-9999 keys handed back to customer',
    mobileDesc: 'TS-08-XX-9999 picked up.',
    time: '10:45 AM',
    color: 'bg-gray-900',
  },
  {
    id: 2,
    title: 'Workflow Phase Change',
    mobileTitle: 'Status Update',
    desc: 'Car TS-02-AB-5678 moved from Wash to Interior Spa',
    mobileDesc: 'TS-02-AB-5678 moved to Interior.',
    time: '10:30 AM',
    color: 'bg-slate-600',
  },
  {
    id: 3,
    title: 'New Check-In Completed',
    mobileTitle: 'New Check-in',
    desc: 'Jane Smith arrived for a Quick Wash Express',
    mobileDesc: 'Jane Smith • Quick Wash',
    time: '10:15 AM',
    color: 'bg-gray-400',
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Navigation & Interactive States
  const [mobileTab, setMobileTab] = useState('dashboard');
  const [selectedWorkflow, setSelectedWorkflow] = useState('washing');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Priority Active Job state
  const [priorityJob, setPriorityJob] = useState({
    id: 'TS-04-ED-1234',
    status: 'In Progress (Washing)',
    customerName: 'John Doe',
    customerPhone: '+1 (555) 019-2834',
    servicePlan: 'Foam Wash & Wax Package',
    technician: 'Mike S.',
    eta: '20 minutes remaining',
    mobileEta: '20m',
    techAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  });

  // Workflow options for status update modal
  const workflowStages = ['Waiting', 'In Washing', 'Interior Spa', 'Quality Check', 'Ready to Go', 'Completed'];

  const handleStatusUpdate = (newStage) => {
    setPriorityJob((prev) => ({
      ...prev,
      status: `In Progress (${newStage})`,
    }));
    setIsUpdateStatusOpen(false);
  };

  const handleCreateJob = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const plate = formData.get('plate');
    const customer = formData.get('customer');
    const phone = formData.get('phone');
    const service = formData.get('service');
    
    if (plate) {
      setPriorityJob((prev) => ({
        ...prev,
        id: plate,
        customerName: customer || 'New Customer',
        customerPhone: phone || '+1 (555) 019-2834',
        servicePlan: service || 'Standard Wash',
      }));
    }
    setIsNewJobOpen(false);
  };

  const handleMobileNav = (tabId) => {
    setMobileTab(tabId);
    if (tabId === 'jobs') navigate('/jobs');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-blue-100 selection:text-blue-700">
      
      {/* Reusable Admin Sidebar */}
      <AdminSidebar activeItem="dashboard" />

      {/* ========================================================== */}
      {/* MAIN CONTENT CONTAINER                                     */}
      {/* ========================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 sm:pb-36 lg:pb-12">
        
        {/* TOP HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Good Morning <span className="animate-bounce inline-block">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Tuesday, 24 October</p>
          </div>

          {/* Desktop Search & Quick Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search jobs, plates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm w-56 md:w-64 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all placeholder:text-gray-400 text-gray-800 shadow-2xs"
              />
            </div>

            <button
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
              className="p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full" />
            </button>

            <button
              onClick={() => navigate('/new-job')}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-medium px-5 py-2.5 rounded-2xl text-sm transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              New Job
            </button>
          </div>

          {/* Mobile Top Header Notification Icon */}
          <div className="flex sm:hidden items-center justify-between absolute top-4 right-4">
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* MOBILE QUICK ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:hidden">
          <button
            onClick={() => navigate('/new-job')}
            className="flex items-center justify-center gap-2 bg-black text-white p-4 rounded-2xl font-bold text-sm shadow-sm active:scale-98 transition-transform"
          >
            <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            New Job
          </button>

          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-900 p-4 rounded-2xl font-bold text-sm shadow-2xs active:scale-98 transition-transform"
          >
            <Search className="w-4 h-4 text-gray-700" />
            Search
          </button>
        </div>

        {/* ========================================================== */}
        {/* OVERVIEW METRICS SECTION                                   */}
        {/* ========================================================== */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3.5 tracking-tight">Overview</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {INITIAL_STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider text-gray-400 uppercase">
                      <span className="hidden sm:inline">{stat.label}</span>
                      <span className="sm:hidden">{stat.mobileLabel}</span>
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                      {stat.count}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ========================================================== */}
        {/* LIVE WORKFLOW TRACK SECTION                                */}
        {/* ========================================================== */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              <span className="hidden sm:inline">Live Workflow Track</span>
              <span className="sm:hidden">Workflow Status</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {INITIAL_WORKFLOW.map((wf) => {
              const Icon = wf.icon;
              const isSelected = selectedWorkflow === wf.id;

              return (
                <button
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf.id)}
                  className={`flex-1 min-w-[110px] sm:min-w-[140px] p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-100/90 border-blue-300 shadow-xs'
                      : 'bg-white border-gray-200/90 hover:border-gray-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-200/60 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className={`text-xl sm:text-2xl font-extrabold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {wf.count}
                    </div>
                    <div className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                      <span className="hidden sm:inline">{wf.name}</span>
                      <span className="sm:hidden">{wf.mobileName || wf.name}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================== */}
        {/* PRIORITY JOB & RECENT ACTIVITY GRID                        */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* PRIORITY ACTIVE JOB CARD */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-7 bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs relative overflow-hidden"
          >
            {/* Header / Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                <span className="hidden sm:inline">PRIORITY ACTIVE JOB</span>
                <span className="sm:hidden">Priority Job</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {priorityJob.status}
                </span>
                <button
                  onClick={() => setIsUpdateStatusOpen(true)}
                  className="sm:hidden text-xs font-bold text-gray-500 hover:text-gray-900 underline"
                >
                  View All
                </button>
              </div>
            </div>

            {/* License Plate Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {priorityJob.id}
              </h3>
              <div className="sm:hidden w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 border border-gray-200">
                <Car className="w-4 h-4" />
              </div>
            </div>

            {/* Inner Details Container */}
            <div className="bg-gray-50/90 border border-gray-100 rounded-2xl p-4 sm:p-5 my-5 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500 font-medium">Customer Name:</span>
                <span className="font-bold text-gray-900">{priorityJob.customerName}</span>
              </div>
              {priorityJob.customerPhone && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-500 font-medium">Phone Number:</span>
                  <span className="font-bold text-gray-900">{priorityJob.customerPhone}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500 font-medium">Service Plan Chosen:</span>
                <span className="font-bold text-gray-900 text-right">{priorityJob.servicePlan}</span>
              </div>
            </div>

            {/* Assigned Tech & ETA */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="block text-[10px] sm:text-xs font-bold tracking-wider text-gray-400 uppercase mb-1.5">
                  ASSIGNED TECHNICIAN
                </span>
                <div className="flex items-center gap-2.5">
                  <img
                    src={priorityJob.techAvatar}
                    alt={priorityJob.technician}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200"
                  />
                  <span className="text-xs sm:text-sm font-bold text-gray-900">{priorityJob.technician}</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] sm:text-xs font-bold tracking-wider text-gray-400 uppercase mb-1.5">
                  WASHING TIME LIMIT / ETA
                </span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-900">
                  <Clock className="w-4 h-4 text-gray-600 shrink-0" />
                  <span className="hidden sm:inline">{priorityJob.eta}</span>
                  <span className="sm:hidden">{priorityJob.mobileEta}</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsUpdateStatusOpen(true)}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all duration-200 shadow-sm active:scale-98 flex items-center justify-center gap-2"
            >
              Update Workflow Status
            </button>
          </motion.section>

          {/* RECENT ACTIVITY LOG CARD */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-5 bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-5 tracking-tight">
              <span className="hidden sm:inline">Recent Activity Log</span>
              <span className="sm:hidden">Recent Activity</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-[9px] before:top-2.5 before:bottom-2.5 before:w-[2px] before:bg-gray-100">
              {RECENT_ACTIVITIES.map((act) => (
                <div key={act.id} className="relative group">
                  {/* Bullet Dot */}
                  <span
                    className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ${act.color} ring-4 ring-white`}
                  />

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      <span className="hidden sm:inline">{act.title}</span>
                      <span className="sm:hidden">{act.mobileTitle}</span>
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed font-medium">
                      <span className="hidden sm:inline">{act.desc}</span>
                      <span className="sm:hidden">{act.mobileDesc}</span>
                    </p>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-semibold mt-1 inline-block">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

        </div>
      </main>



      {/* ========================================================== */}
      {/* MODAL: NEW JOB FORM                                        */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isNewJobOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewJobOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900">Create New Job</h3>
                <button
                  onClick={() => setIsNewJobOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    License Plate Number
                  </label>
                  <input
                    name="plate"
                    type="text"
                    required
                    placeholder="e.g. TS-04-ED-1234"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Customer Name
                  </label>
                  <input
                    name="customer"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
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
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Service Package
                  </label>
                  <select
                    name="service"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="Foam Wash & Wax Package">Foam Wash & Wax Package</option>
                    <option value="Quick Wash Express">Quick Wash Express</option>
                    <option value="Full Interior Spa & Detailing">Full Interior Spa & Detailing</option>
                    <option value="Ceramic Coating Protect">Ceramic Coating Protect</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewJobOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
                  >
                    Save & Check-In
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* MODAL: UPDATE WORKFLOW STATUS                              */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isUpdateStatusOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUpdateStatusOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Update Job Phase</h3>
                  <p className="text-xs text-gray-500 font-medium">Vehicle: {priorityJob.id}</p>
                </div>
                <button
                  onClick={() => setIsUpdateStatusOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 my-4">
                {workflowStages.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => handleStatusUpdate(stage)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200/70 rounded-2xl text-sm font-semibold text-gray-800 transition-all text-left group"
                  >
                    <span>{stage}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* MODAL: MOBILE SEARCH                                       */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-4 w-full max-w-md border border-gray-100 shadow-2xl relative z-10"
            >
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search jobs, license plates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  onClick={() => setIsSearchModalOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
