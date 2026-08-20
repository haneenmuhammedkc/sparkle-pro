import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Clock, LayoutList, Check } from "lucide-react";
import SetupLayout from "../components/SetupLayout";
import { useAuth } from "../../../../context/AuthContext";
import * as businessService from "../services/businessService.js";

export default function ReviewLaunch({ onContinue, onBack }) {
  const navigate = useNavigate();
  const { user, business, setBusiness, fetchBusinessData } = useAuth();
  
  const [currentStep] = useState(4);
  const totalSteps = 4;

  const headerTitle = "Review & Launch";
  const headerDescription =
    "Double-check your configuration before we set up your workspace.";

  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const displayBusinessName = business?.name || "Auto Workshop";
  const displayOwnerName = business?.ownerName || user?.fullName || "Workshop Owner";
  const displayEmail = business?.email || user?.email || "owner@sparklepro.com";
  const displayType = business?.businessType || "Car Wash & Detailing";
  const displayOpening = business?.openingTime || "09:00 AM";
  const displayClosing = business?.closingTime || "06:00 PM";
  const displayHolidays = Array.isArray(business?.weeklyHolidays) && business.weeklyHolidays.length > 0
    ? business.weeklyHolidays.join(", ")
    : "None";
  const displayStaff = business?.staffCount || (business?.isSoloOperator ? "Solo Operator" : "Team Workshop");
  const displayLogo = business?.logo || null;

  const configuredServices = Array.isArray(business?.servicesConfigured) ? business.servicesConfigured : [];
  const enabledServicesCount = configuredServices.filter((s) => s.enabled !== false).length;

  // Load actual backend Business data on mount
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
    };

    verifyAndLoad();
  }, [business]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/setup/service');
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
    if (!agreed) {
      setErrorMessage("Please confirm and accept the Terms & Conditions before launching.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await businessService.launchBusiness({ agreed: true });
      if (res && res.success && res.data) {
        setBusiness(res.data);
        if (onContinue) {
          onContinue({ agreed: true });
        } else {
          navigate('/ready');
        }
      } else {
        const msg = res?.message || "Failed to launch workspace in database.";
        setErrorMessage(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to launch workspace. Please check your backend connection.";
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
      continueText="Launch Workshop"
      isLoading={isLoading}
      isContinueDisabled={!agreed}
      errorMessage={errorMessage}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Card 1: Business Profile */}
        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm sm:text-base">
              <Store className="w-5 h-5 text-gray-800" />
              <h2>Business Profile</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/setup/business')}
              className="text-xs font-semibold text-gray-900 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="bg-[#F8F9FA] border border-gray-200/60 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={displayLogo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                {displayBusinessName}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                {displayOwnerName} • {displayEmail}
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-800">
                {displayType}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Operational Details */}
        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm sm:text-base">
              <Clock className="w-5 h-5 text-gray-800" />
              <h2>Operational Details</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/setup/detail')}
              className="text-xs font-semibold text-gray-900 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#F8F9FA] p-3 rounded-xl">
              <span className="text-[11px] font-semibold text-gray-500 block">Operating Hours</span>
              <span className="font-bold text-gray-900">{displayOpening} - {displayClosing}</span>
            </div>
            <div className="bg-[#F8F9FA] p-3 rounded-xl">
              <span className="text-[11px] font-semibold text-gray-500 block">Weekly Holidays</span>
              <span className="font-bold text-gray-900">{displayHolidays}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Service Menu Overview */}
        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm sm:text-base">
              <LayoutList className="w-5 h-5 text-gray-800" />
              <h2>Services Menu</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/setup/service')}
              className="text-xs font-semibold text-gray-900 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="bg-[#F8F9FA] p-3.5 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700">Configured Active Services</span>
            <span className="font-bold text-gray-900">{enabledServicesCount} Services</span>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-2 shadow-xs">
          <label className="flex items-start gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer mt-0.5 ${
                agreed
                  ? "bg-black border-black text-white"
                  : "bg-white border-gray-300 text-transparent"
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <div className="text-xs text-gray-700 font-medium leading-relaxed">
              I confirm that all business details and operational preferences are accurate and I agree to the{" "}
              <span className="font-bold text-gray-900 underline">Terms of Service</span>.
            </div>
          </label>
        </div>
      </form>
    </SetupLayout>
  );
}
