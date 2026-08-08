import React, { useState } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const CUSTOMERS_DATA = [
  {
    id: 'sarah-jenkins',
    initials: 'SJ',
    name: 'Sarah Jenkins',
    phone: '+1 (555) 123-4567',
    status: 'In Service',
    vehicle: 'Tesla Model 3',
    plate: 'TN 45 EF 9012',
    lastVisit: 'Today',
    totalVisits: 12,
    isPrimaryButtonBlack: true,
  },
  {
    id: 'marcus-rodriguez',
    initials: 'MR',
    name: 'Marcus Rodriguez',
    phone: '+1 (555) 987-6543',
    status: 'Idle',
    vehicle: 'Ford F-150',
    plate: 'TX 88 AB 1122',
    lastVisit: '3 days ago',
    totalVisits: 4,
    isPrimaryButtonBlack: false,
  },
];

const Customers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileTab, setMobileTab] = useState('customers');

  const filteredCustomers = CUSTOMERS_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMobileNav = (tabId) => {
    setMobileTab(tabId);
    if (tabId === 'dashboard') navigate('/dashboard');
    if (tabId === 'jobs') navigate('/jobs');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-blue-100 selection:text-blue-700">
      
      {/* Reusable Admin Sidebar */}
      <AdminSidebar activeItem="customers" />

      {/* ========================================================== */}
      {/* MAIN CONTENT AREA                                          */}
      {/* ========================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 sm:pb-36 lg:pb-12">
        
        {/* HEADER */}
        <header className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Customers</h1>
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
            aria-label="Filter options"
            className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs shrink-0"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* CUSTOMER CARDS LIST */}
        <div className="space-y-5">
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-all"
            >
              {/* Card Header: Initials Avatar, Name, Phone & Status Badge */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gray-200/90 text-gray-800 font-extrabold flex items-center justify-center text-sm shadow-2xs border border-gray-300/60">
                    {customer.initials}
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
                  {customer.status}
                </span>
              </div>

              {/* 2x2 Details Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100 mb-5">
                <div>
                  <span className="block text-xs font-medium text-gray-500">Vehicle</span>
                  <span className="text-sm font-bold text-gray-900 mt-0.5 block">{customer.vehicle}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">Plate</span>
                  <span className="text-sm font-bold text-gray-900 mt-0.5 block">{customer.plate}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">Last Visit</span>
                  <span className="text-sm font-bold text-gray-900 mt-0.5 block">{customer.lastVisit}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">Total Visits</span>
                  <span className="text-sm font-bold text-gray-900 mt-0.5 block">{customer.totalVisits}</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-98 text-center ${
                    customer.isPrimaryButtonBlack
                      ? 'bg-black hover:bg-gray-800 text-white'
                      : 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 shadow-2xs'
                  }`}
                >
                  View Details
                </button>

                <button
                  aria-label="Add new record"
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
          ))}
        </div>
      </main>



    </div>
  );
};

export default Customers;
