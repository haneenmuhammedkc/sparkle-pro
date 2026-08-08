import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Plus
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';

// Services categorized by vehicle wheel type
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

const STAFF_MEMBERS = [
  { id: 'mike', name: 'Mike R.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', online: true },
  { id: 'dave', name: 'Dave T.', avatar: null, online: true },
  { id: 'ana', name: 'Ana S.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150', online: false },
];

const NewJob = () => {
  const navigate = useNavigate();

  // Category State: '2-wheeler' | '4-wheeler' | 'custom'
  const [wheelCategory, setWheelCategory] = useState('4-wheeler');
  const [selectedServices, setSelectedServices] = useState(['ext-wash', 'int-detail']);
  const [assignedStaff, setAssignedStaff] = useState('mike');
  const [priorityLevel, setPriorityLevel] = useState('Normal');

  // Custom Vehicle On-The-Fly State
  const [customDetails, setCustomDetails] = useState({
    categoryName: 'Auto Rickshaw (3-Wheeler)',
    serviceName: 'Rickshaw Foam Wash & Clean',
    price: 350,
    time: '30m',
  });

  // Switch Wheel Category & reset services to valid defaults
  const handleWheelCategoryChange = (category) => {
    setWheelCategory(category);
    if (category === '2-wheeler') {
      setSelectedServices(['bike-wash', 'chain-lube']);
    } else if (category === '4-wheeler') {
      setSelectedServices(['ext-wash', 'int-detail']);
    } else {
      setSelectedServices(['custom-service-1']);
    }
  };

  // Build active service list based on category
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

  // Calculation logic
  const subtotal = activeAvailableServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, item) => sum + item.price, 0);

  const tax = Number((subtotal * 0.08).toFixed(2));
  const grandTotal = (subtotal + tax).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 flex flex-col lg:flex-row antialiased selection:bg-gray-200 selection:text-gray-900">
      
      {/* Reusable Admin Sidebar */}
      <AdminSidebar activeItem="jobs" />

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

        <form onSubmit={handleSubmit}>
          {/* 2-COLUMN RESPONSIVE LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: CUSTOMER, VEHICLE, SERVICES & STAFF (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* SECTION 1: NEW CUSTOMER REGISTRATION */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4"
              >
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                  New Customer Registration
                </h2>

                <div className="space-y-3.5">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 placeholder:text-gray-400"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
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

                {/* VEHICLE WHEEL SELECTION (2-WHEELER, 4-WHEELER, + CUSTOM) */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Vehicle Wheel Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleWheelCategoryChange('2-wheeler')}
                      className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                        wheelCategory === '2-wheeler'
                          ? 'bg-black text-white border-black font-extrabold shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 font-bold'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span className="text-xs">2-Wheeler</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWheelCategoryChange('4-wheeler')}
                      className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                        wheelCategory === '4-wheeler'
                          ? 'bg-black text-white border-black font-extrabold shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 font-bold'
                      }`}
                    >
                      <Car className="w-4 h-4" />
                      <span className="text-xs">4-Wheeler</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWheelCategoryChange('custom')}
                      className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                        wheelCategory === 'custom'
                          ? 'bg-black text-white border-black font-extrabold shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 font-bold'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span className="text-xs">+ Custom</span>
                    </button>
                  </div>
                </div>

                {/* EXPANDABLE CUSTOM VEHICLE SETUP BOX */}
                {wheelCategory === 'custom' && (
                  <div className="p-4 bg-gray-100 border border-gray-300 rounded-2xl space-y-3">
                    <span className="text-xs font-extrabold text-gray-900 block">
                      Custom One-Time Vehicle Setup
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          Category / Vehicle Name
                        </label>
                        <input
                          type="text"
                          value={customDetails.categoryName}
                          onChange={(e) => setCustomDetails({ ...customDetails, categoryName: e.target.value })}
                          placeholder="e.g. Auto Rickshaw (3-Wheeler)"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          Custom Service Name
                        </label>
                        <input
                          type="text"
                          value={customDetails.serviceName}
                          onChange={(e) => setCustomDetails({ ...customDetails, serviceName: e.target.value })}
                          placeholder="e.g. Rickshaw Foam Wash"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          Service Price (₹)
                        </label>
                        <input
                          type="number"
                          value={customDetails.price}
                          onChange={(e) => setCustomDetails({ ...customDetails, price: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={customDetails.time}
                          onChange={(e) => setCustomDetails({ ...customDetails, time: e.target.value })}
                          placeholder="30m"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      required
                      defaultValue={
                        wheelCategory === '2-wheeler'
                          ? 'KA-05-EB-4321'
                          : wheelCategory === 'custom'
                          ? 'KA-04-AR-9988'
                          : 'KA-01-MJ-8899'
                      }
                      className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        defaultValue={
                          wheelCategory === '2-wheeler'
                            ? 'Royal Enfield'
                            : wheelCategory === 'custom'
                            ? 'Bajaj Auto'
                            : 'Toyota'
                        }
                        className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        defaultValue={
                          wheelCategory === '2-wheeler'
                            ? 'Classic 350'
                            : wheelCategory === 'custom'
                            ? 'RE Compact'
                            : 'Rav4'
                        }
                        className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Vehicle Type
                    </label>
                    <select className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400">
                      {VEHICLE_TYPES[wheelCategory].map((vt) => (
                        <option key={vt} value={vt}>{vt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.section>

              {/* SECTION 3: DYNAMICALLY FILTERED SERVICES */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                      Select Services
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Showing services available for{' '}
                      <span className="font-bold text-gray-900 capitalize">
                        {wheelCategory === 'custom' ? customDetails.categoryName : wheelCategory}
                      </span>
                    </p>
                  </div>
                  <span className="bg-black text-white text-xs font-extrabold px-3 py-1 rounded-full">
                    {selectedServices.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeAvailableServices.map((service) => {
                    const Icon = service.icon;
                    const isSelected = selectedServices.includes(service.id);

                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                          isSelected
                            ? 'bg-gray-50/90 border-2 border-black shadow-xs'
                            : 'bg-white border-gray-200/90 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800">
                            <Icon className="w-4 h-4" />
                          </div>

                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-black text-white' : 'border border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <h3 className="text-sm font-extrabold text-gray-900">{service.name}</h3>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs font-bold">
                          <span className="text-gray-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {service.time}
                          </span>
                          <span className="text-gray-900 text-sm">₹{service.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>

              {/* SECTION 4: ASSIGN STAFF */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4"
              >
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                  Assign Staff
                </h2>

                <div className="flex items-center gap-6">
                  {STAFF_MEMBERS.map((staff) => {
                    const isSelected = assignedStaff === staff.id;

                    return (
                      <div
                        key={staff.id}
                        onClick={() => setAssignedStaff(staff.id)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group"
                      >
                        <div
                          className={`relative rounded-full p-0.5 transition-all ${
                            isSelected ? 'ring-2 ring-black' : ''
                          }`}
                        >
                          {staff.avatar ? (
                            <img
                              src={staff.avatar}
                              alt={staff.name}
                              className="w-12 h-12 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200/90 text-gray-700 flex items-center justify-center">
                              <User className="w-6 h-6" />
                            </div>
                          )}

                          <span
                            className={`w-3.5 h-3.5 rounded-full border-2 border-white absolute bottom-0 right-0 ${
                              staff.online ? 'bg-emerald-500' : 'bg-rose-400'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-extrabold ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                          {staff.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.section>

            </div>

            {/* RIGHT COLUMN: TIMING, PRIORITY, NOTES & JOB SUMMARY (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* SECTION 5: EST. FINISH, PRIORITY & NOTES */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-5"
              >
                {/* Est Finish Banner */}
                <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
                    <Clock className="w-4 h-4 text-gray-700" />
                    Est. Finish
                  </div>
                  <span className="text-base sm:text-lg font-extrabold text-gray-900">11:45 AM</span>
                </div>

                {/* Priority Level Segmented Control */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Priority Level
                  </label>
                  <div className="bg-gray-100/80 p-1 rounded-2xl flex items-center justify-between border border-gray-200/70">
                    {['Normal', 'Express', 'High'].map((level) => {
                      const isActive = priorityLevel === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setPriorityLevel(level)}
                          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                            isActive
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Customer requested extra care on detailing..."
                    className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                  />
                </div>
              </motion.section>

              {/* SECTION 6: JOB SUMMARY CARD */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4"
              >
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                  Job Summary
                </h2>

                <div className="space-y-2.5 text-xs sm:text-sm font-medium border-b border-gray-100 pb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Services ({selectedServices.length})</span>
                    <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax (8%)</span>
                    <span className="font-bold text-gray-900">₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-extrabold text-gray-900">Grand Total</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    ₹{grandTotal}
                  </span>
                </div>
              </motion.section>

              {/* BOTTOM ACTION BUTTONS */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm transition-all shadow-2xs active:scale-98 text-center"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-[2] bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-98 text-center"
                >
                  Create Job Card
                </button>
              </div>

            </div>

          </div>
        </form>
      </main>

    </div>
  );
};

export default NewJob;
