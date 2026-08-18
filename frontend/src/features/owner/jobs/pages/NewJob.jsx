import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Clock,
  Sparkles,
  User,
  Droplet,
  Shield,
  Disc,
  Bike,
  Car,
  Truck,
  AlertCircle,
  Search,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Sidebar from '../../../../components/layout/Sidebar';
import { useAuth } from '../../../../context/AuthContext';
import * as jobService from '../services/jobService.js';
import * as customerService from '../../customers/services/customerService.js';
import * as staffService from '../../staff/services/staffService.js';
const BASE_WHEEL_SERVICES = {
  '2-wheeler': [
    { id: 'bike-wash', name: 'Bike Foam Wash', time: '20m', price: 200, icon: Droplet },
    { id: 'chain-lube', name: 'Chain Lube & Engine Polish', time: '15m', price: 150, icon: Sparkles },
    { id: 'bike-ceramic', name: 'Bike Ceramic Wax', time: '30m', price: 500, icon: Shield },
    { id: 'matte-finish', name: 'Matte Finish Shield', time: '25m', price: 350, icon: Disc },
  ],
  '4-wheeler': [
    { id: 'ext-wash', name: 'Exterior Wash', time: '45m', price: 400, icon: Droplet },
    { id: 'int-detail', name: 'Interior Detail', time: '60m', price: 650, icon: Sparkles },
    { id: 'ceramic-wax', name: 'Ceramic Wax Protect', time: '30m', price: 1200, icon: Shield },
    { id: 'tire-shine', name: 'Tire & Wheel Shine', time: '15m', price: 150, icon: Disc },
  ],
};

const VEHICLE_TYPES = {
  '2-wheeler': ['Sports Bike', 'Scooter / Moped', 'Cruiser / Superbike'],
  '4-wheeler': ['SUV / Crossover', 'Sedan', 'Hatchback', 'Pickup Truck'],
  'custom': ['Auto Rickshaw (3-Wheeler)', 'Heavy Commercial Bus', 'Heavy Truck (6+ Wheeler)', 'Special Machinery'],
};

const NewJob = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { business } = useAuth();

  // Controlled Customer Input State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState(searchParams.get('phone') || '');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleType, setVehicleType] = useState('SUV / Crossover');
  const [notes, setNotes] = useState('');

  // Returning Customer Lookup State
  const [suggestedCustomer, setSuggestedCustomer] = useState(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // Live Staff State
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);

  // Category State: '2-wheeler' | '4-wheeler' | 'custom'
  const [wheelCategory, setWheelCategory] = useState('4-wheeler');
  const [selectedServices, setSelectedServices] = useState(['ext-wash', 'int-detail']);
  const [assignedStaff, setAssignedStaff] = useState(null);
  const [priorityLevel, setPriorityLevel] = useState('Normal');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch Live Staff Members from Backend
  useEffect(() => {
    const fetchStaff = async () => {
      setStaffLoading(true);
      try {
        const res = await staffService.getStaff({ limit: 100 });
        if (res.success && res.data && Array.isArray(res.data.staff)) {
          // Filter out OFFLINE staff members
          const assignable = res.data.staff.filter((s) => s.status !== 'OFFLINE');
          setStaffList(assignable);
          if (assignable.length > 0) {
            setAssignedStaff(assignable[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load assignable staff members:', err);
      } finally {
        setStaffLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Custom Vehicle On-The-Fly State
  const [customDetails, setCustomDetails] = useState({
    categoryName: 'Auto Rickshaw (3-Wheeler)',
    serviceName: 'Rickshaw Foam Wash & Clean',
    price: 350,
    time: '30m',
  });

  // Debounced Returning Customer Search by Phone
  useEffect(() => {
    if (!customerPhone || customerPhone.trim().length < 5) {
      setSuggestedCustomer(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCustomer(true);
      try {
        const res = await customerService.getCustomers({ search: customerPhone.trim(), limit: 1 });
        if (res.success && res.data?.customers?.length > 0) {
          setSuggestedCustomer(res.data.customers[0]);
        } else {
          setSuggestedCustomer(null);
        }
      } catch (err) {
        setSuggestedCustomer(null);
      } finally {
        setIsSearchingCustomer(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [customerPhone]);

  // Handler to auto-fill returning customer details
  const applySuggestedCustomer = () => {
    if (!suggestedCustomer) return;
    setCustomerName(suggestedCustomer.name || '');
    if (suggestedCustomer.vehicles && suggestedCustomer.vehicles.length > 0) {
      const primaryV = suggestedCustomer.vehicles[0];
      setVehiclePlate(primaryV.plate || '');
      setVehicleModel(primaryV.model || '');
      if (primaryV.category === 'Bike') setWheelCategory('2-wheeler');
      if (primaryV.category === 'Car') setWheelCategory('4-wheeler');
    }
  };

  // Switch Wheel Category & reset services to valid defaults
  const handleWheelCategoryChange = (category) => {
    setWheelCategory(category);
    if (category === '2-wheeler') {
      setSelectedServices(['bike-wash', 'chain-lube']);
      setVehicleType('SUV / Crossover');
    } else if (category === '4-wheeler') {
      setSelectedServices(['ext-wash', 'int-detail']);
      setVehicleType('SUV / Crossover');
    } else {
      setSelectedServices(['custom-service-1']);
      setVehicleType('Auto Rickshaw (3-Wheeler)');
    }
  };

  // Build active service list based on category & business configuration
  const activeAvailableServices =
    wheelCategory === 'custom'
      ? [
          {
            id: 'custom-service-1',
            name: customDetails.serviceName || 'Custom Service Package',
            time: customDetails.time || '30m',
            price: Number(customDetails.price) || 350,
            icon: Truck,
          },
          {
            id: 'custom-service-2',
            name: 'Heavy Interior Steam Sanitization',
            time: '45m',
            price: 500,
            icon: Sparkles,
          },
        ]
      : BASE_WHEEL_SERVICES[wheelCategory];

  // Service toggle handler
  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Calculation logic for frontend preview
  const subtotal = activeAvailableServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, item) => sum + item.price, 0);

  const tax = Number((subtotal * 0.08).toFixed(2));
  const grandTotal = (subtotal + tax).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      customerName,
      customerPhone,
      vehiclePlate,
      vehicleBrand,
      vehicleModel,
      vehicleCategory: wheelCategory === '2-wheeler' ? 'Bike' : wheelCategory === '4-wheeler' ? 'Car' : 'Custom',
      wheelCategory,
      vehicleType,
      services: activeAvailableServices
        .filter((s) => selectedServices.includes(s.id))
        .map((s) => ({
          serviceId: s.id,
          name: s.name,
          price: s.price,
          duration: s.time,
        })),
      customDetails: wheelCategory === 'custom' ? customDetails : null,
      assignedStaff: assignedStaff
        ? { staffId: assignedStaff }
        : null,
      priorityLevel,
      notes,
    };

    try {
      const res = await jobService.createJob(payload);
      if (res.success) {
        navigate('/jobs');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create job card. Please check inputs and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-gray-200 selection:text-gray-900">
      
      {/* Reusable Admin Sidebar */}
      <Sidebar activeItem="jobs" />

      {/* ========================================================== */}
      {/* MAIN CONTENT AREA                                          */}
      {/* ========================================================== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 sm:pb-36 lg:pb-12">
        
        {/* COMPACT TOP BAR: ONLY BACK BUTTON */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go Back"
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center transition-colors border border-gray-200/90 shadow-2xs shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 2-COLUMN RESPONSIVE LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: CUSTOMER, VEHICLE, SERVICES & STAFF (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* SECTION 1: CUSTOMER REGISTRATION & RETURNING LOOKUP */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                    Customer Registration
                  </h2>
                  {isSearchingCustomer && (
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Searching...
                    </span>
                  )}
                </div>

                {/* RETURNING CUSTOMER SUGGESTION BADGE */}
                {suggestedCustomer && (
                  <div className="p-3.5 bg-blue-50/90 border border-blue-200/80 rounded-2xl flex items-center justify-between text-xs font-bold text-blue-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Existing Customer Found: <strong>{suggestedCustomer.name}</strong> ({suggestedCustomer.vehicles?.[0]?.plate || 'No plate'})</span>
                    </div>
                    <button
                      type="button"
                      onClick={applySuggestedCustomer}
                      className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-2xs active:scale-95 shrink-0"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                <div className="space-y-3.5">
                  <input
                    name="customerPhone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone Number (e.g. +91 98765 43210)"
                    className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 placeholder:text-gray-400"
                  />

                  <input
                    name="customerName"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 placeholder:text-gray-400"
                  />
                </div>
              </motion.section>

              {/* SECTION 2: VEHICLE DETAILS WITH 3 CATEGORIES (2-WHEELER, 4-WHEELER, + CUSTOM) */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-5"
              >
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                  Vehicle Details
                </h2>

                {/* VEHICLE WHEEL SELECTION */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    VEHICLE CATEGORY
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: '2-wheeler', name: '2-Wheeler', icon: Bike },
                      { id: '4-wheeler', name: '4-Wheeler', icon: Car },
                      { id: 'custom', name: 'Custom / Heavy', icon: Truck },
                    ].map((cat) => {
                      const IconComponent = cat.icon;
                      const isSelected = wheelCategory === cat.id;

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleWheelCategoryChange(cat.id)}
                          className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                            isSelected
                              ? 'bg-black text-white border-black shadow-xs font-extrabold'
                              : 'bg-gray-50/70 text-gray-700 border-gray-200 hover:bg-gray-100 font-semibold'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="text-xs">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* STANDARD VEHICLE INPUTS OR CUSTOM SPECIFICATION */}
                {wheelCategory !== 'custom' ? (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <input
                        name="vehiclePlate"
                        type="text"
                        required
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        placeholder="Registration Plate (e.g. KL-58-D-2935)"
                        className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-sm font-semibold uppercase text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 placeholder:normal-case placeholder:font-normal placeholder:text-gray-400"
                      />
                      <input
                        name="vehicleBrand"
                        type="text"
                        value={vehicleBrand}
                        onChange={(e) => setVehicleBrand(e.target.value)}
                        placeholder="Brand / Make (e.g. BMW, Honda)"
                        className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 placeholder:text-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <input
                        name="vehicleModel"
                        type="text"
                        required
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder="Vehicle Model (e.g. X5, Civic)"
                        className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 placeholder:text-gray-400"
                      />

                      <select
                        name="vehicleType"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                      >
                        {VEHICLE_TYPES[wheelCategory].map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                    <span className="block text-xs font-bold text-gray-700 uppercase">
                      On-The-Fly Custom Vehicle Details
                    </span>

                    <input
                      name="vehiclePlate"
                      type="text"
                      required
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="Vehicle Identification / Plate Number"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold uppercase text-gray-900"
                    />

                    <input
                      name="vehicleModel"
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Vehicle Description (e.g. Volvo Commercial Coach)"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={customDetails.serviceName}
                        onChange={(e) => setCustomDetails({ ...customDetails, serviceName: e.target.value })}
                        placeholder="Custom Service Name"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                      />
                      <input
                        type="number"
                        value={customDetails.price}
                        onChange={(e) => setCustomDetails({ ...customDetails, price: e.target.value })}
                        placeholder="Custom Price (₹)"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                      />
                    </div>
                  </div>
                )}
              </motion.section>

              {/* SECTION 3: SERVICES SELECTION */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                    Select Services
                  </h2>
                  <span className="text-xs font-bold text-gray-500">
                    {selectedServices.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeAvailableServices.map((service) => {
                    const IconComp = service.icon;
                    const isSelected = selectedServices.includes(service.id);

                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                          isSelected
                            ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                            : 'bg-gray-50/70 hover:bg-gray-100 text-gray-900 border-gray-200/90'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-white/10 text-white' : 'bg-white text-gray-700 shadow-2xs'}`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold tracking-tight">{service.name}</h4>
                            <span className={`text-xs font-semibold block mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                              {service.time}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold block">₹{service.price}</span>
                          {isSelected && (
                            <span className="inline-block mt-1 bg-white text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                              ADDED
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>

              {/* SECTION 4: ASSIGN STAFF & PRIORITY */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4"
              >
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                  Assign Staff & Priority
                </h2>

                {staffLoading ? (
                  <div className="py-4 text-center text-xs text-gray-500 font-semibold flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Loading workshop staff members...
                  </div>
                ) : staffList.length === 0 ? (
                  <p className="text-xs text-gray-400 font-medium py-2">No active staff members available for assignment.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {staffList.map((staff) => {
                      const isSelected = assignedStaff === staff._id;
                      return (
                        <button
                          key={staff._id}
                          type="button"
                          onClick={() => setAssignedStaff(staff._id)}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                            isSelected
                              ? 'bg-black text-white border-black font-extrabold'
                              : 'bg-gray-50/70 text-gray-800 border-gray-200 hover:bg-gray-100 font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-800 flex items-center justify-center text-xs font-extrabold overflow-hidden shrink-0">
                              {staff.avatar ? (
                                <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                              ) : (
                                staff.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="text-left truncate">
                              <span className="text-xs truncate block">{staff.name}</span>
                              <span className={`text-[10px] font-semibold block ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                                {staff.role}
                              </span>
                            </div>
                          </div>
                          {staff.status === 'BUSY' && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
                              BUSY
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    PRIORITY LEVEL
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {['Normal', 'High', 'VIP'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriorityLevel(p)}
                        className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          priorityLevel === p
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.section>

            </div>

            {/* RIGHT COLUMN: FINANCIAL SUMMARY & CHECK-IN ACTION (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6 sticky top-6"
              >
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight border-b border-gray-100 pb-4">
                  Job Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between font-semibold text-gray-600">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between font-semibold text-gray-600">
                    <span>GST Tax (8%)</span>
                    <span className="text-gray-900 font-bold">₹{tax}</span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                    <span className="text-base font-extrabold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">₹{grandTotal}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    JOB NOTES / INSTRUCTIONS
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Scratches on left door, fragile antenna..."
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || selectedServices.length === 0}
                  className="w-full py-4 bg-black hover:bg-gray-800 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm sm:text-base transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Job Card...
                    </>
                  ) : (
                    'Complete Check-In & Create Job'
                  )}
                </button>
              </motion.div>

            </div>

          </div>
        </form>
      </main>

    </div>
  );
};

export default NewJob;
