import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  CheckCircle2
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-blue-100 selection:text-blue-700">
      
      {/* Reusable Admin Sidebar (Handles Desktop Sidebar & Mobile Bottom Nav) */}
      <AdminSidebar activeItem="customers" />

      {/* ========================================================== */}
      {/* MAIN CONTENT AREA                                          */}
      {/* ========================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 sm:pb-36 lg:pb-12">
        
        {/* COMPACT TOP BAR: ONLY BACK BUTTON TO SAVE SPACE */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/customers')}
            aria-label="Go Back to Customers"
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center transition-colors border border-gray-200/90 shadow-2xs shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* 2-COLUMN RESPONSIVE LAYOUT (DESKTOP & TABLET MATCHING PROJECT THEME) */}
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
              {/* Avatar with Online Status Dot */}
              <div className="relative inline-block mb-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                  alt="Sarah Jenkins"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-100 shadow-md mx-auto"
                />
                <span className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white absolute bottom-1 right-1" />
              </div>

              {/* Name & Contact */}
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Sarah Jenkins
              </h2>
              <p className="text-sm font-bold text-gray-700 mt-1">+91 98765 43210</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Member since Oct 2023</p>

              {/* Status Pill */}
              <div className="mt-3 inline-block">
                <span className="bg-blue-100/90 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-blue-700 text-white" />
                  Active Customer
                </span>
              </div>

              {/* Quick Action Buttons Row */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm transition-all shadow-sm active:scale-95"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  Call
                </a>

                <button className="flex items-center gap-2 bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm transition-all shadow-xs active:scale-95">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </button>

                <button
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
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">12</span>
              </div>

              <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
                <div className="flex items-center gap-1 text-xs font-bold text-gray-500 mb-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Rating
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">4.9</span>
                  <span className="text-xs text-gray-400 font-semibold">/ 5</span>
                </div>
              </div>
            </div>

            {/* Last Visit Row */}
            <div className="bg-white border border-gray-200/90 rounded-2xl px-5 py-3 shadow-2xs flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Last Visit
              </span>
              <span className="text-gray-900 font-bold">2 weeks ago</span>
            </div>

            {/* VEHICLE PROFILE SECTION */}
            <section className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs">
              <h3 className="text-lg font-extrabold text-gray-900 mb-4">Vehicle Profile</h3>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                    <Car className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-extrabold text-gray-900">2023 Nexus SUV</h4>
                    <span className="inline-block mt-0.5 bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-md border border-gray-200/70">
                      TS-04-ED-1234
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">COLOR</span>
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <span className="w-3 h-3 rounded-full bg-black inline-block" />
                    Midnight Black
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">TYPE</span>
                  <span className="font-bold text-gray-900">SUV</span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: ACTIVE SERVICE & HISTORY (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* ACTIVE SERVICE CARD (WITH LEFT BLACK ACCENT BORDER) */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white border border-gray-200/90 border-l-4 border-l-black rounded-3xl p-5 sm:p-7 shadow-2xs relative"
            >
              {/* Header Badge & ETA */}
              <div className="flex items-center justify-between mb-3">
                <span className="bg-black text-white text-xs font-extrabold px-3 py-1 rounded-md flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5" />
                  IN WASHING
                </span>

                <div className="text-right">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">ETA</span>
                  <span className="text-lg font-extrabold text-gray-900">20m</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Active Service</h3>

              {/* Stepper */}
              <div className="my-6 px-1">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-3 right-3 top-4 h-[2px] bg-gray-200 -z-0" />
                  {[
                    { name: 'Wait', status: 'done' },
                    { name: 'Wash', status: 'active' },
                    { name: 'Interior', status: 'pending' },
                    { name: 'QC', status: 'pending' },
                    { name: 'Ready', status: 'pending' },
                  ].map((step) => (
                    <div key={step.name} className="flex flex-col items-center gap-1.5 relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.status === 'done'
                            ? 'bg-black text-white'
                            : step.status === 'active'
                            ? 'bg-blue-100 border-2 border-blue-600 text-blue-700 shadow-xs'
                            : 'bg-gray-200 text-transparent'
                        }`}
                      >
                        {step.status === 'done' ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : step.status === 'active' ? (
                          <Car className="w-4 h-4 text-blue-700" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <span className={`text-[11px] sm:text-xs font-bold ${step.status === 'active' ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Tech Sub-card */}
              <div className="bg-gray-50/90 border border-gray-100 rounded-2xl p-4 flex items-center justify-between mt-6">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                    alt="Mike R."
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">ASSIGNED TO</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">Mike R.</span>
                  </div>
                </div>

                <button
                  aria-label="Message technician"
                  className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-2xs"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                </button>
              </div>
            </motion.section>

            {/* ACTIVE SERVICES PROGRESS BARS */}
            <section className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
              <h3 className="text-lg font-extrabold text-gray-900 mb-2">Active Services</h3>

              {/* Service Item 1 */}
              <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-gray-900 mb-2">
                  <span>Exterior Wash</span>
                  <span>60%</span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-black h-full rounded-full w-[60%] transition-all duration-500" />
                </div>
              </div>

              {/* Service Item 2 */}
              <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-gray-900 mb-2">
                  <span>Interior Cleaning</span>
                  <span className="text-gray-400">0%</span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gray-300 h-full rounded-full w-0" />
                </div>
              </div>
            </section>

            {/* RECENT HISTORY */}
            <section className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-gray-900">Recent History</h3>
                <button className="text-xs font-bold text-gray-500 hover:text-gray-900">View All</button>
              </div>

              <div className="flex items-center justify-between bg-gray-50/70 border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-2xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900">Full Detail</h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Completed successfully</p>
                    <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Completed
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-gray-400">Oct 12, 2023</span>
              </div>
            </section>

          </div>

        </div>
      </main>

    </div>
  );
};

export default CustomerDetails;
