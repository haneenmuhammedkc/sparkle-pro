import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as settingsService from '../services/settingsService';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Store,
  Wrench,
  Sparkles,
  Users,
  CreditCard,
  TrendingUp,
  Shield,
  HardDrive,
  HelpCircle,
  Info,
  LogOut,
  X,
  Loader2
} from 'lucide-react';
import Sidebar from '../../../../components/layout/Sidebar';

// Sub-components Imports
import BusinessProfile from '../components/BusinessProfile';
import WorkshopSettings from '../components/WorkshopSettings';
import ServicesManagement from '../components/ServicesManagement';
import StaffPermissions from '../components/StaffPermissions';
import BillingPayments from '../components/BillingPayments';
import Analytics from '../../analytics/pages/Analytics';
import Security from '../components/Security';
import NotificationsSettings from '../components/NotificationsSettings';
import BackupData from '../components/BackupData';
import HelpSupport from '../components/HelpSupport';
import AboutApp from '../components/AboutApp';

const MENU_ITEMS = [
  { id: 'profile', title: 'Business Profile', desc: 'Manage details and contact info', icon: Store, group: 'Business' },
  { id: 'workshop', title: 'Workshop Settings', desc: 'Hours, locations, and capacity', icon: Wrench, group: 'Business' },
  { id: 'services', title: 'Services Management', desc: 'Add or edit your offerings', icon: Sparkles, group: 'Business' },
  { id: 'staff', title: 'Staff Management', desc: 'Manage roles and permissions', icon: Users, group: 'Team & Billing' },
  { id: 'billing', title: 'Billing & Payments', desc: 'Invoices and payment methods', icon: CreditCard, group: 'Team & Billing' },
  { id: 'reports', title: 'Reports & Analytics', desc: 'View business performance', icon: TrendingUp, group: 'Analytics & Security' },
  { id: 'security', title: 'Security', desc: 'Passwords and 2FA', icon: Shield, group: 'Analytics & Security' },
  { id: 'notifications', title: 'Notifications', desc: 'Alerts and email preferences', icon: Bell, group: 'Analytics & Security' },
  { id: 'backup', title: 'Backup & Data', desc: 'Export data and sync settings', icon: HardDrive, group: 'System & Support' },
  { id: 'support', title: 'Help & Support', desc: 'FAQs and customer service', icon: HelpCircle, group: 'System & Support' },
  { id: 'about', title: 'About Application', desc: 'Version 2.4.1', icon: Info, group: 'System & Support' },
];

const Settings = () => {
  const navigate = useNavigate();

  // Selected Section: null on mobile shows main menu; on desktop defaults to 'profile'
  const [mobileSection, setMobileSection] = useState(null);
  const [desktopSection, setDesktopSection] = useState('profile');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [headerData, setHeaderData] = useState({
    businessName: 'SparklePro Workshop',
    ownerName: 'Shop Owner',
    logo: null,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchHeaderData = async () => {
      try {
        const res = await settingsService.getSettings();
        if (isMounted && res.success && res.data) {
          setHeaderData({
            businessName: res.data.business?.name || 'SparklePro Workshop',
            ownerName: res.data.business?.ownerName || res.data.user?.fullName || 'Shop Owner',
            logo: res.data.business?.logo || null,
          });
        }
      } catch (err) {
        // Fallback silently if offline
      }
    };
    fetchHeaderData();
    return () => { isMounted = false; };
  }, []);

  // Section Selector Helper
  const handleSelectSection = (id) => {
    setMobileSection(id);
    setDesktopSection(id);
  };

  const renderSectionContent = (sectionId) => {
    switch (sectionId) {
      case 'profile':
        return <BusinessProfile />;
      case 'workshop':
        return <WorkshopSettings />;
      case 'services':
        return <ServicesManagement />;
      case 'staff':
        return <StaffPermissions />;
      case 'billing':
        return <BillingPayments />;
      case 'reports':
        return <Analytics />;
      case 'security':
        return <Security />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'backup':
        return <BackupData />;
      case 'support':
        return <HelpSupport />;
      case 'about':
        return <AboutApp />;
      default:
        return <BusinessProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-gray-200 selection:text-gray-900">
      
      {/* Reusable Admin Sidebar */}
      <Sidebar activeItem="more" />

      {/* ========================================================== */}
      {/* MAIN CONTENT CONTAINER                                     */}
      {/* ========================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 sm:pb-36 lg:pb-12">
        
        {/* TOP HEADER */}
        <header className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            {/* Mobile Sub-page Back Button */}
            {mobileSection !== null && (
              <button
                onClick={() => setMobileSection(null)}
                aria-label="Back to Settings Menu"
                className="lg:hidden w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-800 flex items-center justify-center shadow-2xs active:scale-95 shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                Oversee shop configurations and system settings.
              </p>
            </div>
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

        {/* ========================================================== */}
        {/* DESKTOP SPLIT MASTER-DETAIL LAYOUT (lg:grid)              */}
        {/* ========================================================== */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
          
          {/* DESKTOP LEFT MASTER MENU SIDEBAR (4 COLS) */}
          <div className="col-span-4 space-y-4">
            
            {/* Business Profile Summary Banner */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs flex items-center gap-3.5">
              <img
                src={headerData.logo || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"}
                alt={headerData.ownerName}
                className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-gray-900 truncate">{headerData.businessName}</h3>
                <p className="text-xs text-gray-500 font-semibold truncate">{headerData.ownerName}</p>
                <span className="inline-block mt-1 bg-gray-100 text-gray-800 border border-gray-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Professional Plan
                </span>
              </div>
            </div>

            {/* Settings Sections Master List */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-3 shadow-2xs space-y-1">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = desktopSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSection(item.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-black text-white font-bold shadow-2xs'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-sm font-extrabold truncate">{item.title}</span>
                        <span className={`block text-[11px] truncate font-medium ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </button>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-red-600 hover:bg-red-50 font-extrabold text-sm transition-colors mt-2"
              >
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <LogOut className="w-4.5 h-4.5" />
                </div>
                <span>Logout</span>
              </button>
            </div>

          </div>

          {/* DESKTOP RIGHT DETAIL PANE (8 COLS) */}
          <div className="col-span-8 bg-white border border-gray-200/90 rounded-3xl p-7 shadow-2xs min-h-[620px]">
            <motion.div
              key={desktopSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderSectionContent(desktopSection)}
            </motion.div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* MOBILE & TABLET VIEW (<1024px)                             */}
        {/* ========================================================== */}
        <div className="lg:hidden">
          {mobileSection === null ? (
            /* MOBILE MASTER MENU LIST */
            <div className="space-y-6">
              {/* Business Profile Banner */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs space-y-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={headerData.logo || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"}
                    alt={headerData.ownerName}
                    className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-2xs shrink-0"
                  />
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                      {headerData.businessName}
                    </h2>
                    <p className="text-xs font-semibold text-gray-600">{headerData.ownerName}</p>
                    <span className="inline-block mt-1 bg-gray-100 text-gray-800 border border-gray-200 text-xs font-semibold px-3 py-0.5 rounded-full">
                      Professional Plan
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectSection('profile')}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-bold py-2.5 px-4 rounded-2xl text-xs transition-all shadow-2xs"
                >
                  Edit Business Profile
                </button>
              </motion.section>

              {/* Grouped Settings Cards */}
              {['Business', 'Team & Billing', 'Analytics & Security', 'System & Support'].map((groupName) => (
                <div key={groupName} className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                    {groupName}
                  </span>
                  <div className="bg-white border border-gray-200/90 rounded-3xl p-2.5 shadow-2xs divide-y divide-gray-100">
                    {MENU_ITEMS.filter((item) => item.group === groupName).map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSection(item.id)}
                          className="flex items-center justify-between p-3.5 hover:bg-gray-50/80 rounded-2xl cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800 shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="truncate">
                              <h3 className="text-sm font-extrabold text-gray-900 truncate">
                                {item.title}
                              </h3>
                              <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Mobile Logout Card */}
              <div className="bg-white border border-gray-200/90 rounded-3xl p-2.5 shadow-2xs">
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full flex items-center gap-3.5 p-3.5 text-red-600 font-extrabold text-sm hover:bg-red-50 rounded-2xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            /* MOBILE FULL-PAGE SUB-SECTION DETAIL VIEW */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs"
            >
              {renderSectionContent(mobileSection)}
            </motion.div>
          )}
        </div>

      </main>

      {/* ========================================================== */}
      {/* MODAL: LOGOUT CONFIRMATION                                 */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm border border-gray-100 shadow-2xl relative z-10 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
                <LogOut className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Confirm Logout</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Are you sure you want to log out of AutoFlow Ops?
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-900 font-bold py-3 rounded-2xl text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl text-xs sm:text-sm shadow-sm"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Settings;
