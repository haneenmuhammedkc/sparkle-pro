import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Edit2, Plus, Check, Droplet, ClipboardList, Loader2, AlertCircle, Sparkles, Wrench } from "lucide-react";
import SetupSidebar from '../components/SetupSidebar';
import { useAuth } from '../../../../context/AuthContext';
import * as businessService from '../services/businessService.js';

const DEFAULT_SERVICES = [
  {
    id: "ext-wash",
    name: "Exterior Wash",
    category: "Car",
    duration: "45 mins",
    time: "45 mins",
    startingPrice: "₹299",
    price: "₹299",
    enabled: true,
    isCustom: false,
  },
  {
    id: "deep-detail",
    name: "Deep Detailing",
    category: "Car",
    duration: "120 mins",
    time: "120 mins",
    startingPrice: "₹1,499",
    price: "₹1,499",
    enabled: true,
    isCustom: false,
  },
  {
    id: "bike-wash",
    name: "Basic Bike Wash",
    category: "Bike",
    duration: "30 mins",
    time: "30 mins",
    startingPrice: "₹199",
    price: "₹199",
    enabled: true,
    isCustom: false,
  },
  {
    id: "suv-wash",
    name: "Heavy SUV Wash",
    category: "SUV",
    duration: "60 mins",
    time: "60 mins",
    startingPrice: "₹499",
    price: "₹499",
    enabled: true,
    isCustom: false,
  },
  {
    id: "van-wash",
    name: "Commercial Van Wash",
    category: "Van",
    duration: "90 mins",
    time: "90 mins",
    startingPrice: "₹799",
    price: "₹799",
    enabled: true,
    isCustom: false,
  },
];

export default function ServicesPricing({ onContinue, onBack }) {
  const navigate = useNavigate();
  const { business, setBusiness, fetchBusinessData } = useAuth();

  const [currentStep, setCurrentStep] = useState(3);
  const totalSteps = 4;

  const headerTitle = "Services & Pricing";
  const headerDescription =
    "Set your business hours and preferences to get ready for your workshop.";

  const [selectedCategory, setSelectedCategory] = useState("Car");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [services, setServices] = useState(() => {
    if (business?.servicesConfigured && Array.isArray(business.servicesConfigured) && business.servicesConfigured.length > 0) {
      return business.servicesConfigured;
    }
    return DEFAULT_SERVICES;
  });

  useEffect(() => {
    if (business?.servicesConfigured && Array.isArray(business.servicesConfigured) && business.servicesConfigured.length > 0) {
      setServices(business.servicesConfigured);
    }
  }, [business]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("Car");
  const [newServiceDuration, setNewServiceDuration] = useState("45 mins");
  const [newServicePrice, setNewServicePrice] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServiceCategory, setEditServiceCategory] = useState("Car");
  const [editServiceDuration, setEditServiceDuration] = useState("45 mins");
  const [editServicePrice, setEditServicePrice] = useState("");

  const categories = ["Bike", "Car", "SUV", "Van"];

  // Filter services by the active category tab
  const filteredServices = services.filter(
    (s) => (s.category || "Car") === selectedCategory
  );

  const [categoryPricingData, setCategoryPricingData] = useState(() => {
    if (business?.categoryPricing && typeof business.categoryPricing === "object" && Object.keys(business.categoryPricing).length > 0) {
      return business.categoryPricing;
    }
    const initial = { Bike: [], Car: [], SUV: [], Van: [] };
    const initialServices =
      business?.servicesConfigured && Array.isArray(business.servicesConfigured) && business.servicesConfigured.length > 0
        ? business.servicesConfigured
        : DEFAULT_SERVICES;

    categories.forEach((cat) => {
      initial[cat] = initialServices
        .filter((s) => (s.category || "Car") === cat && s.enabled !== false)
        .map((s) => ({
          name: s.name,
          price: s.startingPrice || s.price || "₹299",
        }));
    });
    return initial;
  });

  // Re-synchronize categoryPricingData automatically whenever services array changes
  useEffect(() => {
    const updated = { Bike: [], Car: [], SUV: [], Van: [] };
    categories.forEach((cat) => {
      updated[cat] = services
        .filter((s) => (s.category || "Car") === cat && s.enabled !== false)
        .map((s) => ({
          name: s.name,
          price: s.startingPrice || s.price || "₹299",
        }));
    });
    setCategoryPricingData(updated);
  }, [services]);

  useEffect(() => {
    const verifyAndLoad = async () => {
      let currentBiz = business;
      if (!currentBiz) {
        currentBiz = await fetchBusinessData();
      }
      if (!currentBiz) {
        navigate('/setup/business', { replace: true });
      }
    };
    verifyAndLoad();
  }, [business]);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/setup/detail');
  };

  const handleStepClick = (step) => {
    if (step === 1) navigate('/setup/business');
    else if (step === 2) navigate('/setup/detail');
    else if (step === 3) navigate('/setup/service');
    else if (step === 4) navigate('/setup/review');
  };

  const toggleService = (serviceId) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId || s.name === serviceId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setEditServiceName(service.name);
    setEditServiceCategory(service.category || "Car");
    setEditServiceDuration(service.duration || service.time || "45 mins");
    setEditServicePrice(service.startingPrice || service.price || "₹299");
    setIsEditModalOpen(true);
  };

  const handleSaveEditedService = (e) => {
    e?.preventDefault();
    if (!editServiceName.trim()) {
      setErrorMessage("Service name cannot be empty.");
      return;
    }
    if (!editServicePrice.trim()) {
      setErrorMessage("Price cannot be empty.");
      return;
    }

    const priceFormatted =
      editServicePrice.trim().startsWith("₹") || editServicePrice.trim().startsWith("$")
        ? editServicePrice.trim()
        : `₹${editServicePrice.trim()}`;

    const updatedServices = services.map((s) => {
      if ((s.id && s.id === editingService.id) || s.name === editingService.name) {
        return {
          ...s,
          name: editServiceName.trim(),
          category: editServiceCategory,
          duration: editServiceDuration,
          time: editServiceDuration,
          startingPrice: priceFormatted,
          price: priceFormatted,
        };
      }
      return s;
    });

    setServices(updatedServices);
    setIsEditModalOpen(false);
    setEditingService(null);
    setErrorMessage("");
  };

  const handleAddCustomService = (e) => {
    e?.preventDefault();
    if (!newServiceName.trim()) {
      setErrorMessage("Please enter a service name.");
      return;
    }
    if (!newServicePrice.trim()) {
      setErrorMessage("Please enter a starting price.");
      return;
    }

    const priceFormatted =
      newServicePrice.trim().startsWith("₹") || newServicePrice.trim().startsWith("$")
        ? newServicePrice.trim()
        : `₹${newServicePrice.trim()}`;

    const newService = {
      id: `custom-${Date.now()}`,
      name: newServiceName.trim(),
      category: newServiceCategory || selectedCategory,
      duration: newServiceDuration || "45 mins",
      time: newServiceDuration || "45 mins",
      startingPrice: priceFormatted,
      price: priceFormatted,
      enabled: true,
      isCustom: true,
    };

    setServices((prev) => [...prev, newService]);
    setNewServiceName("");
    setNewServicePrice("");
    setErrorMessage("");
    setIsAddModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const payload = {
        exteriorWashEnabled: services.find((s) => s.name === "Exterior Wash")?.enabled ?? true,
        deepDetailingEnabled: services.find((s) => s.name === "Deep Detailing")?.enabled ?? true,
        selectedCategory,
        categoryPricing: categoryPricingData,
        servicesConfigured: services,
      };

      const res = await businessService.saveStep3Services(payload);
      if (res && res.success && res.data) {
        setBusiness(res.data);
        if (onContinue) onContinue();
        else navigate('/setup/review');
      } else {
        const msg = res?.message || "Failed to save services & pricing.";
        setErrorMessage(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save services & pricing.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderServiceCard = (service) => {
    const isWash = service.name.toLowerCase().includes("wash");
    const isDetailing = service.name.toLowerCase().includes("detail");

    return (
      <div
        key={service.id || service.name}
        className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isWash
                  ? "bg-[#E2E8F0]/60 text-gray-800"
                  : isDetailing
                  ? "bg-[#F3E8FF] text-purple-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {isWash ? (
                <Droplet className="w-5 h-5" />
              ) : isDetailing ? (
                <ClipboardList className="w-5 h-5" />
              ) : (
                <Wrench className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-gray-900">{service.name}</h3>
                {service.isCustom && (
                  <span className="px-2 py-0.5 text-[9px] bg-purple-100 text-purple-700 font-bold rounded-md">
                    Custom
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> {service.duration || service.time || "45 mins"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleService(service.id || service.name)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              service.enabled ? "bg-black" : "bg-gray-300"
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 flex items-center justify-center ${
                service.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            >
              {service.enabled && <Check className="w-3 h-3 text-black stroke-[3]" />}
            </span>
          </button>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-900">
            Starting from {service.startingPrice || service.price || "₹299"}
          </span>
          <button
            type="button"
            onClick={() => handleOpenEditModal(service)}
            className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 hover:opacity-75 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#F8F9FB] text-[#111827] font-sans flex flex-col justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-12 lg:py-6 relative select-none lg:overflow-hidden">
      {/* =========================================================================
          1. MOBILE VIEW (< 768px)
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

        <div className="space-y-4">
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-base font-bold text-gray-900">Service Menu</h2>
            <span className="text-xs text-gray-500 font-semibold">
              Category: {selectedCategory}
            </span>
          </div>

          {/* Scrollable Mobile Service Cards Container */}
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => renderServiceCard(service))
            ) : (
              <div className="p-5 text-center text-xs text-gray-500 font-medium italic bg-white border border-gray-100 rounded-2xl">
                No services configured for {selectedCategory} yet.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setNewServiceCategory(selectedCategory);
              setIsAddModalOpen(true);
            }}
            className="w-full py-3.5 border border-dashed border-gray-300 rounded-2xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-gray-800" /> Add Custom Service
          </button>

          <div className="pt-2">
            <h2 className="text-base font-bold text-gray-900 mb-3">Vehicle Categories & Pricing</h2>
            <div className="flex bg-[#E9ECEF]/60 p-1 rounded-xl mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    selectedCategory === cat ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-2 px-4 py-2.5 bg-[#F8F9FA] border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Service</span>
                <span className="text-right">Price</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-[160px] overflow-y-auto">
                {(categoryPricingData[selectedCategory] || []).length > 0 ? (
                  (categoryPricingData[selectedCategory] || []).map((item, idx) => (
                    <div key={idx} className="grid grid-cols-2 px-4 py-3 text-xs font-medium text-gray-900 items-center">
                      <span>{item.name}</span>
                      <span className="text-right font-bold">{item.price}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400 font-medium italic">
                    No services configured for {selectedCategory} yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Mobile Action Bar */}
        <div className="fixed bottom-4 left-4 right-4 z-20 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-600 text-white text-xs font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Services...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. TABLET VIEW (768px - 1023px)
         ========================================================================= */}
      <div className="hidden md:flex lg:hidden w-full max-w-2xl mx-auto flex-1 flex-col justify-between pb-6">
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

        <form onSubmit={handleSubmit} className="space-y-6 flex-1 min-h-0">
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Service Menu ({selectedCategory})</h2>
              <span className="text-xs text-gray-500 font-medium">
                {filteredServices.filter((s) => s.enabled).length} Enabled
              </span>
            </div>
            
            {/* Scrollable Tablet Service Cards Grid */}
            <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => renderServiceCard(service))
              ) : (
                <div className="col-span-2 p-5 text-center text-xs text-gray-500 font-medium italic bg-white border border-gray-100 rounded-2xl">
                  No services configured for {selectedCategory} yet.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setNewServiceCategory(selectedCategory);
                setIsAddModalOpen(true);
              }}
              className="w-full py-3.5 border border-dashed border-gray-300 rounded-2xl text-xs font-bold text-gray-700 hover:bg-white flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gray-800" /> Add Custom Service
            </button>
          </div>

          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900">Vehicle Categories & Pricing</h2>
            <div className="flex bg-[#E9ECEF]/60 p-1 rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    selectedCategory === cat ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-2 px-5 py-2.5 bg-[#F8F9FA] border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Service</span>
                <span className="text-right">Price</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-[180px] overflow-y-auto">
                {(categoryPricingData[selectedCategory] || []).length > 0 ? (
                  (categoryPricingData[selectedCategory] || []).map((item, idx) => (
                    <div key={idx} className="grid grid-cols-2 px-5 py-3 text-xs font-medium text-gray-900 items-center">
                      <span>{item.name}</span>
                      <span className="text-right font-bold">{item.price}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400 font-medium italic">
                    No services configured for {selectedCategory} yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-black hover:bg-gray-800 disabled:bg-gray-600 text-white text-xs font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Services...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. DESKTOP VIEW (>= 1024px)
         ========================================================================= */}
      <div className="hidden lg:flex w-full max-w-6xl mx-auto flex-1 flex-col justify-between overflow-hidden">
        <div className="w-full flex flex-col pt-1 min-h-0 flex-1">
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

          <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-10 items-start mt-2 min-h-0 flex-1 overflow-hidden">
            <div className="col-span-4 space-y-2 pr-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{headerTitle}</h1>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm">{headerDescription}</p>
            </div>

            <div className="col-span-8 space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto pr-2">
              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-900">Service Menu ({selectedCategory})</h2>
                  <span className="text-xs text-gray-500 font-medium">
                    {filteredServices.filter((s) => s.enabled).length} Enabled Services
                  </span>
                </div>

                {/* Scrollable Desktop Service Cards Grid */}
                <div className="grid grid-cols-2 gap-3.5 max-h-[230px] xl:max-h-[280px] overflow-y-auto pr-1">
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => renderServiceCard(service))
                  ) : (
                    <div className="col-span-2 p-5 text-center text-xs text-gray-500 font-medium italic bg-white border border-gray-100 rounded-2xl">
                      No services configured for {selectedCategory} yet.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewServiceCategory(selectedCategory);
                    setIsAddModalOpen(true);
                  }}
                  className="w-full py-3 border border-dashed border-gray-300 rounded-2xl text-xs font-bold text-gray-700 hover:bg-white flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-gray-800" /> Add Custom Service
                </button>
              </div>

              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-900">Vehicle Categories & Pricing</h2>
                  <div className="flex bg-gray-200/60 p-1 rounded-xl">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                          selectedCategory === cat ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs">
                  <div className="grid grid-cols-2 px-5 py-2.5 bg-[#F8F9FA] border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Service</span>
                    <span className="text-right">Price</span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[160px] overflow-y-auto">
                    {(categoryPricingData[selectedCategory] || []).length > 0 ? (
                      (categoryPricingData[selectedCategory] || []).map((item, idx) => (
                        <div key={idx} className="grid grid-cols-2 px-5 py-3 text-xs font-medium text-gray-900 items-center">
                          <span>{item.name}</span>
                          <span className="text-right font-bold">{item.price}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-400 font-medium italic">
                        No services configured for {selectedCategory} yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Permanent Desktop Action Footer */}
        <div className="w-full flex justify-end pb-1 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-black hover:bg-gray-800 disabled:bg-gray-600 text-white text-xs font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Services...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. MODALS (Add Custom Service & Edit Service)
         ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-gray-800" /> Add Custom Service
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomService} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. Engine Bay Wash"
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                  <select
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition cursor-pointer"
                  >
                    <option value="30 mins">30 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                    <option value="90 mins">90 mins</option>
                    <option value="120 mins">120 mins</option>
                    <option value="180 mins">180 mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Starting Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder="e.g. 799"
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-gray-800" /> Edit Service: {editingService.name}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingService(null);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedService} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={editServiceCategory}
                    onChange={(e) => setEditServiceCategory(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                  <select
                    value={editServiceDuration}
                    onChange={(e) => setEditServiceDuration(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition cursor-pointer"
                  >
                    <option value="30 mins">30 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                    <option value="90 mins">90 mins</option>
                    <option value="120 mins">120 mins</option>
                    <option value="180 mins">180 mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Starting Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editServicePrice}
                  onChange={(e) => setEditServicePrice(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingService(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}