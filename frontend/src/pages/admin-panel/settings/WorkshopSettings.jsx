import React, { useState } from 'react';
import { Wrench, Clock, MapPin, Sliders, ShieldAlert, Check } from 'lucide-react';

const WorkshopSettings = () => {
  const [capacity, setCapacity] = useState(30);
  const [allowOverbooking, setAllowOverbooking] = useState(false);
  const [peakSurge, setPeakSurge] = useState(true);

  const [bays, setBays] = useState([
    { id: 1, name: 'Bay 1 (Foam Wash)', type: 'Washing', active: true },
    { id: 2, name: 'Bay 2 (Interior Detailing)', type: 'Interior', active: true },
    { id: 3, name: 'Bay 3 (Quality Inspection)', type: 'QC', active: true },
    { id: 4, name: 'Bay 4 (Ceramic Coating Spa)', type: 'Coating', active: false },
  ]);

  const toggleBay = (id) => {
    setBays((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Workshop Settings</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Configure operating hours, daily capacity limits, washing bays, and surge rules.
        </p>
      </div>

      {/* Capacity Slider Card */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Daily Vehicle Capacity Limit</h3>
            <p className="text-xs text-gray-500 font-medium">Maximum vehicle jobs accepted per day</p>
          </div>
          <span className="text-2xl font-extrabold text-gray-900 bg-gray-100 px-4 py-1.5 rounded-2xl border border-gray-200">
            {capacity} Vehicles
          </span>
        </div>

        <input
          type="range"
          min="10"
          max="100"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          className="w-full accent-black cursor-pointer"
        />
      </div>

      {/* Washing Bays & Stations Config */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900">Washing Bays & Stations</h3>

        <div className="space-y-3">
          {bays.map((bay) => (
            <div
              key={bay.id}
              className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200/80 rounded-2xl"
            >
              <div>
                <span className="font-bold text-sm text-gray-900 block">{bay.name}</span>
                <span className="text-xs text-gray-500 font-medium">Station Type: {bay.type}</span>
              </div>

              <button
                onClick={() => toggleBay(bay.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  bay.active ? 'bg-black' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    bay.active ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Rules: Overbooking & Peak Hours */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900">Surge & Emergency Rules</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200/80 rounded-2xl">
            <div>
              <span className="font-bold text-sm text-gray-900 block">Allow Emergency Overbooking</span>
              <span className="text-xs text-gray-500 font-medium">Accept high-priority jobs when capacity is full</span>
            </div>
            <button
              onClick={() => setAllowOverbooking(!allowOverbooking)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                allowOverbooking ? 'bg-black' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  allowOverbooking ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200/80 rounded-2xl">
            <div>
              <span className="font-bold text-sm text-gray-900 block">Weekend Peak Hours Surcharge</span>
              <span className="text-xs text-gray-500 font-medium">Apply automated surge pricing on Saturdays and Sundays</span>
            </div>
            <button
              onClick={() => setPeakSurge(!peakSurge)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                peakSurge ? 'bg-black' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  peakSurge ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900">Operating Schedule</h3>

        <div className="space-y-2.5">
          {[
            { day: 'Monday - Friday', hours: '8:00 AM - 7:00 PM' },
            { day: 'Saturday', hours: '8:00 AM - 8:00 PM' },
            { day: 'Sunday', hours: 'Closed' },
          ].map((item) => (
            <div key={item.day} className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200/70 rounded-2xl text-xs sm:text-sm">
              <span className="font-bold text-gray-900">{item.day}</span>
              <span className="bg-gray-200 text-gray-800 font-bold px-3 py-1 rounded-xl border border-gray-300">
                {item.hours}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-sm">
        Save Workshop Settings
      </button>
    </div>
  );
};

export default WorkshopSettings;
