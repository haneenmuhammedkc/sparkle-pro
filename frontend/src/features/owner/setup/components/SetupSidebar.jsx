import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function Sidebar({
  currentStep = 1,
  totalSteps = 4,
  title = '',
  description = '',
  onBack,
  onStepClick,
}) {
  const handleStepClick = (step) => {
    if (step <= currentStep && onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <div className="w-full shrink-0">
      {/* Top Header Navigation Bar */}
      <div className="flex items-center justify-between lg:justify-start lg:gap-6 mb-2 sm:mb-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
        </button>

        {/* Progress Bar Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => handleStepClick(step)}
              disabled={step > currentStep}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step <= currentStep
                  ? 'w-7 sm:w-10 bg-[#111827] cursor-pointer'
                  : 'w-7 sm:w-10 bg-gray-200 cursor-not-allowed'
              }`}
            />
          ))}
        </div>

        <span className="text-xs font-semibold text-gray-600 sm:text-gray-500">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Title & Description for Mobile & Tablet (hidden on desktop lg:block where it appears in the 2-column grid) */}
      <div className="lg:hidden mt-3 mb-2 space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}