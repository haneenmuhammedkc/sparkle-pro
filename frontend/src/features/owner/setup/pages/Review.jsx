import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Clock, LayoutList, Users, Check, Loader2, AlertCircle } from "lucide-react";
import SetupSidebar from '../components/SetupSidebar';
import { useAuth } from '../../../../context/AuthContext';
import * as businessService from '../services/businessService.js';

export default function ReviewLaunch({ onContinue, onBack }) {
  const navigate = useNavigate();
  const { user, business, setBusiness, fetchBusinessData } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(4);
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
  const displayLogo = business?.logo || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=100&q=80";

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
    <div className="min-h-screen lg:h-screen bg-[#F8F9FB] text-[#111827] font-sans flex flex-col justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-12 lg:py-6 relative select-none lg:overflow-hidden">
      {/* =========================================================================
          1. MOBILE VIEW (< 768px / md)
         ========================================================================= */}
      <div className="md:hidden w-full max-w-md mx-auto flex-1 flex flex-col pb-24">
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

        <div className="space-y-4 pt-1">
          {/* Card 1: Business Profile */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-gray-900 font-bold text-xs">
                <Store className="w-4 h-4 text-gray-800" />
                <span>Business Profile</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/setup/business')}
                className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={displayLogo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">
                  {displayBusinessName}
                </h3>
                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>{" "}
                  {displayType}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 pt-1 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Owner
                </span>
                <span className="font-semibold text-gray-900 mt-0.5 block truncate">
                  {displayOwnerName}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Contact
                </span>
                <span className="font-semibold text-gray-900 mt-0.5 block truncate">
                  {displayEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Operational Hours */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-gray-900 font-bold text-xs">
                <Clock className="w-4 h-4 text-gray-800" />
                <span>Operational Hours</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/setup/detail')}
                className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-500">Daily Schedule</span>
              <span className="font-bold text-gray-900">
                {displayOpening} - {displayClosing}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
              <span className="text-gray-500">Weekly Holiday</span>
              <span className="px-2.5 py-1 bg-gray-100 font-semibold rounded-lg text-gray-900">
                {displayHolidays}
              </span>
            </div>
          </div>

          {/* Card 3: Service Summary */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-gray-900 font-bold text-xs">
                <LayoutList className="w-4 h-4 text-gray-800" />
                <span>Service Summary</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/setup/service')}
                className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#F8F9FA] p-3.5 rounded-2xl text-center border border-gray-100">
                <span className="block text-base font-black text-gray-900">
                  {enabledServicesCount}
                </span>
                <span className="text-[10px] font-semibold text-gray-500">
                  Enabled Services
                </span>
              </div>
              <div className="bg-[#F8F9FA] p-3.5 rounded-2xl text-center border border-gray-100">
                <span className="block text-base font-black text-gray-900">
                  Configured
                </span>
                <span className="text-[10px] font-semibold text-gray-500">
                  Price Tier
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Staff & Payments */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-gray-900 font-bold text-xs">
                <Users className="w-4 h-4 text-gray-800" />
                <span>Staff & Payments</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/setup/detail')}
                className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-500">Active Staff Members</span>
              <span className="font-bold text-gray-900">{displayStaff}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 items-center">
              <span className="text-gray-500">Payment Methods</span>
              <div className="flex gap-1.5">
                <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold rounded-md text-gray-800">
                  UPI
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold rounded-md text-gray-800">
                  CARD
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox Card */}
          <div className={`bg-white border rounded-3xl p-4 flex items-start gap-3 shadow-xs transition-all ${
            !agreed && errorMessage ? "border-red-400 bg-red-50/40 ring-2 ring-red-100" : "border-gray-100"
          }`}>
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                agreed
                  ? "bg-black border-black text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {agreed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <p className="text-[11px] text-gray-600 leading-normal">
              I confirm that the above information is correct and I agree to the{" "}
              <span className="font-bold text-gray-900 underline">
                Terms & Conditions
              </span>{" "}
              and{" "}
              <span className="font-bold text-gray-900 underline">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>

        {/* Mobile Floating Buttons */}
        <div className="fixed bottom-4 left-4 right-4 z-20 max-w-md mx-auto space-y-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-600 text-white text-xs font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center shadow-lg active:scale-98 transition-all cursor-pointer gap-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Launching Workspace...</span>
              </>
            ) : (
              <span>Launch Dashboard 🚀</span>
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold py-3 px-6 rounded-xl flex items-center justify-center transition-all cursor-pointer"
          >
            Back to Edit
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card 1 */}
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
                <Store className="w-4 h-4 text-gray-800" />
                <h2>Business Profile</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/setup/business')}
                className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={displayLogo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">
                  {displayBusinessName}
                </h3>
                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>{" "}
                  {displayType}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Owner
                </span>
                <span className="font-semibold text-gray-900 mt-0.5 block truncate">
                  {displayOwnerName}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Contact
                </span>
                <span className="font-semibold text-gray-900 mt-0.5 block truncate">
                  {displayEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
                <Clock className="w-4 h-4 text-gray-800" />
                <h2>Operational Hours</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/setup/detail')}
                className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-500">Daily Schedule</span>
              <span className="font-bold text-gray-900">
                {displayOpening} - {displayClosing}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60">
              <span className="text-gray-500">Weekly Holiday</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 font-semibold rounded-lg text-gray-900">
                {displayHolidays}
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
                <LayoutList className="w-4 h-4 text-gray-800" />
                <h2>Service Summary</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/setup/service')}
                className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-3.5 rounded-xl text-center border border-gray-200/80">
                <span className="block text-base font-black text-gray-900">
                  {enabledServicesCount}
                </span>
                <span className="text-[10px] font-semibold text-gray-500">
                  Enabled Services
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl text-center border border-gray-200/80">
                <span className="block text-base font-black text-gray-900">
                  Configured
                </span>
                <span className="text-[10px] font-semibold text-gray-500">
                  Price Tier
                </span>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
                <Users className="w-4 h-4 text-gray-800" />
                <h2>Staff & Payments</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/setup/detail')}
                className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-500">Active Staff Members</span>
              <span className="font-bold text-gray-900">{displayStaff}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60 items-center">
              <span className="text-gray-500">Payment Methods</span>
              <div className="flex gap-1.5">
                <span className="px-2 py-0.5 bg-white border border-gray-200 text-[10px] font-bold rounded-md text-gray-800">
                  UPI
                </span>
                <span className="px-2 py-0.5 bg-white border border-gray-200 text-[10px] font-bold rounded-md text-gray-800">
                  CARD
                </span>
              </div>
            </div>
          </div>

          {/* Agreement checkbox */}
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                agreed
                  ? "bg-black border-black text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {agreed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <p className="text-[11px] text-gray-600 leading-normal">
              I confirm that the above information is correct and I agree to the{" "}
              <span className="font-bold text-gray-900 underline">
                Terms & Conditions
              </span>{" "}
              and{" "}
              <span className="font-bold text-gray-900 underline">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </form>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 text-xs font-semibold py-3 px-6 rounded-xl flex items-center justify-center transition-all cursor-pointer"
          >
            Back to Edit
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-black hover:bg-gray-800 text-white text-xs font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <span>Launch Dashboard 🚀</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. DESKTOP VIEW (≥ 1024px / lg)
         ========================================================================= */}
      <div className="hidden lg:flex w-full max-w-6xl mx-auto flex-1 flex-col justify-between lg:overflow-hidden">
        {/* Top bar container with strict top alignment */}
        <div className="w-full flex flex-col pt-1 flex-1 min-h-0">
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
            className="grid grid-cols-12 gap-10 items-start mt-2 flex-1 min-h-0"
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

            {/* Right Section Form Stack with Custom Scrollbar */}
            <div className="col-span-8 h-full overflow-y-auto pr-2 space-y-4 pb-4">
              {/* Card 1 */}
              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                    <Store className="w-4 h-4 text-gray-800" />
                    <h2>Business Profile</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/setup/business')}
                    className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={displayLogo}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900">
                      {displayBusinessName}
                    </h3>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>{" "}
                      {displayType}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      OWNER
                    </span>
                    <span className="font-semibold text-gray-900 mt-0.5 block truncate">
                      {displayOwnerName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      CONTACT
                    </span>
                    <span className="font-semibold text-gray-900 mt-0.5 block truncate">
                      {displayEmail}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                    <Clock className="w-4 h-4 text-gray-800" />
                    <h2>Operational Hours</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/setup/detail')}
                    className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">Daily Schedule</span>
                  <span className="font-bold text-gray-900">
                    {displayOpening} - {displayClosing}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60">
                  <span className="text-gray-500">Weekly Holiday</span>
                  <span className="px-2.5 py-1 bg-white border border-gray-200 font-semibold rounded-lg text-gray-900">
                    {displayHolidays}
                  </span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                    <LayoutList className="w-4 h-4 text-gray-800" />
                    <h2>Service Summary</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/setup/service')}
                    className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3.5 rounded-xl text-center border border-gray-200/80">
                    <span className="block text-base font-black text-gray-900">
                      {enabledServicesCount}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500">
                      Enabled Services
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl text-center border border-gray-200/80">
                    <span className="block text-base font-black text-gray-900">
                      Configured
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500">
                      Price Tier
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                    <Users className="w-4 h-4 text-gray-800" />
                    <h2>Staff & Payments</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/setup/detail')}
                    className="text-xs font-semibold text-gray-900 hover:opacity-75 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">Active Staff Members</span>
                  <span className="font-bold text-gray-900">{displayStaff}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60 items-center">
                  <span className="text-gray-500">Payment Methods</span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 bg-white border border-gray-200 text-[10px] font-bold rounded-md text-gray-800">
                      UPI
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-gray-200 text-[10px] font-bold rounded-md text-gray-800">
                      CARD
                    </span>
                  </div>
                </div>
              </div>

              {/* Agreement checkbox */}
              <div className={`bg-[#F8F9FA] border rounded-2xl p-4 flex items-start gap-3 shadow-xs transition-all ${
                !agreed && errorMessage ? "border-red-400 bg-red-50/40 ring-2 ring-red-100" : "border-gray-200/80"
              }`}>
                <button
                  type="button"
                  onClick={() => setAgreed(!agreed)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                    agreed
                      ? "bg-black border-black text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {agreed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <p className="text-[11px] text-gray-600 leading-normal">
                  I confirm that the above information is correct and I agree to
                  the{" "}
                  <span className="font-bold text-gray-900 underline">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="font-bold text-gray-900 underline">
                    Privacy Policy
                  </span>
                  .
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions — Right-Aligned */}
        <div className="w-full flex justify-end gap-3 pb-1 shrink-0 pt-2">
          <button
            type="button"
            onClick={handleBack}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 text-xs font-semibold py-3 px-6 rounded-xl flex items-center justify-center transition-all cursor-pointer"
          >
            Back to Edit
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-black hover:bg-gray-800 disabled:bg-gray-600 text-white text-xs font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Launching Workspace...</span>
              </>
            ) : (
              <span>Launch Dashboard 🚀</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
