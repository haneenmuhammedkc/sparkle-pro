import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Edit2, Plus, Check, Loader2, AlertCircle } from "lucide-react";
import SetupLayout from "../components/SetupLayout";
import { useAuth } from "../../../../context/AuthContext";
import * as businessService from "../services/businessService.js";

export default function ServicesPricing({ onContinue, onBack }) {
  const navigate = useNavigate();
  const { business, setBusiness, fetchBusinessData } = useAuth();

  const [currentStep] = useState(3);
  const totalSteps = 4;

  const headerTitle = "Services & Pricing";
  const headerDescription =
    "Set your business hours and preferences to get ready for your workshop.";

  const [selectedCategory, setSelectedCategory] = useState("Car");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [services, setServices] = useState(() => {
    if (business?.servicesConfigured && Array.isArray(business.servicesConfigured)) {
      return business.servicesConfigured;
    }
    return [];
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
      business?.servicesConfigured && Array.isArray(business.servicesConfigured)
        ? business.servicesConfigured
        : [];

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
      setErrorMessage("Service name is required.");
      return;
    }
    if (!newServicePrice.trim()) {
      setErrorMessage("Service price is required.");
      return;
    }

    const priceFormatted =
      newServicePrice.trim().startsWith("₹") || newServicePrice.trim().startsWith("$")
        ? newServicePrice.trim()
        : `₹${newServicePrice.trim()}`;

    const newServiceObj = {
      id: `custom_${Date.now()}`,
      name: newServiceName.trim(),
      category: newServiceCategory,
      duration: newServiceDuration,
      startingPrice: priceFormatted,
      price: priceFormatted,
      enabled: true,
      description: "Custom workshop service",
    };

    setServices((prev) => [...prev, newServiceObj]);
    setNewServiceName("");
    setNewServicePrice("");
    setIsAddModalOpen(false);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const payload = {
        selectedCategory,
        categoryPricing: categoryPricingData,
        servicesConfigured: services,
      };

      const res = await businessService.saveStep3Services(payload);
      if (res && res.success && res.data) {
        setBusiness(res.data);
        if (onContinue) {
          onContinue(payload);
        } else {
          navigate('/setup/review');
        }
      } else {
        const msg = res?.message || "Failed to save services & pricing details.";
        setErrorMessage(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save services. Please check your backend connection.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderServiceCard = (service) => (
    <div
      key={service.id || service.name}
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
        service.enabled
          ? "bg-white border-gray-200 shadow-2xs"
          : "bg-gray-50/70 border-gray-200/60 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
              {service.name}
            </h3>
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {service.category || "Car"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              {service.duration || service.time || "45 mins"}
            </span>
            <span className="font-bold text-gray-900">
              {service.startingPrice || service.price || "₹299"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenEditModal(service)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
            title="Edit Service"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => toggleService(service.id || service.name)}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
              service.enabled
                ? "bg-black border-black text-white"
                : "bg-white border-gray-300 text-transparent"
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );

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
        {/* Category Tabs */}
        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Vehicle Category</h2>
            <span className="text-xs text-gray-500 font-medium">
              {filteredServices.filter((s) => s.enabled).length} Enabled
            </span>
          </div>

          <div className="flex bg-[#F1F3F5] p-1 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => renderServiceCard(service))
            ) : (
              <div className="col-span-1 sm:col-span-2 p-5 text-center text-xs text-gray-500 font-medium italic bg-[#F9FAFB] border border-gray-200 rounded-2xl">
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
            className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-gray-800" /> Add Custom Service
          </button>
        </div>
      </form>

      {/* Add Custom Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Add Custom Service</h3>
            <form onSubmit={handleAddCustomService} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">Service Name *</label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. Ceramic Coating Spa"
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Category</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Duration</label>
                  <input
                    type="text"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    placeholder="e.g. 60 mins"
                    className="w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">Starting Price *</label>
                <input
                  type="text"
                  required
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder="e.g. ₹499"
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-black text-white rounded-xl hover:bg-gray-800 transition"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Edit Service</h3>
            <form onSubmit={handleSaveEditedService} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">Service Name *</label>
                <input
                  type="text"
                  required
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Category</label>
                  <select
                    value={editServiceCategory}
                    onChange={(e) => setEditServiceCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Duration</label>
                  <input
                    type="text"
                    value={editServiceDuration}
                    onChange={(e) => setEditServiceDuration(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">Starting Price *</label>
                <input
                  type="text"
                  required
                  value={editServicePrice}
                  onChange={(e) => setEditServicePrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-black text-white rounded-xl hover:bg-gray-800 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SetupLayout>
  );
}