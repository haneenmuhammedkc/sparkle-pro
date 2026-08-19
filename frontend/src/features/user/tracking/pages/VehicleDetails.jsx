import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Check,
  Droplet,
  Phone,
  MessageSquare,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Building2,
  Receipt
} from 'lucide-react';
import * as trackingService from '../services/trackingService';

const VehicleDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeParams = useParams();

  const pathToken = routeParams.token || routeParams.id;
  const tokenParam = pathToken || searchParams.get('token');
  const vehParam = searchParams.get('veh');
  const phoneParam = searchParams.get('phone');

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('Updated just now');

  const fetchTrackingInfo = async () => {
    setLoading(true);
    setErrorMessage(null);

    const query = {};
    if (tokenParam) {
      query.token = tokenParam;
    } else if (vehParam) {
      query.plate = vehParam;
      if (phoneParam) query.phone = phoneParam;
    } else {
      setErrorMessage('Tracking link is invalid or unavailable.');
      setLoading(false);
      return;
    }

    try {
      const res = await trackingService.trackVehicle(query);
      if (res.success && res.data) {
        setTrackingData(res.data);
        setLastUpdated(`Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } else {
        setErrorMessage('Vehicle tracking information could not be found.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setErrorMessage('Vehicle tracking information could not be found.');
      } else {
        setErrorMessage(err.message || 'Unable to load tracking information. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingInfo();
  }, [tokenParam, vehParam, phoneParam]);

  // Periodic lightweight live polling interval (every 10s if active)
  useEffect(() => {
    if (!trackingData || trackingData.status === 'Completed' || trackingData.status === 'Cancelled') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const query = tokenParam ? { token: tokenParam } : { plate: vehParam, phone: phoneParam };
        const res = await trackingService.trackVehicle(query);
        if (res.success && res.data) {
          setTrackingData(res.data);
          setLastUpdated(`Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        }
      } catch (err) {
        // Silent poll error handling to prevent UI flicker
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [trackingData, tokenParam, vehParam, phoneParam]);

  const vehiclePlate = trackingData?.vehiclePlate || (vehParam ? vehParam.toUpperCase() : 'UNKNOWN');
  const customerName = trackingData?.customerName || 'Valued Customer';
  const workflowStep = trackingData?.workflowStep || 'Wait';
  const status = trackingData?.status || 'Pending';
  const timelineSteps = trackingData?.timeline || [];
  const servicesList = trackingData?.services || [];
  const assignedStaff = trackingData?.assignedStaff || { name: 'Assigned Specialist', avatar: null };
  const business = trackingData?.business;

  // Extract contact numbers dynamically from MongoDB business object (No hardcoded fallback numbers)
  const rawMobile = business?.mobileNumber ? String(business.mobileNumber).trim() : '';
  const rawWhatsapp = business?.whatsappNumber ? String(business.whatsappNumber).trim() : (rawMobile || '');
  const cleanMobile = rawMobile ? rawMobile.replace(/[^0-9+]/g, '') : '';
  const cleanWhatsapp = rawWhatsapp ? rawWhatsapp.replace(/[^0-9]/g, '') : '';

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#fafafa] flex flex-col p-4 sm:p-6 lg:p-6 antialiased selection:bg-blue-100 selection:text-blue-700 font-sans lg:overflow-hidden justify-between">
      
      {/* HEADER BAR */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-1 sm:py-2 shrink-0 mb-3 sm:mb-4 lg:mb-3">
        <button
          onClick={() => navigate('/user/track')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors bg-white border border-gray-200/90 rounded-full px-3.5 py-1.5 shadow-2xs cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Track another vehicle</span>
        </button>

        <div className="flex items-center gap-2">
          {business?.logo ? (
            <img src={business.logo} alt={business.name} className="w-7 h-7 rounded-lg object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center text-white font-black text-sm">
              S
            </div>
          )}
          <span className="font-bold text-gray-900 text-sm sm:text-base tracking-tight hidden sm:inline">
            {business?.name || 'SparklePro'}
          </span>
        </div>
      </header>

      {/* ERROR CARD / NOT FOUND STATE */}
      {errorMessage && (
        <div className="w-full max-w-xl mx-auto my-auto p-6 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Vehicle Service Tracking Status</h2>
          <p className="text-sm text-gray-600 leading-relaxed px-4">{errorMessage}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={fetchTrackingInfo}
              className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl text-sm hover:bg-black transition-colors"
            >
              Retry Search
            </button>
            <button
              onClick={() => navigate('/user/track')}
              className="px-5 py-2.5 bg-gray-100 text-gray-800 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors"
            >
              Track Another Vehicle
            </button>
          </div>
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading && !errorMessage && (
        <div className="w-full max-w-xl mx-auto my-auto p-12 bg-white rounded-3xl border border-gray-200/80 shadow-2xs text-center space-y-3">
          <Loader2 className="w-10 h-10 text-gray-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Loading vehicle telemetry...</p>
        </div>
      )}

      {/* MAIN LAYOUT WRAPPER */}
      {!loading && !errorMessage && trackingData && (
        <main className="w-full max-w-6xl mx-auto flex-1 min-h-0 flex flex-col">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0">
            
            {/* LEFT SIDE PANEL */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3 sm:space-y-4 min-h-0 overflow-y-auto lg:overflow-visible">
              
              {/* CARD 1: VEHICLE & ESTIMATED DELIVERY */}
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-4 sm:p-5 lg:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
                      {vehiclePlate}
                    </h1>
                    <p className="text-gray-500 font-medium text-xs sm:text-sm mt-1">
                      {customerName} • {trackingData.vehicleCategory || 'Vehicle'} {trackingData.vehicleModel ? `(${trackingData.vehicleModel})` : ''}
                    </p>
                  </div>

                  <div
                    className={`px-3 py-1.2 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider flex items-center gap-1.5 uppercase shrink-0 ${
                      status === 'Completed'
                        ? 'bg-blue-100 text-blue-800'
                        : status === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-black text-white'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        status === 'Completed'
                          ? 'bg-blue-600'
                          : status === 'Cancelled'
                          ? 'bg-rose-600'
                          : 'bg-white animate-pulse'
                      }`}
                    ></span>
                    <span>{status === 'Completed' ? 'COMPLETED' : status === 'Cancelled' ? 'CANCELLED' : workflowStep}</span>
                  </div>
                </div>

                {/* Est. Delivery Box */}
                <div className="bg-[#f5f5f7] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between border border-gray-100/80">
                  <div className="flex items-center gap-2 text-gray-600 font-medium text-xs sm:text-sm">
                    <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Est. Completion</span>
                  </div>
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                      {trackingData.estimatedFinishTime || trackingData.estimatedCompletion || 'Pending'}
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-normal">
                      {status === 'Completed' ? 'Handed back to customer' : 'Live Status Updating'}
                    </p>
                  </div>
                </div>

                {/* Business Information snapshot */}
                {business && (
                  <div className="text-xs text-gray-600 pt-1 border-t border-gray-100 space-y-1">
                    {business.name && (
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>{business.name}</span>
                      </div>
                    )}
                    {business.address && (
                      <div className="flex items-center gap-1.5 text-gray-500 font-normal">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{business.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CARD 2: SERVICE & PRICING BREAKDOWN */}
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-4 sm:p-5 lg:p-5 space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Service Breakdown
                </h2>

                <div className="space-y-2 text-xs sm:text-sm">
                  {servicesList.length > 0 ? (
                    servicesList.map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-gray-800 font-semibold">
                        <div className="flex items-center gap-2">
                          <Droplet className="w-4 h-4 text-gray-700 shrink-0" />
                          <span>{service.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {service.duration && (
                            <span className="text-xs text-gray-400 font-normal">{service.duration}</span>
                          )}
                          {typeof service.price === 'number' && (
                            <span className="text-xs font-bold text-gray-900">
                              ₹{service.price}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 italic">No specific services recorded</div>
                  )}
                </div>

                {/* Financial Summary */}
                {typeof trackingData.grandTotal === 'number' && trackingData.grandTotal > 0 && (
                  <>
                    <hr className="border-gray-100 my-2" />
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold">₹{trackingData.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span className="font-semibold">₹{trackingData.taxAmount}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-100">
                        <span>Total</span>
                        <span>₹{trackingData.grandTotal}</span>
                      </div>
                    </div>
                  </>
                )}

                <hr className="border-gray-100 my-2" />

                {/* Assigned Staff */}
                <div className="flex items-center gap-3 pt-0.5">
                  {assignedStaff.avatar ? (
                    <img
                      src={assignedStaff.avatar}
                      alt={assignedStaff.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm shrink-0 border border-gray-200">
                      {assignedStaff.name ? assignedStaff.name.charAt(0) : 'S'}
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] text-gray-500 font-medium">Assigned Specialist</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{assignedStaff.name || 'Specialist'}</p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (Dynamic based on MongoDB business numbers) */}
              <div className="grid grid-cols-2 gap-2.5">
                {cleanMobile ? (
                  <a
                    href={`tel:${cleanMobile}`}
                    className="bg-white hover:bg-gray-50 border border-gray-300/90 text-gray-900 rounded-2xl py-3 px-3 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm transition-colors shadow-2xs text-center cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-gray-800 shrink-0" />
                    <span>Call Workshop</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="bg-gray-100 border border-gray-200 text-gray-400 rounded-2xl py-3 px-3 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm cursor-not-allowed opacity-60"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>No Call Number</span>
                  </button>
                )}

                {cleanWhatsapp ? (
                  <a
                    href={`https://wa.me/${cleanWhatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#e8f8f0] hover:bg-[#dcf3e7] border border-[#c4ebd8] text-[#008a5b] rounded-2xl py-3 px-3 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm transition-colors shadow-2xs text-center cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#008a5b] shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="bg-gray-100 border border-gray-200 text-gray-400 rounded-2xl py-3 px-3 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm cursor-not-allowed opacity-60"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>No WhatsApp</span>
                  </button>
                )}
              </div>

              {/* CARD 3: LIVE STATUS BOTTOM BAR */}
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-3.5 sm:p-4 text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#f0f0f2] text-gray-800 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                  <span>Live Status: Updating Automatically</span>
                </div>
                <p className="font-bold text-gray-900 text-sm sm:text-base">
                  {status === 'Completed'
                    ? 'Your vehicle service is completed and ready for pickup'
                    : status === 'Cancelled'
                    ? 'Your vehicle service has been cancelled'
                    : `Your vehicle is currently in phase: ${workflowStep}`}
                </p>
              </div>

            </div>

            {/* RIGHT SIDE PANEL: LIVE TRACKING TIMELINE */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-5 lg:p-6 flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden justify-between">
              <div className="flex items-center justify-between mb-4 lg:mb-3 shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Live Service Progress
                </h2>
                <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                  {lastUpdated}
                </span>
              </div>

              <div className="relative pl-1 flex-1 flex flex-col justify-between py-1">
                {timelineSteps.map((step, index) => {
                  const isLast = index === timelineSteps.length - 1;

                  return (
                    <div key={step.id || index} className="relative flex items-start group">
                      {/* Vertical connecting line */}
                      {!isLast && (
                        <div
                          className={`absolute left-[11px] top-[22px] bottom-[-6px] w-[2px] ${
                            step.status === 'completed'
                              ? 'bg-black'
                              : 'bg-gray-200'
                          }`}
                        />
                      )}

                      {/* Icon indicator */}
                      <div className="relative z-10 shrink-0 mr-3.5">
                        {step.status === 'completed' && (
                          <div className="w-[24px] h-[24px] rounded-full bg-black flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {step.status === 'current' && (
                          <div className="w-[24px] h-[24px] rounded-full border-2 border-black bg-white flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-black" />
                          </div>
                        )}

                        {step.status === 'upcoming' && (
                          <div className="w-[24px] h-[24px] rounded-full bg-[#f0f0f2] flex items-center justify-center" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        {step.status === 'completed' && (
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-gray-900 text-sm leading-tight">
                              {step.title}
                            </p>
                            {step.time && (
                              <span className="text-xs text-gray-500 font-medium">
                                {step.time}
                              </span>
                            )}
                          </div>
                        )}

                        {step.status === 'current' && (
                          <div className="bg-[#f4f4f6] border border-gray-200/60 rounded-2xl p-3 text-left my-0.5">
                            <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                              {step.title}
                            </p>
                            {step.description && (
                              <p className="text-xs text-gray-600 mt-0.5 leading-normal font-normal">
                                {step.description}
                              </p>
                            )}
                          </div>
                        )}

                        {step.status === 'upcoming' && (
                          <div>
                            <p className="font-semibold text-gray-400 text-sm leading-tight">
                              {step.title}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer className="w-full max-w-6xl mx-auto text-center pt-2 shrink-0 hidden lg:block">
        <p className="text-[11px] text-gray-400 font-medium">
          SparklePro Live Service System • All updates are streamed in real time
        </p>
      </footer>

    </div>
  );
};

export default VehicleDetails;
