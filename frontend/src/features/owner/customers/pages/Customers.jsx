import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  SlidersHorizontal,
  Plus,
  Phone,
  LayoutGrid,
  ClipboardList,
  Users,
  UserCheck,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Sidebar from '../../../../components/layout/Sidebar';
import * as customerService from '../services/customerService';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await customerService.getCustomers({
        search: searchQuery,
        page,
        limit: 10,
        sortBy: 'lastVisitAt',
      });

      if (res.success && res.data) {
        setCustomers(res.data.customers || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load customer profiles from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, page]);

  // Helper to derive initials from customer name
  const getInitials = (nameStr) => {
    if (!nameStr) return 'CU';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  // Format date display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-blue-100 selection:text-blue-700">
      
      {/* Reusable Admin Sidebar */}
      <Sidebar activeItem="customers" />

      {/* ========================================================== */}
      {/* MAIN CONTENT AREA                                          */}
      {/* ========================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 sm:pb-36 lg:pb-12">
        
        {/* HEADER */}
        <header className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Customers</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Manage your business customer profiles & vehicle history ({totalCount} total)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/new-job')}
              className="hidden sm:flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-medium px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              New Job
            </button>

            <button
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
              className="p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full" />
            </button>
          </div>
        </header>

        {/* SEARCH & FILTER BAR */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Vehicle Plate, Customer Name, Phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all placeholder:text-gray-400 text-gray-900 shadow-2xs"
            />
          </div>

          <button
            aria-label="Filter options"
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
              onClick={fetchCustomers}
              className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* CUSTOMER CARDS LIST */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-2xs">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
            <p className="text-xs font-bold text-gray-500">Loading customer profiles...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-2xs">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No customers found</h3>
            <p className="text-xs text-gray-500 mt-1">Try creating a job card or adjusting your search query.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {customers.map((customer, idx) => {
              const primaryVehicle = customer.vehicles?.[0] || { model: 'Standard Vehicle', plate: 'N/A' };
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={customer._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-all"
                >
                  {/* Card Header: Initials Avatar, Name, Phone & Status Badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-gray-200/90 text-gray-800 font-extrabold flex items-center justify-center text-sm shadow-2xs border border-gray-300/60">
                        {getInitials(customer.name)}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                          {customer.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-0.5">
                          {customer.phone}
                        </p>
                      </div>
                    </div>

                    <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full border border-gray-200/60">
                      Customer
                    </span>
                  </div>

                  {/* 2x2 Details Grid */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100 mb-5">
                    <div>
                      <span className="block text-xs font-medium text-gray-500">Vehicle</span>
                      <span className="text-sm font-bold text-gray-900 mt-0.5 block">{primaryVehicle.model}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500">Plate</span>
                      <span className="text-sm font-bold text-gray-900 mt-0.5 block">{primaryVehicle.plate}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500">Last Visit</span>
                      <span className="text-sm font-bold text-gray-900 mt-0.5 block">{formatDateDisplay(customer.lastVisitAt)}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500">Total Visits</span>
                      <span className="text-sm font-bold text-gray-900 mt-0.5 block">{customer.totalVisits || 1}</span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => navigate(`/customers/${customer._id}`)}
                      className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-98 text-center ${
                        isEven
                          ? 'bg-black hover:bg-gray-800 text-white'
                          : 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 shadow-2xs'
                      }`}
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => navigate(`/new-job?phone=${encodeURIComponent(customer.phone)}`)}
                      aria-label="Add new job for customer"
                      className="p-3 bg-white hover:bg-gray-50 border border-gray-200/90 text-gray-700 rounded-2xl transition-colors shadow-2xs active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <a
                      href={`tel:${customer.phone}`}
                      aria-label={`Call ${customer.name}`}
                      className="p-3 bg-white hover:bg-gray-50 border border-gray-200/90 text-gray-700 rounded-2xl transition-colors shadow-2xs active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200/80">
            <span className="text-xs font-bold text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

export default Customers;
