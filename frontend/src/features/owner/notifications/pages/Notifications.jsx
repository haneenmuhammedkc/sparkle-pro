import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Car,
  UserCheck,
  AlertCircle,
  Clock,
  Check
} from 'lucide-react';
import Sidebar from '../../../../components/layout/Sidebar';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Vehicle Ready for Delivery',
    desc: 'Car TS-04-ED-1234 has passed Quality Check and is marked Ready to Go.',
    time: '10 mins ago',
    type: 'jobs',
    unread: true,
    icon: CheckCircle2,
  },
  {
    id: 2,
    title: 'New Vehicle Check-In',
    desc: 'Jane Smith checked in a Toyota Fortuner for Quick Wash Express.',
    time: '45 mins ago',
    type: 'jobs',
    unread: true,
    icon: Car,
  },
  {
    id: 3,
    title: 'Staff Target Exceeded',
    desc: 'Ajmal completed 6 jobs today exceeding his daily target.',
    time: '2 hours ago',
    type: 'staff',
    unread: false,
    icon: UserCheck,
  },
  {
    id: 4,
    title: 'System Backup Completed',
    desc: 'Weekly system cloud backup was successfully executed.',
    time: '5 hours ago',
    type: 'system',
    unread: false,
    icon: AlertCircle,
  },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return n.unread;
    if (filter === 'jobs') return n.type === 'jobs';
    if (filter === 'staff') return n.type === 'staff';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-gray-200 selection:text-gray-900">
      
      {/* Reusable Admin Sidebar */}
      <Sidebar activeItem="dashboard" />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full pb-28 sm:pb-36 lg:pb-12">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go Back"
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center transition-colors border border-gray-200/90 shadow-2xs shrink-0 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Notifications
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                Real-time updates on jobs, staff targets, and shop activity.
              </p>
            </div>
          </div>

          <button
            onClick={markAllRead}
            className="text-xs font-bold text-gray-600 hover:text-black bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-2xs"
          >
            Mark All Read
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'unread', 'jobs', 'staff'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                filter === f
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-gray-200/70 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifs.map((notif) => {
            const Icon = notif.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                  notif.unread
                    ? 'bg-white border-black/40 shadow-xs'
                    : 'bg-white/80 border-gray-200/90 opacity-90'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-900 shrink-0 border border-gray-200">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
                        {notif.title}
                      </h3>
                      <span className="text-[11px] font-bold text-gray-400 shrink-0">{notif.time}</span>
                    </div>

                    <p className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                      {notif.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

    </div>
  );
};

export default NotificationsPage;
