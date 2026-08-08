import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  SlidersHorizontal,
  Check,
  LayoutGrid,
  ClipboardList,
  Users,
  UserCheck,
  MoreHorizontal,
  X,
  ArrowRight,
  Car,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';

// Mock Jobs Data matching the design image
const INITIAL_JOBS = [
  {
    id: 'TS-04-ED-1234',
    serviceType: 'Express',
    status: 'In Progress',
    vehicleModel: 'Honda Civic',
    vehicleCategory: 'Car',
    customerName: 'John Doe',
    phone: '+1 (555) 019-2834',
    currentStepIndex: 2, // 0: Wait, 1: Wash, 2: Interior, 3: QC, 4: Ready
    statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
    typeColor: 'bg-blue-100 text-blue-700',
    primaryAction: 'View Details',
    secondaryAction: 'Update Status',
  },
  {
    id: 'TS-08-XX-8888',
    serviceType: 'Express',
    status: 'Ready',
    vehicleModel: 'Toyota Fortuner',
    vehicleCategory: 'SUV',
    customerName: 'Sarah W.',
    phone: '+1 (555) 987-6543',
    currentStepIndex: 4, // Ready
    statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    typeColor: 'bg-blue-100 text-blue-700',
    primaryAction: 'Checkout',
    secondaryAction: 'Notify Customer',
  },
  {
    id: 'MH-12-PQ-5566',
    serviceType: 'Normal',
    status: 'Pending',
    vehicleModel: 'Hyundai Creta',
    vehicleCategory: 'SUV',
    customerName: 'Amit P.',
    phone: '+1 (555) 456-7890',
    currentStepIndex: 0, // Wait
    statusColor: 'bg-gray-100 text-gray-700 border-gray-200',
    typeColor: 'bg-slate-100 text-slate-700',
    primaryAction: 'Start Job',
    secondaryAction: 'Assign Staff',
  },
];

const WORKFLOW_STEPS = ['Wait', 'Wash', 'Interior', 'QC', 'Ready'];

const Jobs = () => {
  const navigate = useNavigate();

  // Filter and Interactive States
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [activeCategoryTab, setActiveCategoryTab] = useState("Today's Jobs");
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileTab, setMobileTab] = useState('jobs');

  // Modals
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter Logic
  const filteredJobs = jobs.filter((job) => {
    // Search query filter
    const matchesSearch =
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.phone.toLowerCase().includes(searchQuery.toLowerCase());

    // Category tab filter
    if (activeCategoryTab === 'Pending') return matchesSearch && job.status === 'Pending';
    if (activeCategoryTab === 'In Progress') return matchesSearch && job.status === 'In Progress';
    if (activeCategoryTab === 'Ready') return matchesSearch && job.status === 'Ready';
    if (activeCategoryTab === 'Completed') return matchesSearch && job.status === 'Completed';

    return matchesSearch;
  });

  const handleMobileNav = (tabId) => {
    setMobileTab(tabId);
    if (tabId === 'dashboard') navigate('/dashboard');
  };

  const handleActionClick = (job, actionType) => {
    setSelectedJobForModal(job);
    if (actionType === 'Update Status' || actionType === 'Start Job') {
      setIsUpdateStatusOpen(true);
    } else {
      setIsDetailsOpen(true);
    }
  };

  const updateJobStep = (jobId, newStepIndex) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const newStatus =
            newStepIndex === 4
              ? 'Ready'
              : newStepIndex === 0
              ? 'Pending'
              : 'In Progress';

          return {
            ...job,
            currentStepIndex: newStepIndex,
            status: newStatus,
            statusColor:
              newStatus === 'Ready'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : newStatus === 'Pending'
                ? 'bg-gray-100 text-gray-700 border-gray-200'
                : 'bg-amber-100 text-amber-800 border-amber-200',
          };
        }
        return job;
      })
    );
    setIsUpdateStatusOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-blue-100 selection:text-blue-700">
      
      {/* Reusable Admin Sidebar */}
      <AdminSidebar activeItem="jobs" />

      {/* ========================================================== */}
      {/* MAIN CONTENT AREA                                          */}
      {/* ========================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 sm:pb-36 lg:pb-12">
        
        {/* HEADER */}
        <header className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Jobs</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Manage today's vehicle jobs</p>
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
        <div className="flex items-center gap-3 mb-6">
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
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs shrink-0"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* METRICS GRID (4 STAT CARDS) */}
        <section className="mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {[
              { label: 'Pending', count: 12 },
              { label: 'In Progress', count: 5 },
              { label: 'Ready', count: 3 },
              { label: 'Completed', count: 24 },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <span className="text-xs font-bold text-gray-500 block mb-1">{stat.label}</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {stat.count}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CATEGORY FILTER PILLS (HORIZONTAL SCROLL) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          {['All Jobs', "Today's Jobs", 'Pending', 'In Progress', 'Ready', 'Completed'].map((category) => {
            const isActive = activeCategoryTab === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategoryTab(category)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-gray-200/70 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* JOB CARDS LIST */}
        <div className="space-y-5">
          {filteredJobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all"
            >
              {/* Card Header & Tags */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                    {job.id}
                  </h3>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${job.typeColor}`}>
                    {job.serviceType}
                  </span>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${job.statusColor}`}>
                  {job.status}
                </span>
              </div>

              {/* Subtitle info */}
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-6">
                {job.vehicleModel} • {job.vehicleCategory} • {job.customerName}
              </p>

              {/* Workflow Timeline Stepper */}
              <div className="my-6 px-1">
                <div className="relative flex items-center justify-between">
                  {/* Connecting Line behind nodes */}
                  <div className="absolute left-3 right-3 top-4 h-[2px] bg-gray-200 -z-0" />

                  {WORKFLOW_STEPS.map((stepName, index) => {
                    const isCompleted = index < job.currentStepIndex;
                    const isCurrent = index === job.currentStepIndex;

                    return (
                      <div
                        key={stepName}
                        onClick={() => updateJobStep(job.id, index)}
                        className="flex flex-col items-center gap-2 relative z-10 cursor-pointer group"
                      >
                        {/* Node Circle */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-black text-white'
                              : isCurrent
                              ? 'bg-white border-4 border-black text-black shadow-xs'
                              : 'bg-gray-200 text-transparent'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : isCurrent ? (
                            <div className="w-2 h-2 rounded-full bg-black" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                          )}
                        </div>

                        {/* Step Label */}
                        <span
                          className={`text-[11px] sm:text-xs font-bold transition-colors ${
                            isCurrent
                              ? 'text-gray-900'
                              : isCompleted
                              ? 'text-gray-700'
                              : 'text-gray-400'
                          }`}
                        >
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Details summary */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 mb-5 text-xs text-gray-600 font-medium flex flex-wrap items-center justify-between gap-2">
                <span>{job.vehicleModel} • {job.vehicleCategory} • {job.customerName}</span>
                <span className="text-gray-400">|</span>
                <span>{job.vehicleModel} • {job.vehicleCategory} • {job.customerName}</span>
              </div>

              {/* Dual Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleActionClick(job, job.secondaryAction)}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm transition-all shadow-2xs active:scale-98"
                >
                  {job.secondaryAction}
                </button>

                <button
                  onClick={() => handleActionClick(job, job.primaryAction)}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-98"
                >
                  {job.primaryAction}
                </button>
              </div>
            </motion.div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-200/80 p-6">
              <Car className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No jobs found</h3>
              <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or tab filters.</p>
            </div>
          )}
        </div>
      </main>



      {/* ========================================================== */}
      {/* MODAL: JOB DETAILS                                         */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isDetailsOpen && selectedJobForModal && (
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
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedJobForModal.id}</h3>
                  <p className="text-xs text-gray-500 font-medium">Customer Details</p>
                </div>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3 my-4 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold text-gray-900">{selectedJobForModal.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-bold text-gray-900">{selectedJobForModal.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle:</span>
                  <span className="font-bold text-gray-900">{selectedJobForModal.vehicleModel} ({selectedJobForModal.vehicleCategory})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service Type:</span>
                  <span className="font-bold text-gray-900">{selectedJobForModal.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Phase:</span>
                  <span className="font-bold text-gray-900">{WORKFLOW_STEPS[selectedJobForModal.currentStepIndex]}</span>
                </div>
              </div>

              <button
                onClick={() => setIsDetailsOpen(false)}
                className="w-full bg-black text-white font-bold py-3 rounded-2xl text-sm"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* MODAL: UPDATE STATUS                                       */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isUpdateStatusOpen && selectedJobForModal && (
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
                  <p className="text-xs text-gray-500 font-medium">Plate: {selectedJobForModal.id}</p>
                </div>
                <button
                  onClick={() => setIsUpdateStatusOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 my-4">
                {WORKFLOW_STEPS.map((stepName, stepIndex) => (
                  <button
                    key={stepName}
                    onClick={() => updateJobStep(selectedJobForModal.id, stepIndex)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
                      stepIndex === selectedJobForModal.currentStepIndex
                        ? 'bg-black text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <span>{stepName}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Jobs;
