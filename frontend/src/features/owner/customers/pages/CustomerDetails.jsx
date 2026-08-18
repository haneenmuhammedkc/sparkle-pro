import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Pencil,
  Star,
  Clock,
  Car,
  Check,
  Calendar,
  Droplet,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Trash2,
  X
} from 'lucide-react';
import Sidebar from '../../../../components/layout/Sidebar';
import * as customerService from '../services/customerService';

const WORKFLOW_STEPS = ['Wait', 'Wash', 'Interior', 'QC', 'Ready'];

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await customerService.getCustomerById(id);
      if (res.success && res.data) {
        setCustomer(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load customer profile from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
    }
  }, [id]);

  // Derived Initials
  const getInitials = (nameStr) => {
    if (!nameStr) return 'CU';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const formData = new FormData(e.target);
    const updatedData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      notes: formData.get('notes'),
    };

    try {
      const res = await customerService.updateCustomer(id, updatedData);
      if (res.success) {
        setIsEditOpen(false);
        await fetchCustomerDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to update customer profile');
    } finally {
      setUpdating(false);
    }
  };

  // Handle Delete
  const handleDeleteCustomer = async () => {
    if (!window.confirm(`Are you sure you want to delete customer ${customer?.name}?`)) {
      return;
    }
    try {
      const res = await customerService.deleteCustomer(id);
      if (res.success) {
        navigate('/customers');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete customer profile');
    }
  };

  const activeJob = customer?.serviceHistory?.find(
    (j) => j.status !== 'Completed' && j.status !== 'Cancelled'
  );

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-blue-100 selection:text-blue-700">
      
      {/* Reusable Admin Sidebar */}
      <Sidebar activeItem="customers" />

      {/* ========================================================== */}
      {/* MAIN CONTENT AREA                                          */}
      {/* ========================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 sm:pb-36 lg:pb-12">
        
        {/* TOP BAR: BACK BUTTON & ACTIONS */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/customers')}
            aria-label="Go Back to Customers"
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center transition-colors border border-gray-200/90 shadow-2xs shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {customer && (
            <button
              onClick={handleDeleteCustomer}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-rose-200/70"
            >
              <Trash2 className="w-4 h-4" />
              Delete Customer
            </button>
          )}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-2xs">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-gray-600">Retrieving customer profile & service history...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {errorMessage && !loading && (
          <div className="max-w-xl mx-auto p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900">Customer Profile Not Found</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{errorMessage}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={fetchCustomerDetails}
                className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-xs hover:bg-black transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/customers')}
                className="px-5 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors"
              >
                Back to Customers
              </button>
            </div>
          </div>
        )}

        {/* MAIN DYNAMIC CONTENT */}
        {!loading && !errorMessage && customer && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: PROFILE HEADER & STATS (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* PROFILE CARD */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 text-center shadow-2xs relative"
              >
                {/* Avatar Initials */}
                <div className="relative inline-block mb-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-900 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-gray-100 shadow-md mx-auto">
                    {getInitials(customer.name)}
                  </div>
                  <span className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white absolute bottom-1 right-1" />
                </div>

                {/* Name & Contact */}
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {customer.name}
                </h2>
                <p className="text-sm font-bold text-gray-700 mt-1">{customer.phone}</p>
                {customer.email && (
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{customer.email}</p>
                )}

                {/* Status Pill */}
                <div className="mt-3 inline-block">
                  <span className="bg-blue-100/90 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-blue-700 text-white" />
                    Verified Customer
                  </span>
                </div>

                {/* Quick Action Buttons Row */}
                <div className="flex items-center justify-center gap-3 mt-6">
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm transition-all shadow-sm active:scale-95"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                    Call
                  </a>

                  <a
                    href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm transition-all shadow-xs active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </a>

                  <button
                    onClick={() => setIsEditOpen(true)}
                    aria-label="Edit Profile"
                    className="p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </motion.section>

              {/* METRICS CARDS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <span className="text-xs font-bold text-gray-500 block mb-1">Total Visits</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {customer.totalVisits || 0}
                  </span>
                </div>

                <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <span className="text-xs font-bold text-gray-500 block mb-1">Total Revenue</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    ₹{customer.totalSpent || 0}
                  </span>
                </div>
              </div>

              {/* VEHICLE PROFILE SECTION */}
              <section className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs">
                <h3 className="text-lg font-extrabold text-gray-900 mb-4">Vehicle Profiles</h3>

                {customer.vehicles && customer.vehicles.length > 0 ? (
                  customer.vehicles.map((v, idx) => (
                    <div
                      key={v.plate || idx}
                      className={`flex items-center justify-between ${
                        idx > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                          <Car className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-gray-900">{v.model || 'Standard Vehicle'}</h4>
                          <span className="inline-block mt-0.5 bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-md border border-gray-200/70">
                            {v.plate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 font-medium">No registered vehicles found for customer.</p>
                )}
              </section>
            </div>

            {/* RIGHT COLUMN: ACTIVE SERVICE & HISTORY (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* ACTIVE SERVICE CARD */}
              {activeJob && (
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white border border-gray-200/90 border-l-4 border-l-black rounded-3xl p-5 sm:p-7 shadow-2xs relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-black text-white text-xs font-extrabold px-3 py-1 rounded-md flex items-center gap-1.5 uppercase">
                      <Droplet className="w-3.5 h-3.5" />
                      {activeJob.workflowStep || activeJob.status}
                    </span>

                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plate</span>
                      <span className="text-base font-extrabold text-gray-900">{activeJob.vehiclePlate}</span>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Active Workshop Service</h3>

                  {/* Stepper */}
                  <div className="my-6 px-1">
                    <div className="grid grid-cols-5 gap-2 relative">
                      <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-gray-200 -z-0" />
                      {WORKFLOW_STEPS.map((stepName, stepIdx) => {
                        const isDone = stepIdx < activeJob.currentStepIndex;
                        const isCurrent = stepIdx === activeJob.currentStepIndex;

                        return (
                          <div key={stepName} className="flex flex-col items-center gap-1.5 relative z-10">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                isDone
                                  ? 'bg-black text-white'
                                  : isCurrent
                                  ? 'bg-blue-100 border-2 border-blue-600 text-blue-700'
                                  : 'bg-gray-100 text-gray-400 border border-gray-200'
                              }`}
                            >
                              {isDone ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : isCurrent ? (
                                <Car className="w-3.5 h-3.5 text-blue-700" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-gray-300" />
                              )}
                            </div>
                            <span className={`text-[11px] font-bold ${isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                              {stepName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* RECENT SERVICE HISTORY */}
              <section className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-extrabold text-gray-900">Service History</h3>
                  <span className="text-xs font-semibold text-gray-400">
                    {customer.serviceHistory?.length || 0} visits
                  </span>
                </div>

                {customer.serviceHistory && customer.serviceHistory.length > 0 ? (
                  customer.serviceHistory.map((job) => (
                    <div
                      key={job._id || job.jobId}
                      className="flex items-center justify-between bg-gray-50/80 border border-gray-100 rounded-2xl p-4 transition-all hover:bg-gray-100/70"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-2xs shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-gray-900">
                            {job.services?.[0]?.name || 'Standard Wash'}
                          </h4>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            {job.vehiclePlate} ({job.vehicleModel})
                          </p>
                          <span
                            className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              job.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-gray-900 block">
                          ₹{job.grandTotal}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-400">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">No service history recorded yet.</p>
                  </div>
                )}
              </section>

            </div>

          </div>
        )}

      </main>

      {/* ========================================================== */}
      {/* MODAL: EDIT CUSTOMER PROFILE                               */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isEditOpen && customer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Edit Customer Profile</h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Customer Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={customer.name}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    defaultValue={customer.phone}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={customer.email}
                    placeholder="e.g. customer@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Customer Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    defaultValue={customer.notes}
                    placeholder="e.g. Prefers ceramic coating, VIP customer..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    disabled={updating}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
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

export default CustomerDetails;
