import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplet, ArrowLeft } from 'lucide-react';

const PublicPageLayout = ({ title, subtitle, icon: Icon, children, activePage }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col font-sans antialiased selection:bg-black selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-gray-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/login" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105">
              <Droplet className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-lg tracking-tight leading-none">
                SparklePro
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide">
                Car Wash & Detailing
              </span>
            </div>
          </Link>

          {/* Action / Back to Sign In */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200/80 px-3.5 py-2 rounded-xl transition-all duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </header>

      {/* Page Hero Header */}
      <section className="bg-white border-b border-gray-200/60 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          {Icon && (
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-900 mb-2">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>

      {/* Footer Navigation */}
      <footer className="bg-white border-t border-gray-200/80 py-8 px-4 sm:px-6 lg:px-8 text-center mt-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-gray-500">
            <Link
              to="/privacy-policy"
              className={`hover:text-gray-900 transition-colors ${
                activePage === 'privacy' ? 'text-black font-bold underline' : ''
              }`}
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/terms-of-service"
              className={`hover:text-gray-900 transition-colors ${
                activePage === 'terms' ? 'text-black font-bold underline' : ''
              }`}
            >
              Terms of Service
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/help"
              className={`hover:text-gray-900 transition-colors ${
                activePage === 'help' ? 'text-black font-bold underline' : ''
              }`}
            >
              Need Help?
            </Link>
          </div>
          <p className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} SparklePro Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPageLayout;
