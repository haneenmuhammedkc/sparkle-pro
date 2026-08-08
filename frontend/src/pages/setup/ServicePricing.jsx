import React, { useState } from "react";
import { ArrowRight, Clock, Edit2, Plus, Check, Droplet, ClipboardList } from "lucide-react";
import Sidebar from "../../components/setup/Sidebar";

export default function ServicesPricing({ onContinue, onBack }) {
  const [currentStep, setCurrentStep] = useState(3);
  const totalSteps = 4;

  const headerTitle = "Services & Pricing";
  const headerDescription =
    "Set your business hours and preferences to get ready for your workshop.";

  const [exteriorWashEnabled, setExteriorWashEnabled] = useState(true);
  const [deepDetailingEnabled, setDeepDetailingEnabled] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Car");

  const categories = ["Bike", "Car", "SUV", "Van"];

  const categoryPricingData = {
    Bike: [
      { name: "Basic Wash", price: "₹199" },
      { name: "Quick Foam Polish", price: "₹299" },
    ],
    Car: [
      { name: "Basic Wash", price: "₹499" },
      { name: "Interior Sanitization", price: "₹599" },
      { name: "Exterior Wash (Configured above)", price: "₹299" },
    ],
    SUV: [
      { name: "Heavy SUV Wash", price: "₹699" },
      { name: "Complete Detailing Package", price: "₹1,299" },
    ],
    Van: [
      { name: "Commercial Van Wash", price: "₹899" },
      { name: "Deep Interior Cleaning", price: "₹1,199" },
    ],
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (onContinue) {
      onContinue({
        exteriorWashEnabled,
        deepDetailingEnabled,
        selectedCategory,
      });
    } else {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#F8F9FB] text-[#111827] font-sans flex flex-col justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-12 lg:py-6 relative select-none lg:overflow-hidden">
      
      {/* =========================================================================
          1. MOBILE VIEW (< 768px / md)
         ========================================================================= */}
      <div className="md:hidden w-full max-w-md mx-auto flex-1 flex flex-col pb-20">
        <Sidebar
          currentStep={currentStep}
          totalSteps={totalSteps}
          title={headerTitle}
          description={headerDescription}
          onBack={onBack}
          onStepClick={(step) => setCurrentStep(step)}
        />

        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900 pt-1">Service Menu</h2>

          {/* Service Card 1 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E2E8F0]/60 flex items-center justify-center text-gray-800">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Exterior Wash</h3>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> 45 mins
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExteriorWashEnabled(!exteriorWashEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  exteriorWashEnabled ? "bg-black" : "bg-gray-300"
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 flex items-center justify-center ${
                    exteriorWashEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  {exteriorWashEnabled && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </span>
              </button>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900">Starting from ₹299</span>
              <button type="button" className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 hover:opacity-75 cursor-pointer">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>

          {/* Service Card 2 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3E8FF] flex items-center justify-center text-purple-700">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Deep Detailing</h3>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> 120 mins
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeepDetailingEnabled(!deepDetailingEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  deepDetailingEnabled ? "bg-black" : "bg-gray-300"
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 flex items-center justify-center ${
                    deepDetailingEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  {deepDetailingEnabled && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </span>
              </button>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900">Starting from ₹1,499</span>
              <button type="button" className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 hover:opacity-75 cursor-pointer">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>

          {/* Add Custom Service Button */}
          <button
            type="button"
            className="w-full border border-dashed border-gray-300 hover:border-gray-400 bg-white rounded-2xl py-3.5 text-xs font-semibold text-gray-900 flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Custom Service
          </button>

          {/* Category Pricing Section */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-gray-900">Category Pricing</h2>

            {/* Category Toggle Tabs */}
            <div className="bg-gray-100/80 p-1 rounded-2xl grid grid-cols-4 gap-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer text-center ${
                      isSelected
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Pricing Table Card */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-2 px-4 py-3 bg-[#F8F9FA] border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Service</span>
                <span className="text-right">Price</span>
              </div>
              <div className="divide-y divide-gray-100">
                {categoryPricingData[selectedCategory].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-2 px-4 py-3 text-xs font-semibold text-gray-900 items-center">
                    <span>{item.name}</span>
                    <span className="text-right">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Floating Button */}
        <div className="fixed bottom-4 left-4 right-4 z-20 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-black hover:bg-gray-800 text-white text-xs font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center shadow-lg active:scale-98 transition-all cursor-pointer gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. TABLET / IPAD VIEW (768px to 1023px / md to lg)
         ========================================================================= */}
      <div className="hidden md:flex lg:hidden w-full max-w-xl mx-auto flex-1 flex-col justify-between py-2">
        <Sidebar
          currentStep={currentStep}
          totalSteps={totalSteps}
          title={headerTitle}
          description={headerDescription}
          onBack={onBack}
          onStepClick={(step) => setCurrentStep(step)}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-base font-semibold text-gray-900">Service Menu</h2>

          {/* Service Card 1 */}
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E2E8F0]/60 flex items-center justify-center text-gray-800">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Exterior Wash</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> 45 mins
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExteriorWashEnabled(!exteriorWashEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  exteriorWashEnabled ? "bg-black" : "bg-gray-300"
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 flex items-center justify-center ${
                    exteriorWashEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  {exteriorWashEnabled && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </span>
              </button>
            </div>

            <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900">Starting from ₹299</span>
              <button type="button" className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 hover:opacity-75 cursor-pointer">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>

          {/* Service Card 2 */}
          <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3E8FF] flex items-center justify-center text-purple-700">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Deep Detailing</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> 120 mins
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeepDetailingEnabled(!deepDetailingEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  deepDetailingEnabled ? "bg-black" : "bg-gray-300"
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 flex items-center justify-center ${
                    deepDetailingEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  {deepDetailingEnabled && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </span>
              </button>
            </div>

            <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900">Starting from ₹1,499</span>
              <button type="button" className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 hover:opacity-75 cursor-pointer">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>

          {/* Add Custom Service Button */}
          <button
            type="button"
            className="w-full border border-dashed border-gray-300 hover:border-gray-400 bg-white rounded-2xl py-3.5 text-xs font-semibold text-gray-900 flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Custom Service
          </button>

          {/* Category Pricing Section */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-semibold text-gray-900">Category Pricing</h2>

            <div className="bg-gray-100/80 p-1 rounded-2xl grid grid-cols-4 gap-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer text-center ${
                      isSelected
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-2 px-6 py-3 bg-[#F8F9FA] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>Service</span>
                <span className="text-right">Price</span>
              </div>
              <div className="divide-y divide-gray-100">
                {categoryPricingData[selectedCategory].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-2 px-6 py-3.5 text-xs font-semibold text-gray-900 items-center">
                    <span>{item.name}</span>
                    <span className="text-right">{item.price}</span>
                  </div>
                ))}
              </div>
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
        <div className="w-full flex flex-col pt-1">
          <Sidebar
            currentStep={currentStep}
            totalSteps={totalSteps}
            title={headerTitle}
            description={headerDescription}
            onBack={onBack}
            onStepClick={(step) => setCurrentStep(step)}
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

            {/* Right Section Form Stack with Custom Scrollbar */}
            <div className="col-span-8 max-h-[calc(100vh-170px)] overflow-y-auto pr-2 mb-[10px] space-y-4">

              {/* Service Card 1 */}
              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E2E8F0]/60 flex items-center justify-center text-gray-800">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">Exterior Wash</h3>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> 45 mins
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExteriorWashEnabled(!exteriorWashEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      exteriorWashEnabled ? "bg-black" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 flex items-center justify-center ${
                        exteriorWashEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    >
                      {exteriorWashEnabled && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                    </span>
                  </button>
                </div>

                <div className="pt-2.5 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900">Starting from ₹299</span>
                  <button type="button" className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 hover:opacity-75 cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>

              {/* Service Card 2 */}
              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F3E8FF] flex items-center justify-center text-purple-700">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">Deep Detailing</h3>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> 120 mins
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeepDetailingEnabled(!deepDetailingEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      deepDetailingEnabled ? "bg-black" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 left-0.5 flex items-center justify-center ${
                        deepDetailingEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    >
                      {deepDetailingEnabled && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                    </span>
                  </button>
                </div>

                <div className="pt-2.5 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900">Starting from ₹1,499</span>
                  <button type="button" className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 hover:opacity-75 cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>

              {/* Add Custom Service Button */}
              <button
                type="button"
                className="w-full border border-dashed border-gray-300 hover:border-gray-400 bg-white rounded-2xl py-3 text-xs font-semibold text-gray-900 flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Custom Service
              </button>

              {/* Category Pricing Section */}
              <div className="space-y-3.5 pt-2">
                <h2 className="text-sm font-semibold text-gray-900">Category Pricing</h2>

                <div className="bg-gray-100/80 p-1 rounded-2xl grid grid-cols-4 gap-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer text-center ${
                          isSelected
                            ? "bg-white text-gray-900 shadow-xs"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs">
                  <div className="grid grid-cols-2 px-5 py-2.5 bg-[#F8F9FA] border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Service</span>
                    <span className="text-right">Price</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {categoryPricingData[selectedCategory].map((item, idx) => (
                      <div key={idx} className="grid grid-cols-2 px-5 py-3 text-xs font-medium text-gray-900 items-center">
                        <span>{item.name}</span>
                        <span className="text-right font-bold">{item.price}</span>
                      </div>
                    ))}
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