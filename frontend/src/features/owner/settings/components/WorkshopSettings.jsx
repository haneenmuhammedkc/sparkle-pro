import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import * as settingsService from '../services/settingsService';

const WorkshopSettings = () => {
  const [capacity, setCapacity] = useState(30);
  const [allowOverbooking, setAllowOverbooking] = useState(false);
  const [peakSurge, setPeakSurge] = useState(true);
  const [openingTime, setOpeningTime] = useState('08:00 AM');
  const [closingTime, setClosingTime] = useState('07:00 PM');
  const [weeklyHolidays, setWeeklyHolidays] = useState(['Sunday']);
  const [bays, setBays] = useState([
    { bayId: 1, name: 'Bay 1 (Foam Wash)', type: 'Washing', active: true },
    { bayId: 2, name: 'Bay 2 (Interior Detailing)', type: 'Interior', active: true },
    { bayId: 3, name: 'Bay 3 (Quality Inspection)', type: 'QC', active: true },
    { bayId: 4, name: 'Bay 4 (Ceramic Coating Spa)', type: 'Coating', active: false },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchWorkshop = async () => {
      try {
        setLoading(true);
        const res = await settingsService.getSettings();
        if (isMounted && res.success && res.data && res.data.business) {
          const b = res.data.business;
          if (b.capacity !== undefined) setCapacity(b.capacity);
          if (b.allowOverbooking !== undefined) setAllowOverbooking(b.allowOverbooking);
          if (b.peakSurge !== undefined) setPeakSurge(b.peakSurge);
          if (b.openingTime) setOpeningTime(b.openingTime);
          if (b.closingTime) setClosingTime(b.closingTime);
          if (Array.isArray(b.weeklyHolidays)) setWeeklyHolidays(b.weeklyHolidays);
          if (Array.isArray(b.bays) && b.bays.length > 0) setBays(b.bays);
        }
      } catch (err) {
        if (isMounted) {
          setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load workshop settings' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWorkshop();
    return () => { isMounted = false; };
  }, []);

  const toggleBay = (bayId) => {
    setBays((prev) =>
      prev.map((b) => ((b.bayId === bayId || b.id === bayId) ? { ...b, active: !b.active } : b))
    );
  };

  const toggleHoliday = (day) => {
    setWeeklyHolidays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveWorkshop = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await settingsService.updateWorkshop({
        capacity,
        allowOverbooking,
        peakSurge,
        openingTime,
        closingTime,
        weeklyHolidays,
        bays,
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Workshop settings saved successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save workshop settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
        <p className="text-xs text-gray-500 font-semibold">Loading workshop settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Workshop Settings</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Configure operating hours, daily capacity limits, washing bays, and surge rules.
        </p>
      </div>

      {/* FEEDBACK ALERTS */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

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
          {bays.map((bay, idx) => {
            const bId = bay.bayId || bay.id || idx + 1;
            return (
              <div
                key={bId}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200/80 rounded-2xl"
              >
                <div>
                  <span className="font-bold text-sm text-gray-900 block">{bay.name}</span>
                  <span className="text-xs text-gray-500 font-medium">Station Type: {bay.type}</span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleBay(bId)}
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
            );
          })}
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
              type="button"
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
              type="button"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Opening Time</label>
            <input
              type="text"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Closing Time</label>
            <input
              type="text"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Weekly Holidays</label>
          <div className="flex flex-wrap gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
              const isSelected = weeklyHolidays.includes(day) || weeklyHolidays.includes(day === 'Sun' ? 'Sunday' : day === 'Sat' ? 'Saturday' : day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleHoliday(day)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveWorkshop}
        disabled={saving}
        className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? 'Saving...' : 'Save Workshop Settings'}
      </button>
    </div>
  );
};

export default WorkshopSettings;
