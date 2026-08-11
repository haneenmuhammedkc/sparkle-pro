import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Phone, ArrowRight, HelpCircle, X, ShieldCheck, Clock, Sparkles } from 'lucide-react';

const TrackVehicle = () => {
  const navigate = useNavigate();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryNum = vehicleNumber.trim() ? vehicleNumber.trim().toUpperCase() : 'KL 11 AB 1234';
    navigate(`/track/details?veh=${encodeURIComponent(queryNum)}`);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#fafafa] flex flex-col justify-between p-4 sm:p-6 lg:p-8 lg:overflow-hidden antialiased selection:bg-blue-100 selection:text-blue-700">
      
      {/* OPTIONAL TOP BRAND / NAV BAR FOR DESKTOP */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white font-black text-lg">
            S
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">SparklePro</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Vehicle Tracking Service
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="w-full max-w-5xl mx-auto my-auto py-4 sm:py-6 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* DESKTOP & TABLET LEFT HERO PANEL (Hidden on small mobile screens to keep exact mobile design intact) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden lg:block lg:col-span-6 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#3b5bfd] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Service Portal</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-gray-900 tracking-tight leading-[1.15]">
              Track Your Vehicle Service in Real Time
            </h1>

            <p className="text-gray-600 text-base leading-relaxed max-w-md">
              Stay updated on every wash, detail, and quality check step. Receive accurate delivery estimates directly to your screen.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 max-w-md">
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <Clock className="w-4 h-4 text-[#3b5bfd]" />
                  <span>Live ETA</span>
                </div>
                <p className="text-xs text-gray-500">Instant estimated delivery time</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Staff</span>
                </div>
                <p className="text-xs text-gray-500">Assigned specialist updates</p>
              </div>
            </div>
          </motion.div>

          {/* MAIN TRACKING CARD (Centered on Mobile & Tab, Right column on Desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full lg:col-span-6 max-w-md mx-auto"
          >
            {/* MAIN CARD CONTAINER */}
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              
              {/* TOP BADGE ICON */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[#e8edff] flex items-center justify-center text-[#3b5bfd] relative">
                  <div className="relative">
                    <Car className="w-8 h-8" />
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[#3b5bfd]">
                      <span className="w-1 h-1.5 bg-[#3b5bfd] rounded-full"></span>
                      <span className="w-1 h-2 bg-[#3b5bfd] rounded-full -mt-0.5"></span>
                      <span className="w-1 h-1.5 bg-[#3b5bfd] rounded-full"></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* HEADING & DESCRIPTION */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Track Your Vehicle
                </h2>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed px-2">
                  Enter your vehicle number and mobile number to check your vehicle's live service status.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {/* Vehicle Number Input */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="vehicleNumber" className="block text-xs sm:text-sm font-semibold text-gray-800">
                    Vehicle Number
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                      <Car className="w-5 h-5" />
                    </div>
                    <input
                      id="vehicleNumber"
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="e.g. ABC 1234"
                      className="w-full bg-white border border-gray-300 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="phoneNumber" className="block text-xs sm:text-sm font-semibold text-gray-800">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +1 (555) 000-0000"
                      className="w-full bg-white border border-gray-300 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-medium"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold rounded-2xl py-4 px-4 flex items-center justify-center gap-2 text-base transition-all shadow-sm active:scale-[0.99] cursor-pointer mt-2"
                >
                  <span>Track Vehicle</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* BOTTOM HELP LINK */}
            <div className="text-center mt-4 sm:mt-6">
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-gray-500 hover:text-gray-800 text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-1.5"
              >
                Need help finding your vehicle number?
              </button>
            </div>
          </motion.div>

        </div>
      </main>

      {/* FOOTER FOR DESKTOP */}
      <footer className="w-full max-w-6xl mx-auto text-center py-2 shrink-0">
        <p className="text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} SparklePro Car Wash & Detailing. All rights reserved.
        </p>
      </footer>

      {/* HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>Finding Vehicle Number</span>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your vehicle registration number can be found on your vehicle's license plate or on your service receipt provided during vehicle drop-off.
            </p>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TrackVehicle;
