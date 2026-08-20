import React from "react";
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import SetupSidebar from "./SetupSidebar";

export default function SetupLayout({
  currentStep = 1,
  totalSteps = 4,
  title = "",
  description = "",
  onBack,
  onStepClick,
  onContinue,
  continueText = "Continue",
  isLoading = false,
  isContinueDisabled = false,
  errorMessage = "",
  showNavigation = true,
  children,
}) {
  return (
    <div className="min-h-screen lg:h-screen bg-[#F8F9FB] text-[#111827] font-sans flex flex-col justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-12 lg:py-5 relative select-none lg:overflow-hidden">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        {/* Consistent Top Wizard Progress Header */}
        <SetupSidebar
          currentStep={currentStep}
          totalSteps={totalSteps}
          title={title}
          description={description}
          onBack={onBack}
          onStepClick={onStepClick}
        />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs sm:text-sm font-semibold shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Responsive Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-start flex-1 min-h-0">
          {/* Desktop Left Column: Title & Description */}
          <div className="hidden lg:block lg:col-span-4 space-y-2 pr-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
                {description}
              </p>
            )}
          </div>

          {/* Right Column: Page-Specific Content Cards */}
          <div className="lg:col-span-8 space-y-4 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto pr-0 lg:pr-1">
            {children}
          </div>
        </div>

        {/* Consistent Bottom Navigation Footer */}
        {showNavigation && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200/80 bg-[#F8F9FB] shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold py-2.5 px-4 sm:px-5 rounded-xl flex items-center gap-2 transition-all shadow-2xs active:scale-98 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={onContinue}
              disabled={isLoading || isContinueDisabled}
              className="bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-semibold py-2.5 px-6 sm:px-7 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>{continueText}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
