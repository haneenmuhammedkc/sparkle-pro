import React from "react";
import { ArrowRight, Check, Store } from "lucide-react";

export default function BusinessReady({ onDashboardClick }) {
  const handleDashboardClick = (e) => {
    e?.preventDefault();
    if (onDashboardClick) {
      onDashboardClick();
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#F8F9FB] text-[#111827] font-sans flex flex-col justify-between px-4 py-6 sm:px-6 lg:px-12 relative select-none lg:overflow-hidden">
      
      {/* =========================================================================
          1. MOBILE VIEW (< 768px)
         ========================================================================= */}
      <div className="md:hidden w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center py-6 space-y-6">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[#E6F4EA] flex items-center justify-center relative shadow-xs">
          <div className="absolute inset-0 rounded-full border-4 border-[#CEEAD6] animate-pulse"></div>
          <Check className="w-8 h-8 text-[#137333] stroke-[3]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Your Business is Ready!
          </h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            SparklePro is set up and configured for your team.
          </p>
        </div>

        {/* Business Info Card */}
        <div className="w-full bg-white border border-gray-100 rounded-3xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8EAF6] flex items-center justify-center text-[#3F51B5] shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Acme Cleaning Services</h3>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              Premium Plan • 5 Team Members
            </p>
          </div>
        </div>

        {/* Ready checklist wrapper */}
        <div className="w-full space-y-2.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-1">
            Everything is Ready
          </span>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs divide-y divide-gray-100">
            <div className="px-4 py-3.5 flex items-center gap-3 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Company Profile Created</span>
            </div>

            <div className="px-4 py-3.5 flex items-center gap-3 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Staff Members Invited</span>
            </div>

            <div className="px-4 py-3.5 flex items-center gap-3 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Service Menu Configured</span>
            </div>

            <div className="px-4 py-3.5 flex items-center gap-3 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Payment Gateway Linked</span>
            </div>
          </div>
        </div>

        {/* Dashboard Button */}
        <div className="w-full pt-2">
          <button
            type="button"
            onClick={handleDashboardClick}
            className="w-full bg-black hover:bg-gray-800 text-white text-xs font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. TABLET / IPAD VIEW (768px to 1023px / md to lg)
         ========================================================================= */}
      <div className="hidden md:flex lg:hidden w-full max-w-xl mx-auto flex-1 flex-col items-center justify-center py-6 my-auto space-y-6">
        
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-[#E6F4EA] flex items-center justify-center relative shadow-xs">
          <div className="absolute inset-0 rounded-full border-4 border-[#CEEAD6] animate-pulse"></div>
          <Check className="w-10 h-10 text-[#137333] stroke-[3]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Your Business is Ready!
          </h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            SparklePro is set up and configured for your team.
          </p>
        </div>

        {/* Business Info Card */}
        <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E8EAF6] flex items-center justify-center text-[#3F51B5] shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Acme Cleaning Services</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Premium Plan • 5 Team Members
            </p>
          </div>
        </div>

        {/* Checklist Container */}
        <div className="w-full space-y-2.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block px-1">
            Everything is Ready
          </span>

          <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            <div className="px-5 py-4 flex items-center gap-3.5 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Company Profile Created</span>
            </div>

            <div className="px-5 py-4 flex items-center gap-3.5 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Staff Members Invited</span>
            </div>

            <div className="px-5 py-4 flex items-center gap-3.5 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Service Menu Configured</span>
            </div>

            <div className="px-5 py-4 flex items-center gap-3.5 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Payment Gateway Linked</span>
            </div>
          </div>
        </div>

        {/* Dashboard Button */}
        <div className="w-full flex justify-end pt-2">
          <button
            type="button"
            onClick={handleDashboardClick}
            className="bg-black hover:bg-gray-800 text-white text-xs font-medium py-3.5 px-7 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer ml-auto"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* =========================================================================
          3. DESKTOP VIEW (≥ 1024px / lg)
         ========================================================================= */}
      <div className="hidden lg:flex w-full max-w-2xl mx-auto flex-1 flex-col items-center justify-center py-4 my-auto space-y-6">
        
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-[#E6F4EA] flex items-center justify-center relative shadow-xs">
          <div className="absolute inset-0 rounded-full border-4 border-[#CEEAD6] animate-pulse"></div>
          <Check className="w-10 h-10 text-[#137333] stroke-[3]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Your Business is Ready!
          </h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            SparklePro is set up and configured for your team.
          </p>
        </div>

        {/* Business Info Card */}
        <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E8EAF6] flex items-center justify-center text-[#3F51B5] shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Acme Cleaning Services</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Premium Plan • 5 Team Members
            </p>
          </div>
        </div>

        {/* Checklist Container */}
        <div className="w-full space-y-2.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block px-1">
            Everything is Ready
          </span>

          <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            <div className="px-5 py-4 flex items-center gap-3.5 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Company Profile Created</span>
            </div>

            <div className="px-5 py-4 flex items-center gap-3.5 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Staff Members Invited</span>
            </div>

            <div className="px-5 py-4 flex items-center gap-3.5 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Service Menu Configured</span>
            </div>

            <div className="px-5 py-4 flex items-center gap-3.5 text-xs font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Payment Gateway Linked</span>
            </div>
          </div>
        </div>

        {/* Dashboard Button */}
        <div className="w-full flex justify-end pt-2">
          <button
            type="button"
            onClick={handleDashboardClick}
            className="bg-black hover:bg-gray-800 text-white text-xs font-medium py-3.5 px-7 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer ml-auto"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}