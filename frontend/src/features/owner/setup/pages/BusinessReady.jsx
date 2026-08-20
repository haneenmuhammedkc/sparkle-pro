import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Store } from "lucide-react";
import { useAuth } from '../../../../context/AuthContext';

export default function BusinessReady({ onDashboardClick }) {
  const navigate = useNavigate();
  const { user, business } = useAuth();

  const businessName = business?.name || (user?.fullName ? `${user.fullName}'s Workshop` : "Auto Workshop");
  const staffCountText = business?.staffCount || (business?.isSoloOperator ? "Solo Operator" : "Team Workshop");

  const handleDashboardClick = (e) => {
    e?.preventDefault();
    if (onDashboardClick) {
      onDashboardClick();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#F8F9FB] text-[#111827] font-sans flex flex-col justify-between px-4 py-6 sm:px-6 lg:px-12 relative select-none lg:overflow-hidden">
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col items-center justify-center space-y-5 sm:space-y-6 my-auto">
        {/* Success Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E6F4EA] flex items-center justify-center relative shadow-xs shrink-0">
          <div className="absolute inset-0 rounded-full border-4 border-[#CEEAD6] animate-pulse"></div>
          <Check className="w-8 h-8 sm:w-10 sm:h-10 text-[#137333] stroke-[3]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center space-y-1 sm:space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Your Business is Ready!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xs sm:max-w-sm mx-auto leading-relaxed font-normal">
            SparklePro is set up and configured for your team.
          </p>
        </div>

        {/* Business Info Card */}
        <div className="w-full bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#E8EAF6] flex items-center justify-center text-[#3F51B5] shrink-0">
            <Store className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900">{businessName}</h3>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">
              Free Trial Active • {staffCountText}
            </p>
          </div>
        </div>

        {/* Checklist Container */}
        <div className="w-full space-y-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider block px-1">
            Everything is Ready
          </span>

          <div className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs divide-y divide-gray-100">
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Company Profile Created</span>
            </div>

            <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Staff Members Invited</span>
            </div>

            <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-900">
              <div className="w-5 h-5 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Service Menu Configured</span>
            </div>

            <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-900">
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
            className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-semibold py-3.5 px-7 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}