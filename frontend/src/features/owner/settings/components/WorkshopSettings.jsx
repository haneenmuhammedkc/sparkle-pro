import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Plus, Edit2, Trash2, X } from 'lucide-react';
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

  // Add / Edit Bay Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBayName, setNewBayName] = useState('');
  const [newBayType, setNewBayType] = useState('Washing');

  const [editingBay, setEditingBay] = useState(null);
  const [editBayName, setEditBayName] = useState('');
  const [editBayType, setEditBayType] = useState('Washing');

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

  const handleAddBay = (e) => {
    e.preventDefault();
    if (!newBayName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid bay name.' });
      return;
    }

    const nextId = bays.length > 0 ? Math.max(...bays.map((b) => b.bayId || b.id || 0)) + 1 : 1;
    const newBayObj = {
      bayId: nextId,
      name: newBayName.trim(),
      type: newBayType.trim() || 'Washing',
      active: true,
    };

    setBays((prev) => [...prev, newBayObj]);
    setNewBayName('');
    setNewBayType('Washing');
    setIsAddModalOpen(false);
    setMessage({ type: 'success', text: 'New bay added to list. Click "Save Workshop Settings" to apply changes.' });
  };

  const handleOpenEditModal = (bay) => {
    setEditingBay(bay);
    setEditBayName(bay.name);
    setEditBayType(bay.type || 'Washing');
  };

  const handleSaveEditedBay = (e) => {
    e.preventDefault();
    if (!editBayName.trim()) {
      setMessage({ type: 'error', text: 'Bay name cannot be empty.' });
      return;
    }

    setBays((prev) =>
      prev.map((b) => {
        const bId = b.bayId || b.id;
        const targetId = editingBay.bayId || editingBay.id;
        if (bId === targetId) {
          return {
            ...b,
            name: editBayName.trim(),
            type: editBayType.trim() || 'Washing',
          };
        }
        return b;
      })
    );

    setEditingBay(null);
    setMessage({ type: 'success', text: 'Bay details updated. Click "Save Workshop Settings" to apply changes.' });
  };

  const handleDeleteBay = (bayId) => {
    setBays((prev) => prev.filter((b) => (b.bayId || b.id) !== bayId));
    setMessage({ type: 'success', text: 'Bay removed from list. Click "Save Workshop Settings" to persist change.' });
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
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to save workshop settings' });
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Washing Bays & Stations</h3>
            <p className="text-xs text-gray-500 font-medium">Manage active workshop bays and operational stations</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Bay
          </button>
        </div>

        <div className="space-y-3">
          {bays.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400 font-medium italic bg-gray-50 rounded-2xl border border-gray-200">
              No bays configured yet. Click "Add Bay" to create one.
            </div>
          ) : (
            bays.map((bay, idx) => {
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

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(bay)}
                      className="p-2 text-gray-600 hover:text-black hover:bg-gray-200 rounded-xl transition cursor-pointer"
                      aria-label="Edit Bay"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBay(bId)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      aria-label="Delete Bay"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

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
                </div>
              );
            })
          )}
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
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
        className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? 'Saving...' : 'Save Workshop Settings'}
      </button>

      {/* Add Bay Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Workshop Bay
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bay Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bay 5 (Polish & Shine)"
                  value={newBayName}
                  onChange={(e) => setNewBayName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Station Type</label>
                <select
                  value={newBayType}
                  onChange={(e) => setNewBayType(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition cursor-pointer"
                >
                  <option value="Washing">Washing</option>
                  <option value="Interior">Interior</option>
                  <option value="QC">Quality Check (QC)</option>
                  <option value="Coating">Coating / Detailing</option>
                  <option value="General">General Service</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer"
                >
                  Add Bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bay Modal */}
      {editingBay && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Bay
              </h3>
              <button
                type="button"
                onClick={() => setEditingBay(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedBay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bay Name *</label>
                <input
                  type="text"
                  required
                  value={editBayName}
                  onChange={(e) => setEditBayName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Station Type</label>
                <select
                  value={editBayType}
                  onChange={(e) => setEditBayType(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black transition cursor-pointer"
                >
                  <option value="Washing">Washing</option>
                  <option value="Interior">Interior</option>
                  <option value="QC">Quality Check (QC)</option>
                  <option value="Coating">Coating / Detailing</option>
                  <option value="General">General Service</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBay(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopSettings;
