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
  return (
    <>
      {/* =========================================================================
          1. MOBILE HEADER (< 768px / md)
         ========================================================================= */}
      <div className="md:hidden w-full">
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => onStepClick && onStepClick(step)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  step === currentStep ? 'w-7 bg-black' : 'w-7 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <span className="text-xs font-semibold text-gray-800">
            {currentStep} of {totalSteps}
          </span>
        </div>

        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
            {title}
          </h1>
          {description && (
            <p className="text-xs text-gray-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. TABLET / IPAD HEADER (768px to 1023px / md to lg)
         ========================================================================= */}
      <div className="hidden md:block lg:hidden w-full">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="text-sm font-medium text-gray-500">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onStepClick && onStepClick(step)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                step <= currentStep
                  ? 'w-14 bg-[#111827]'
                  : 'w-14 bg-gray-200 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* =========================================================================
          3. DESKTOP HEADER (≥ 1024px / lg)
         ========================================================================= */}
      <div className="hidden lg:block w-full">
        <div className="flex items-center gap-6 mb-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-gray-500">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        <div className="flex items-center gap-2.5 mb-5 max-w-xs">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onStepClick && onStepClick(step)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                step <= currentStep
                  ? 'w-10 bg-[#111827]'
                  : 'w-10 bg-gray-200 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}