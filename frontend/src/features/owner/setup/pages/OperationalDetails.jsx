import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, Settings, ChevronDown } from "lucide-react";
import SetupLayout from "../components/SetupLayout";
import { useAuth } from "../../../../context/AuthContext";
import * as businessService from "../services/businessService.js";

export default function OperationalDetails({ onContinue, onBack }) {
  const navigate = useNavigate();
  const { business, setBusiness, fetchBusinessData } = useAuth();

  const [currentStep] = useState(2);
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
  const [currency] = useState(business?.currency || "Indian Rupee (₹)");
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
    <SetupLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title={headerTitle}
      description={headerDescription}
      onBack={handleBack}
      onStepClick={handleStepClick}
      onContinue={handleSubmit}
      isLoading={isLoading}
      errorMessage={errorMessage}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Card 1: Business Hours */}
        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base sm:text-lg">
            <Clock className="w-5 h-5 text-gray-800" />
            <h2>Business Hours</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Opening Time
              </label>
              <input
                type="text"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Closing Time
              </label>
              <input
                type="text"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Weekly Holiday
            </label>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {days.map((day) => {
                const isSelected = selectedHolidays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleHoliday(day)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? "bg-black text-white shadow-xs"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Staff Configuration */}
        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base sm:text-lg">
            <Users className="w-5 h-5 text-gray-800" />
            <h2>Staff Configuration</h2>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Number of Staff
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 font-medium flex items-center justify-between cursor-pointer"
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
                        className="w-full text-left px-3.5 py-2 text-xs sm:text-sm text-gray-800 hover:bg-gray-50 cursor-pointer"
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
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                  Solo Operator
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  I'm the only staff member for now
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSoloOperator(!isSoloOperator)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isSoloOperator ? "bg-black" : "bg-gray-300"
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 ${
                    isSoloOperator ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Preferences */}
        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base sm:text-lg">
            <Settings className="w-5 h-5 text-gray-800" />
            <h2>Preferences</h2>
          </div>
          <div className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-3 sm:p-3.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Currency</span>
            <span className="text-xs sm:text-sm font-bold text-gray-900">{currency}</span>
          </div>
        </div>
      </form>
    </SetupLayout>
  );
}