import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Users, Settings, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import SetupSidebar from '../components/SetupSidebar';
import { useAuth } from '../../../../context/AuthContext';
import * as businessService from '../services/businessService.js';

export default function OperationalDetails({ onContinue, onBack }) {
  const navigate = useNavigate();
  const { business, setBusiness, fetchBusinessData } = useAuth();

  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 4;

  const headerTitle = "Operational Details";
  const headerDescription =
    "Set your business hours and preferences to get your workshop ready.";

  const [openingTime, setOpeningTime] = useState(business?.openingTime || "09:00 AM");
  const [closingTime, setClosingTime] = useState(business?.closingTime || "06:00 PM");
  const [selectedHolidays, setSelectedHolidays] = useState(business?.weeklyHolidays || ["Sat", "Sun"]);
  const [staffCount, setStaffCount] = useState(business?.staffCount || "1-5 Staff Members");
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [isSoloOperator, setIsSoloOperator] = useState(business?.isSoloOperator || false);
  const [currency, setCurrency] = useState(business?.currency || "Indian Rupee (₹)");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Verify Business exists in MongoDB on mount
  useEffect(() => {
    const verifyAndLoad = async () => {
      let currentBiz = business;
      if (!currentBiz) {
        currentBiz = await fetchBusinessData();
      }
      if (!currentBiz) {
        navigate('/setup/business', { replace: true });
        return;
      }
      if (currentBiz.openingTime) setOpeningTime(currentBiz.openingTime);
      if (currentBiz.closingTime) setClosingTime(currentBiz.closingTime);
      if (currentBiz.weeklyHolidays) setSelectedHolidays(currentBiz.weeklyHolidays);
      if (currentBiz.staffCount) setStaffCount(currentBiz.staffCount);
      if (currentBiz.isSoloOperator !== undefined) setIsSoloOperator(currentBiz.isSoloOperator);
      if (currentBiz.currency) setCurrency(currentBiz.currency);
    };

    verifyAndLoad();
  }, [business]);

  const toggleHoliday = (day) => {
    setSelectedHolidays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/setup/business');
    }
  };

  const handleStepClick = (step) => {
    if (step === 1) navigate('/setup/business');
    else if (step === 2) navigate('/setup/detail');
    else if (step === 3) navigate('/setup/service');
    else if (step === 4) navigate('/setup/review');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage("");

    if (openingTime && closingTime && openingTime === closingTime) {
      setErrorMessage("Closing time cannot be equal to opening time.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        openingTime,
        closingTime,
        selectedHolidays,
        staffCount,
        isSoloOperator,
        currency,
      };

      const res = await businessService.saveStep2Operations(payload);
      if (res && res.success && res.data) {
        setBusiness(res.data);
        if (onContinue) {
          onContinue(payload);
        } else {
          navigate('/setup/service');
        }
      } else {
        const msg = res?.message || "Failed to save operational details.";
        setErrorMessage(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save operational details. Please check your backend connection.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#F8F9FB] text-[#111827] font-sans flex flex-col justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-12 lg:py-6 relative select-none lg:overflow-hidden">
      
      {/* =========================================================================
          1. MOBILE VIEW (< 768px / md)
         ========================================================================= */}
      <div className="md:hidden w-full max-w-md mx-auto flex-1 flex flex-col pb-20">
        <SetupSidebar
          currentStep={currentStep}
          totalSteps={totalSteps}
          title={headerTitle}
          description={headerDescription}
          onBack={handleBack}
          onStepClick={handleStepClick}
        />

        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-700 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Clock className="w-5 h-5 text-gray-800" />
              <h2>Business Hours</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-0.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">Opening Time</label>
                <input
                  type="text"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">Closing Time</label>
                <input
                  type="text"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Weekly Holiday</label>
              <div className="flex flex-wrap items-center gap-1.5">
                {days.map((day) => {
                  const isSelected = selectedHolidays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleHoliday(day)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        isSelected ? "bg-black text-white shadow-xs" : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Users className="w-5 h-5 text-gray-800" />
              <h2>Staff Configuration</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">Number of Staff</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 font-medium flex items-center justify-between text-left cursor-pointer"
                  >
                    <span>{staffCount}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {isStaffDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1">
                      {["1-5 Staff Members", "6-10 Staff Members", "10+ Staff Members"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setStaffCount(option);
                            setIsStaffDropdownOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs text-gray-800 hover:bg-gray-50 cursor-pointer"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Solo Operator</h3>
                  <p className="text-[11px] text-gray-400">I'm the only staff member for now</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSoloOperator(!isSoloOperator)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${isSoloOperator ? "bg-black" : "bg-gray-300"}`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 ${isSoloOperator ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Settings className="w-5 h-5 text-gray-800" />
              <h2>Preferences</h2>
            </div>
            <div className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-3.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Currency</span>
              <span className="text-xs font-bold text-gray-900">{currency}</span>
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 left-4 right-4 z-20 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-black hover:bg-gray-800 text-white text-xs font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center shadow-lg active:scale-98 transition-all cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. TABLET / IPAD VIEW (768px to 1023px / md to lg)
         ========================================================================= */}
      <div className="hidden md:flex lg:hidden w-full max-w-xl mx-auto flex-1 flex-col justify-between py-2">
        <SetupSidebar
          currentStep={currentStep}
          totalSteps={totalSteps}
          title={headerTitle}
          description={headerDescription}
          onBack={handleBack}
          onStepClick={handleStepClick}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 text-gray-900 font-semibold text-base">
              <Clock className="w-5 h-5 text-gray-800" />
              <h2>Business Hours</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Opening Time</label>
                <input
                  type="text"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Closing Time</label>
                <input
                  type="text"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200/60 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Weekly Holiday</label>
              <div className="flex items-center gap-2">
                {days.map((day) => {
                  const isSelected = selectedHolidays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleHoliday(day)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${isSelected ? "bg-black text-white shadow-xs" : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 text-gray-900 font-semibold text-base">
              <Users className="w-5 h-5 text-gray-800" />
              <h2>Staff Configuration</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Number of Staff</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-medium flex items-center justify-between cursor-pointer"
                  >
                    <span>{staffCount}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  {isStaffDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1">
                      {["1-5 Staff Members", "6-10 Staff Members", "10+ Staff Members"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setStaffCount(option);
                            setIsStaffDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-gray-800 hover:bg-gray-50 cursor-pointer"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Solo Operator</h3>
                  <p className="text-xs text-gray-500">I'm the only staff member for now</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSoloOperator(!isSoloOperator)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${isSoloOperator ? "bg-black" : "bg-gray-300"}`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 ${isSoloOperator ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-gray-900 font-semibold text-base">
              <Settings className="w-5 h-5 text-gray-800" />
              <h2>Preferences</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Currency</span>
              <span className="text-xs font-bold text-gray-900">{currency}</span>
            </div>
          </div>
        </form>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-black hover:bg-gray-800 text-white text-sm font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. DESKTOP VIEW (≥ 1024px / lg)
         ========================================================================= */}
      <div className="hidden lg:flex w-full max-w-6xl mx-auto flex-1 flex-col justify-between">
        
        {/* Top bar container with strict top alignment */}
        <div className="w-full flex flex-col pt-1">
          <SetupSidebar
            currentStep={currentStep}
            totalSteps={totalSteps}
            title={headerTitle}
            description={headerDescription}
            onBack={handleBack}
            onStepClick={handleStepClick}
          />

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-12 gap-10 items-start mt-2"
          >
            {/* Left Section Header */}
            <div className="col-span-4 space-y-2 pr-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {headerTitle}
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                {headerDescription}
              </p>
            </div>

            {/* Right Section Form Stack */}
            <div className="col-span-8 space-y-4">
              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                  <Clock className="w-4 h-4 text-gray-800" />
                  <h2>Business Hours</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Opening Time</label>
                    <input
                      type="text"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Closing Time</label>
                    <input
                      type="text"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200/60 space-y-2">
                  <label className="block text-[11px] font-semibold text-gray-700">Weekly Holiday</label>
                  <div className="flex items-center gap-2">
                    {days.map((day) => {
                      const isSelected = selectedHolidays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleHoliday(day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${isSelected ? "bg-black text-white shadow-xs" : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                  <Users className="w-4 h-4 text-gray-800" />
                  <h2>Staff Configuration</h2>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Number of Staff</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 font-medium flex items-center justify-between cursor-pointer"
                      >
                        <span>{staffCount}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>

                      {isStaffDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1">
                          {["1-5 Staff Members", "6-10 Staff Members", "10+ Staff Members"].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setStaffCount(option);
                                setIsStaffDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-gray-800 hover:bg-gray-50 cursor-pointer"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">Solo Operator</h3>
                      <p className="text-[11px] text-gray-500">I'm the only staff member for now</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSoloOperator(!isSoloOperator)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${isSoloOperator ? "bg-black" : "bg-gray-300"}`}
                    >
                      <span className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 ${isSoloOperator ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                  <Settings className="w-4 h-4 text-gray-800" />
                  <h2>Preferences</h2>
                </div>

                <div className="bg-white border border-gray-200/90 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Currency</span>
                  <span className="text-xs font-bold text-gray-900">{currency}</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Button */}
        <div className="w-full flex justify-end pb-1">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-black hover:bg-gray-800 text-white text-xs font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}