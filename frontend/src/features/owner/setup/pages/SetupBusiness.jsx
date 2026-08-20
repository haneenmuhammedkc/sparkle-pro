import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  ImagePlus,
  Car,
  Paintbrush,
  Wrench,
  SlidersHorizontal,
} from "lucide-react";
import SetupLayout from "../components/SetupLayout";
import { useAuth } from "../../../../context/AuthContext";
import * as businessService from "../services/businessService.js";

const PREDEFINED_TYPES = ["car-wash", "detailing", "service-center"];

export default function SetupBusiness({ onContinue, onBack }) {
  const navigate = useNavigate();
  const { user, business, setBusiness } = useAuth();

  // Wizard Step State
  const [currentStep] = useState(1);
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

  // Business Type State (Predefined vs Custom)
  const [businessType, setBusinessType] = useState(() => {
    const initialType = business?.businessType || "car-wash";
    if (PREDEFINED_TYPES.includes(initialType)) {
      return initialType;
    }
    return "custom";
  });

  const [customBusinessType, setCustomBusinessType] = useState(() => {
    const initialType = business?.businessType || "";
    if (!PREDEFINED_TYPES.includes(initialType) && initialType !== "multi-service") {
      return initialType;
    }
    return "";
  });

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
      if (business.logo) setLogoPreview(business.logo);

      if (business.businessType) {
        if (PREDEFINED_TYPES.includes(business.businessType)) {
          setBusinessType(business.businessType);
        } else {
          setBusinessType("custom");
          if (business.businessType !== "multi-service") {
            setCustomBusinessType(business.businessType);
          }
        }
      }
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

    let finalBusinessType = businessType;

    if (businessType === "custom") {
      const trimmedCustom = customBusinessType.trim();
      if (!trimmedCustom) {
        setErrorMessage("Please enter your business type.");
        return;
      }
      if (trimmedCustom.length > 80) {
        setErrorMessage("Custom business type must be 80 characters or less.");
        return;
      }
      finalBusinessType = trimmedCustom;
    }

    setIsLoading(true);

    try {
      const payload = {
        businessName: businessName.trim(),
        ownerName: ownerName ? ownerName.trim() : "",
        email: email.trim(),
        mobileNumber: mobileNumber ? mobileNumber.trim() : "",
        whatsappNumber: whatsappNumber ? whatsappNumber.trim() : "",
        businessType: finalBusinessType,
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
      const serverErrors = err.response?.data?.errors;
      let msg = "";
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        msg = serverErrors.map((e) => e.message).join(", ");
      } else {
        msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to save business details. Please check your backend connection.";
      }
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
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/png, image/jpeg"
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Card 1: Business Information */}
        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base sm:text-lg">
            <Store className="w-5 h-5 text-gray-800" />
            <h2>Business Information</h2>
          </div>

          {/* Logo Upload Row */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E2E8F0] hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700 relative overflow-hidden group cursor-pointer shrink-0"
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
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                Business Logo
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500">
                Recommended size: 512×512px (PNG, JPG, max 2MB)
              </p>
            </div>
          </div>

          {/* Input Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Business Name */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Sparkle Auto Spa"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-2xs"
              />
            </div>

            {/* Owner Name */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Owner Name *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-2xs"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-2xs"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-2xs"
              />
            </div>

            {/* WhatsApp Number (Present on ALL breakpoints!) */}
            <div className="space-y-1 md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-gray-700">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Workshop Details */}
        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base sm:text-lg">
            <Car className="w-5 h-5 text-gray-800" />
            <h2>Workshop Details</h2>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-700">
              Business Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setBusinessType("car-wash")}
                className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  businessType === "car-wash"
                    ? "bg-[#DBE2EF] border-[#111827] ring-1 ring-[#111827] shadow-xs"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                <span className="text-xs font-semibold text-gray-900">
                  Car Wash
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBusinessType("detailing")}
                className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  businessType === "detailing"
                    ? "bg-[#DBE2EF] border-[#111827] ring-1 ring-[#111827] shadow-xs"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <Paintbrush className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                <span className="text-xs font-semibold text-gray-900">
                  Detailing
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBusinessType("service-center")}
                className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  businessType === "service-center"
                    ? "bg-[#DBE2EF] border-[#111827] ring-1 ring-[#111827] shadow-xs"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                <span className="text-xs font-semibold text-gray-900">
                  Service Center
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBusinessType("custom")}
                className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  businessType === "custom"
                    ? "bg-[#DBE2EF] border-[#111827] ring-1 ring-[#111827] shadow-xs"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                <span className="text-xs font-semibold text-gray-900">
                  Custom
                </span>
              </button>
            </div>

            {/* Custom Business Type Input Field */}
            {businessType === "custom" && (
              <div className="space-y-1 pt-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Custom Business Type *
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={customBusinessType}
                  onChange={(e) => setCustomBusinessType(e.target.value)}
                  placeholder="e.g. Auto Repair & Body Shop"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-2xs"
                />
              </div>
            )}
          </div>
        </div>
      </form>
    </SetupLayout>
  );
}
