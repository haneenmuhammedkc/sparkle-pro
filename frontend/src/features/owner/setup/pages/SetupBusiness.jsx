import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Store,
  Sparkles,
  ImagePlus,
  Car,
  Paintbrush,
  Wrench,
  Layers,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import SetupSidebar from '../components/SetupSidebar';
import { useAuth } from '../../../../context/AuthContext';
import * as businessService from '../services/businessService.js';

export default function SetupBusiness({ onContinue, onBack }) {
  const navigate = useNavigate();
  const { user, business, setBusiness } = useAuth();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Header content props
  const headerTitle = "Set Up Your Business";
  const headerDescription =
    "Set your business hours and preferences to get your workshop ready.";

  // Form Field States
  const [businessName, setBusinessName] = useState(business?.name || "");
  const [ownerName, setOwnerName] = useState(business?.ownerName || user?.fullName || "");
  const [email, setEmail] = useState(business?.email || user?.email || "");
  const [mobileNumber, setMobileNumber] = useState(business?.mobileNumber || "");
  const [whatsappNumber, setWhatsappNumber] = useState(business?.whatsappNumber || "");
  const [businessType, setBusinessType] = useState(business?.businessType || "car-wash");

  // Logo Upload & Error State
  const [logoPreview, setLogoPreview] = useState(business?.logo || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (business) {
      if (business.name) setBusinessName(business.name);
      if (business.ownerName) setOwnerName(business.ownerName);
      if (business.email) setEmail(business.email);
      if (business.mobileNumber) setMobileNumber(business.mobileNumber);
      if (business.whatsappNumber) setWhatsappNumber(business.whatsappNumber);
      if (business.businessType) setBusinessType(business.businessType);
      if (business.logo) setLogoPreview(business.logo);
    } else if (user) {
      if (user.fullName) setOwnerName(user.fullName);
      if (user.email) setEmail(user.email);
    }
  }, [user, business]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Logo file size must be less than 2MB.");
        return;
      }
      setErrorMessage("");
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/welcome');
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
    setIsLoading(true);

    try {
      const payload = {
        businessName,
        ownerName,
        email,
        mobileNumber,
        whatsappNumber,
        businessType,
        logoPreview,
      };

      const res = await businessService.saveStep1BusinessInfo(payload);
      if (res && res.success && res.data) {
        setBusiness(res.data);
        if (onContinue) {
          onContinue(payload);
        } else {
          navigate("/setup/detail");
        }
      } else {
        const msg = res?.message || "Failed to save business details to database.";
        setErrorMessage(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save business details. Please check your backend connection.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#F8F9FB] text-[#111827] font-sans flex flex-col justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-12 lg:py-6 relative select-none lg:overflow-hidden">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/png, image/jpeg"
        className="hidden"
      />

      {/* =========================================================================
          1. MOBILE VIEW (< 768px / md)
         ========================================================================= */}
      <div className="md:hidden w-full max-w-md mx-auto flex-1 flex flex-col pb-20">
        {/* Reusable Wizard Header */}
        <SetupSidebar
          currentStep={currentStep}
          totalSteps={totalSteps}
          title={headerTitle}
          description="Let's configure your workshop in just a few simple steps."
          onBack={handleBack}
          onStepClick={handleStepClick}
        />

        {/* Card 1: Business Details */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 mb-6 shadow-xs space-y-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-full bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200/60 transition cursor-pointer overflow-hidden relative group shrink-0"
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 mb-0.5 text-gray-500" />
                  <span className="text-[10px] font-medium text-gray-500">
                    Logo
                  </span>
                </>
              )}
            </button>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Business Details
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Basic information
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Elite Auto Care"
                className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Owner Name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Workshop Type */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">Workshop Type</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setBusinessType("car-wash")}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 bg-white transition cursor-pointer ${
                businessType === "car-wash"
                  ? "border-gray-900 ring-1 ring-gray-900 shadow-xs"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Car className="w-5 h-5 text-gray-900" />
              <span className="text-xs font-semibold text-gray-900">
                Car Wash
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBusinessType("detailing")}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 bg-white transition cursor-pointer ${
                businessType === "detailing"
                  ? "border-gray-900 ring-1 ring-gray-900 shadow-xs"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Paintbrush className="w-5 h-5 text-gray-900" />
              <span className="text-xs font-semibold text-gray-900">
                Car Detailing
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBusinessType("service-center")}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 bg-white transition cursor-pointer ${
                businessType === "service-center"
                  ? "border-gray-900 ring-1 ring-gray-900 shadow-xs"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Wrench className="w-5 h-5 text-gray-900" />
              <span className="text-xs font-semibold text-gray-900">
                Service Center
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBusinessType("multi-service")}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 bg-white transition cursor-pointer ${
                businessType === "multi-service"
                  ? "border-gray-900 ring-1 ring-gray-900 shadow-xs"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Layers className="w-5 h-5 text-gray-900" />
              <span className="text-xs font-semibold text-gray-900">
                Multi-Service
              </span>
            </button>
          </div>
        </div>

        {/* Floating Button */}
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
        {/* Reusable Wizard Header */}
        <SetupSidebar
          currentStep={currentStep}
          totalSteps={totalSteps}
          title={headerTitle}
          description={headerDescription}
          onBack={handleBack}
          onStepClick={handleStepClick}
        />

        {/* Form Stack */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information Card */}
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center gap-2.5 text-gray-900 font-semibold text-base">
              <Store className="w-5 h-5 text-gray-800" />
              <h2>Business Information</h2>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-full bg-[#E2E8F0] hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700 relative overflow-hidden group cursor-pointer shrink-0"
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImagePlus className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform" />
                )}
              </button>
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-gray-900">
                  Business Logo
                </h3>
                <p className="text-xs text-gray-500">
                  Recommended size: 512×512px (PNG, JPG)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Sparkle Auto Spa"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Owner Name *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@business.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                />
              </div>
            </div>
          </div>

          {/* Workshop Details Card */}
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-gray-900 font-semibold text-base">
              <Car className="w-5 h-5 text-gray-800" />
              <h2>Workshop Details</h2>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-gray-700">
                Business Type
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setBusinessType("car-wash")}
                  className={`w-32 h-28 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    businessType === "car-wash"
                      ? "bg-[#DBE2EF] border-[#111827] ring-1 ring-[#111827] shadow-xs"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Car className="w-6 h-6 text-gray-900" />
                  <span className="text-xs font-semibold text-gray-900">
                    Car Wash
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBusinessType("detailing")}
                  className={`w-32 h-28 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    businessType === "detailing"
                      ? "bg-[#DBE2EF] border-[#111827] ring-1 ring-[#111827] shadow-xs"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Sparkles className="w-6 h-6 text-gray-900" />
                  <span className="text-xs font-semibold text-gray-900">
                    Detailing
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Action Button */}
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
        <div className="w-full flex flex-col pt-1">
          {/* Top Wizard Steps / Navigation Bar */}
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

            {/* Right Section Form */}
            <div className="col-span-8 space-y-4">
              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                  <Store className="w-4 h-4 text-gray-800" />
                  <h2>Business Information</h2>
                </div>

                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 rounded-full bg-[#E2E8F0] hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700 relative overflow-hidden group cursor-pointer shrink-0"
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-semibold text-gray-900">
                      Business Logo
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Recommended size: 512×512px (PNG, JPG)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Sparkle Auto Spa"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@business.com"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                  <Car className="w-4 h-4 text-gray-800" />
                  <h2>Workshop Details</h2>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-gray-700">
                    Business Type
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBusinessType("car-wash")}
                      className={`w-28 h-24 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                        businessType === "car-wash"
                          ? "bg-[#DBE2EF] border-[#111827] ring-1 ring-[#111827] shadow-xs"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Car className="w-5 h-5 text-gray-900" />
                      <span className="text-xs font-semibold text-gray-900">
                        Car Wash
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBusinessType("detailing")}
                      className={`w-28 h-24 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                        businessType === "detailing"
                          ? "bg-[#DBE2EF] border-[#111827] ring-1 ring-[#111827] shadow-xs"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Sparkles className="w-5 h-5 text-gray-900" />
                      <span className="text-xs font-semibold text-gray-900">
                        Detailing
                      </span>
                    </button>
                  </div>
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