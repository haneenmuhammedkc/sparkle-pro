import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  ClipboardList,
  Users,
  UserCheck,
  MoreHorizontal,
  Car
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
  { id: 'jobs', label: 'Jobs', path: '/jobs', icon: ClipboardList },
  { id: 'customers', label: 'Customers', path: '/customers', icon: Users },
  { id: 'staff', label: 'Staff', path: '/staff', icon: UserCheck },
  { id: 'more', label: 'More', path: '/more', icon: MoreHorizontal },
];

const AdminSidebar = ({ activeItem }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (item) => {
    navigate(item.path);
  };

  return (
    <>
      {/* ========================================================== */}
      {/* DESKTOP SIDEBAR (Visible on lg screens)                    */}
      {/* ========================================================== */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200/80 bg-white sticky top-0 h-screen overflow-y-auto p-6 justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo & Brand Header */}
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 px-2 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">AutoFlow Ops</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeItem === item.id ||
                location.pathname === item.path ||
                (item.id === 'dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) ||
                (item.id === 'customers' && location.pathname.startsWith('/customers'));

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100/80 text-blue-600 font-semibold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="pt-6 border-t border-gray-100 flex items-center gap-3 px-2">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
            alt="Marcus V."
            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-gray-900 truncate">Marcus V.</span>
            <span className="text-xs text-gray-500 font-medium truncate">Operations Manager</span>
          </div>
        </div>
      </aside>

      {/* ========================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile/tablet)    */}
      {/* ========================================================== */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="bg-gray-200/95 backdrop-blur-xl border border-gray-300/60 rounded-2xl shadow-xl p-1.5 flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeItem === item.id ||
              location.pathname === item.path ||
              (item.id === 'dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) ||
              (item.id === 'customers' && location.pathname.startsWith('/customers'));

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl text-[10px] font-bold transition-all ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
