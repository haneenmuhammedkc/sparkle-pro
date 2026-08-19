import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  SlidersHorizontal,
  Check,
  ClipboardList,
  X,
  ArrowRight,
  Car,
  AlertCircle,
  Loader2,
  CheckCircle2,
  MessageSquare,
  CreditCard,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import Sidebar from '../../../../components/layout/Sidebar';
import * as jobService from '../services/jobService';

const WORKFLOW_STEPS = ['Wait', 'Wash', 'Interior', 'QC', 'Ready'];

const Jobs = () => {
  const navigate = useNavigate();

  // State Management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState("Today's Jobs");
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Modals
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Payment Recording Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paidAmount: '',
    paymentMethod: 'CASH',
    transactionRef: '',
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Fetch Jobs from Backend
  const fetchJobs = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await jobService.getJobs({
        categoryTab: activeCategoryTab,
        search: searchQuery,
      });

      if (res.success && res.data) {
        const rawJobs = res.data.jobs || [];
        setJobs(rawJobs);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load jobs from backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeCategoryTab, searchQuery]);

  // Map Backend Job Document to UI View Model
  const mapBackendJobToUi = (job) => {
    const primaryService = job.services?.[0]?.name || 'Standard Wash';
    const statusColor =
      job.status === 'Ready'
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : job.status === 'Pending'
        ? 'bg-gray-100 text-gray-700 border-gray-200'
        : job.status === 'Completed'
        ? 'bg-blue-100 text-blue-800 border-blue-200'
        : 'bg-amber-100 text-amber-800 border-amber-200';

    const primaryAction = job.status === 'Ready' ? 'Checkout' : 'View Details';
    const secondaryAction = job.status === 'Pending' ? 'Start Job' : 'Update Status';

    const vehiclePlate = job.vehiclePlate || job.jobId || 'No Plate';
    const jobId = job.jobId || null;

    return {
      _id: job._id,
      id: vehiclePlate,
      vehiclePlate,
      jobId,
      serviceType: primaryService,
      status: job.status,
      vehicleModel: job.vehicleModel,
      vehicleCategory: job.vehicleCategory || 'Car',
      customerName: job.customerName,
      phone: job.customerPhone,
      currentStepIndex: job.currentStepIndex ?? 0,
      statusColor,
      typeColor: 'bg-blue-100 text-blue-700',
      primaryAction,
      secondaryAction,
      rawJob: job,
    };
  };

  const uiJobs = jobs.map(mapBackendJobToUi);

  // Filter Logic over fetched jobs
  const filteredJobs = uiJobs.filter((job) => {
    const matchesSearch =
      job.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.jobId && job.jobId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.phone.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeCategoryTab === 'Pending') return matchesSearch && job.status === 'Pending';
    if (activeCategoryTab === 'In Progress') return matchesSearch && job.status === 'In Progress';
    if (activeCategoryTab === 'Ready') return matchesSearch && job.status === 'Ready';
    if (activeCategoryTab === 'Completed') return matchesSearch && job.status === 'Completed';

    return matchesSearch;
  });

  // Calculate Metrics from real Jobs data
  const metrics = {
    pending: jobs.filter((j) => j.status === 'Pending').length,
    inProgress: jobs.filter((j) => j.status === 'In Progress').length,
    ready: jobs.filter((j) => j.status === 'Ready').length,
    completed: jobs.filter((j) => j.status === 'Completed').length,
  };

  const handleActionClick = (job, actionType) => {
    setSelectedJobForModal(job);
    if (actionType === 'Checkout') {
      setIsCheckoutOpen(true);
    } else if (actionType === 'Update Status' || actionType === 'Start Job') {
      setIsUpdateStatusOpen(true);
    } else {
      setIsDetailsOpen(true);
    }
  };

  // Perform Workflow Step Update via Backend API
  const updateJobStep = async (jobIdOrDbId, newStepIndex) => {
    setUpdatingStatusId(jobIdOrDbId);
    try {
      const targetStepName = WORKFLOW_STEPS[newStepIndex];
      const res = await jobService.updateJobStatus(jobIdOrDbId, {
        stepIndex: newStepIndex,
        workflowStep: targetStepName,
      });

      if (res.success) {
        await fetchJobs();
      }
    } catch (err) {
      alert(err.message || 'Failed to update job status on backend');
    } finally {
      setUpdatingStatusId(null);
      setIsUpdateStatusOpen(false);
    }
  };

  // Complete Job Checkout Confirmation
  const handleCompleteCheckout = async () => {
    if (!selectedJobForModal) return;
    const jobIdOrDbId = selectedJobForModal._id || selectedJobForModal.id;
    setUpdatingStatusId(jobIdOrDbId);
    try {
      const res = await jobService.updateJobStatus(jobIdOrDbId, {
        status: 'Completed',
      });

      if (res.success) {
        setIsCheckoutOpen(false);
        await fetchJobs();
      }
    } catch (err) {
      alert(err.message || 'Failed to complete vehicle checkout');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // WhatsApp Tracking Link Helper
  const getWhatsAppLink = (job) => {
    const rawPhone = job?.phone || job?.rawJob?.customerPhone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const trackingToken = job?.rawJob?.trackingToken || '';
    const trackingUrl = `${window.location.origin}/tracking/${trackingToken}`;
    const businessName = job?.rawJob?.business?.name || 'SparklePro Workshop';

    const message = `Hello ${job.customerName || 'Customer'},\n\nYour vehicle ${job.vehiclePlate} (${job.vehicleModel || 'Vehicle'}) has been checked in at ${businessName}.\n\nJob ID: ${job.jobId || job.vehiclePlate}\nTracking URL: ${trackingUrl}\n\nThank you!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Open Payment Modal
  const handleOpenPaymentModal = (job) => {
    setSelectedJobForModal(job);
    const currentPaid = job.rawJob?.paidAmount !== undefined ? job.rawJob.paidAmount : (job.rawJob?.grandTotal || 0);
    setPaymentForm({
      paidAmount: String(currentPaid),
      paymentMethod: job.rawJob?.paymentMethod || 'CASH',
      transactionRef: job.rawJob?.transactionRef || '',
    });
    setIsPaymentOpen(true);
  };

  // Save Recorded Payment
  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!selectedJobForModal) return;
    const jobIdOrDbId = selectedJobForModal._id || selectedJobForModal.id;
    setSubmittingPayment(true);

    try {
      const res = await jobService.recordJobPayment(jobIdOrDbId, {
        paidAmount: Number(paymentForm.paidAmount),
        paymentMethod: paymentForm.paymentMethod,
        transactionRef: paymentForm.transactionRef,
      });

      if (res.success) {
        setIsPaymentOpen(false);
        await fetchJobs();
      }
    } catch (err) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-blue-100 selection:text-blue-700">
      
      {/* Reusable Admin Sidebar */}
      <Sidebar activeItem="jobs" />

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
              placeholder="Search Vehicle Plate, Job ID, Customer..."
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

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-sm font-semibold">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={fetchJobs}
              className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* METRICS GRID (4 STAT CARDS FROM REAL DATA) */}
        <section className="mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {[
              { label: 'Pending', count: metrics.pending },
              { label: 'In Progress', count: metrics.inProgress },
              { label: 'Ready', count: metrics.ready },
              { label: 'Completed', count: metrics.completed },
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
                  {loading ? '...' : stat.count}
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
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 shadow-2xs'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* JOBS LIST / GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-2xs">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
            <p className="text-xs font-bold text-gray-500">Loading jobs from server...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, idx) => (
              <motion.div
                key={job._id || job.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                      {job.vehiclePlate}
                    </h3>
                    {job.jobId && job.jobId !== job.vehiclePlate && (
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200/80">
                        Job ID: {job.jobId}
                      </span>
                    )}
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${job.statusColor}`}>
                      {job.status}
                    </span>
                    {/* Payment Status Pill */}
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                        job.rawJob?.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : job.rawJob?.paymentStatus === 'PARTIAL'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {job.rawJob?.paymentStatus || 'UNPAID'} (₹{job.rawJob?.paidAmount !== undefined ? job.rawJob.paidAmount : 0}/{job.rawJob?.grandTotal || 0})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={getWhatsAppLink(job)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                      title="Send WhatsApp Tracking Link"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${job.typeColor}`}>
                      {job.serviceType}
                    </span>
                  </div>
                </div>

                {/* 5-Step Stepper Progress Bar */}
                <div className="bg-gray-50/90 border border-gray-100 rounded-2xl p-4 mb-4">
                  <div className="grid grid-cols-5 gap-2 relative">
                    {/* Connecting line */}
                    <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-gray-200 -z-0" />

                    {WORKFLOW_STEPS.map((stepName, stepIdx) => {
                      const isCompleted = stepIdx < job.currentStepIndex || job.status === 'Completed';
                      const isCurrent = stepIdx === job.currentStepIndex && job.status !== 'Completed';

                      return (
                        <div key={stepName} className="flex flex-col items-center text-center relative z-10">
                          {/* Circle Icon */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 transition-all ${
                              isCurrent
                                ? 'bg-black text-white ring-4 ring-black/10'
                                : isCompleted
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : isCurrent ? (
                              <div className="w-2 h-2 rounded-full bg-white" />
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
                  <span>{job.phone}</span>
                </div>

                {/* Triple Action Buttons */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleOpenPaymentModal(job)}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold py-2.5 px-3 rounded-2xl text-xs transition-all shadow-2xs active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Payment</span>
                  </button>

                  <button
                    onClick={() => handleActionClick(job, job.secondaryAction)}
                    disabled={updatingStatusId === (job._id || job.id)}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-bold py-2.5 px-3 rounded-2xl text-xs transition-all shadow-2xs active:scale-98 disabled:opacity-50"
                  >
                    {updatingStatusId === (job._id || job.id) ? 'Updating...' : job.secondaryAction}
                  </button>

                  {(() => {
                    const isCheckoutAction = job.primaryAction === 'Complete Job';
                    const isPaymentPending = isCheckoutAction && (job.rawJob?.paymentStatus !== 'PAID' && job.paymentStatus !== 'PAID');
                    const pendingAmount = job.rawJob?.balanceAmount || 0;

                    return (
                      <button
                        onClick={() => handleActionClick(job, job.primaryAction)}
                        disabled={updatingStatusId === (job._id || job.id) || isPaymentPending}
                        title={isPaymentPending ? `Complete payment (₹${pendingAmount} pending) before checkout.` : ''}
                        className={`w-full font-bold py-2.5 px-3 rounded-2xl text-xs transition-all shadow-sm active:scale-98 disabled:opacity-50 ${
                          isPaymentPending
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-800 text-white'
                        }`}
                      >
                        {isPaymentPending ? `Pay Pending (₹${pendingAmount})` : job.primaryAction}
                      </button>
                    );
                  })()}
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
        )}
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
                  <h3 className="text-xl font-bold text-gray-900">{selectedJobForModal.vehiclePlate}</h3>
                  {selectedJobForModal.jobId && (
                    <p className="text-xs text-gray-500 font-medium">Job ID: {selectedJobForModal.jobId}</p>
                  )}
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
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned Specialist:</span>
                  <span className="font-bold text-gray-900">
                    {selectedJobForModal.rawJob?.assignedStaff?.name || selectedJobForModal.technician || 'Unassigned Specialist'}
                  </span>
                </div>
                {selectedJobForModal.rawJob?.grandTotal && (
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-500 font-bold">Total Locked Price:</span>
                    <span className="font-extrabold text-gray-900">₹{selectedJobForModal.rawJob.grandTotal}</span>
                  </div>
                )}
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
      {/* MODAL: CHECKOUT / COMPLETE JOB CONFIRMATION               */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isCheckoutOpen && selectedJobForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (updatingStatusId !== (selectedJobForModal._id || selectedJobForModal.id)) {
                  setIsCheckoutOpen(false);
                }
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Complete Vehicle Checkout</h3>
                    <p className="text-xs text-gray-500 font-medium">Plate: {selectedJobForModal.vehiclePlate}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  disabled={updatingStatusId === (selectedJobForModal._id || selectedJobForModal.id)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-2.5 my-4 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Customer:</span>
                  <span className="font-bold text-gray-900">{selectedJobForModal.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Phone:</span>
                  <span className="font-bold text-gray-900">{selectedJobForModal.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Vehicle:</span>
                  <span className="font-bold text-gray-900">{selectedJobForModal.vehicleModel} ({selectedJobForModal.vehicleCategory})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Service Package:</span>
                  <span className="font-bold text-gray-900">{selectedJobForModal.serviceType}</span>
                </div>
                {selectedJobForModal.rawJob?.grandTotal && (
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-bold">Total Bill:</span>
                    <span className="font-extrabold text-gray-900">₹{selectedJobForModal.rawJob.grandTotal}</span>
                  </div>
                )}
              </div>

              {selectedJobForModal.rawJob?.paymentStatus !== 'PAID' ? (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-800 mb-4 flex items-center gap-2.5 shadow-2xs">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  <span>Complete payment (₹{selectedJobForModal.rawJob?.balanceAmount || 0} pending) before checkout.</span>
                </div>
              ) : (
                <p className="text-xs text-gray-600 font-medium mb-5 leading-relaxed bg-blue-50/70 border border-blue-100 p-3 rounded-xl">
                  Marking this job as <strong>Completed</strong> will confirm customer delivery, release active workshop space, and update daily completion statistics.
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  disabled={updatingStatusId === (selectedJobForModal._id || selectedJobForModal.id)}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm transition-all shadow-2xs active:scale-98 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteCheckout}
                  disabled={updatingStatusId === (selectedJobForModal._id || selectedJobForModal.id) || selectedJobForModal.rawJob?.paymentStatus !== 'PAID'}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatusId === (selectedJobForModal._id || selectedJobForModal.id) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Completing...</span>
                    </>
                  ) : (
                    <span>Complete Job</span>
                  )}
                </button>
              </div>
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
                  <p className="text-xs text-gray-500 font-medium">Plate: {selectedJobForModal.vehiclePlate}</p>
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
                    onClick={() => updateJobStep(selectedJobForModal._id || selectedJobForModal.id, stepIndex)}
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

      {/* ========================================================== */}
      {/* MODAL: RECORD / UPDATE PAYMENT                             */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isPaymentOpen && selectedJobForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaymentOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Record Job Payment</h3>
                    <p className="text-xs text-gray-500 font-medium">Plate: {selectedJobForModal.vehiclePlate}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPaymentOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePayment} className="space-y-4 my-4">
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Customer:</span>
                    <span className="font-bold text-gray-900">{selectedJobForModal.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Grand Total:</span>
                    <span className="font-extrabold text-gray-900">₹{selectedJobForModal.rawJob?.grandTotal || 0}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-gray-500 font-medium">Remaining Balance:</span>
                    <span className="font-extrabold text-rose-600">
                      ₹{Math.max(0, (selectedJobForModal.rawJob?.grandTotal || 0) - (Number(paymentForm.paidAmount) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    PAID AMOUNT (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedJobForModal.rawJob?.grandTotal || 0}
                    required
                    value={paymentForm.paidAmount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="Enter paid amount"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    PAYMENT METHOD
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['CASH', 'UPI', 'CARD', 'POS'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentForm({ ...paymentForm, paymentMethod: method })}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          paymentForm.paymentMethod === method
                            ? 'bg-black text-white border-black'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    TRANSACTION REFERENCE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={paymentForm.transactionRef}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                    placeholder="e.g. UPI Ref #9876543210"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentOpen(false)}
                    disabled={submittingPayment}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold py-3 px-4 rounded-2xl text-xs transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Payment</span>
                    )}
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

export default Jobs;
