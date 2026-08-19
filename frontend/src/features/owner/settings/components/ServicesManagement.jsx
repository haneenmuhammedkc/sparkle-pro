import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Pencil, Trash2, X, Loader2, CheckCircle2, AlertCircle, Bike, Car, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as settingsService from '../services/settingsService';

const CATEGORY_OPTIONS = [
  { id: '2-wheeler', label: '2-Wheeler (Bike)', icon: Bike },
  { id: '4-wheeler', label: '4-Wheeler (Car General)', icon: Car },
  { id: 'suv', label: 'SUV (SUV Only)', icon: Car },
  { id: 'custom', label: 'Custom / Heavy', icon: Truck },
];

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('4-wheeler');
  const [formPrice, setFormPrice] = useState('400');
  const [formDuration, setFormDuration] = useState('45 mins');
  const [formEnabled, setFormEnabled] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getServices();
      if (res.success && res.data) {
        const rawServices = res.data.servicesConfigured || [];
        setServices(rawServices);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load services' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setFormName('');
    setFormDescription('');
    setFormCategory('4-wheeler');
    setFormPrice('400');
    setFormDuration('45 mins');
    setFormEnabled(true);
    setEditingService(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormName(service.name || '');
    setFormDescription(service.description || '');
    setFormCategory(service.vehicleCategory || service.category || '4-wheeler');
    setFormPrice(String(service.price || '0'));
    setFormDuration(service.duration || '45 mins');
    setFormEnabled(service.enabled !== false);
    setIsAddModalOpen(true);
  };

  const saveServicesToBackend = async (newServicesList) => {
    try {
      setSaving(true);
      setMessage(null);

      const payload = newServicesList.map((s) => ({
        id: s.id || s._id,
        name: s.name,
        description: s.description || '',
        vehicleCategory: s.vehicleCategory || s.category || '4-wheeler',
        price: Number(s.price) || 0,
        duration: s.duration || '45 mins',
        enabled: s.enabled !== false,
      }));

      const res = await settingsService.updateServices({ servicesConfigured: payload });
      if (res.success) {
        setMessage({ type: 'success', text: 'Services configuration saved successfully!' });
        if (res.data?.servicesConfigured) {
          setServices(res.data.servicesConfigured);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save service changes' });
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceActive = (id) => {
    const updated = services.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setServices(updated);
    saveServicesToBackend(updated);
  };

  const handleDeleteService = (id) => {
    if (window.confirm('Are you sure you want to delete this service? Historical jobs will retain their locked price records.')) {
      const updated = services.filter((s) => s.id !== id);
      setServices(updated);
      saveServicesToBackend(updated);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newServiceObj = {
      id: editingService ? editingService.id : `srv-${Date.now()}`,
      name: formName.trim(),
      description: formDescription.trim(),
      vehicleCategory: formCategory,
      price: Number(formPrice) || 0,
      duration: formDuration.trim() || '45 mins',
      enabled: formEnabled,
    };

    let updatedList = [];
    if (editingService) {
      updatedList = services.map((s) => (s.id === editingService.id ? newServiceObj : s));
    } else {
      updatedList = [...services, newServiceObj];
    }

    setServices(updatedList);
    saveServicesToBackend(updatedList);
    setIsAddModalOpen(false);
    setEditingService(null);
  };

  // Category Filtering
  const filteredServices = services.filter((s) => {
    if (activeCategoryTab === 'All') return true;
    const cat = s.vehicleCategory || s.category;
    return cat === activeCategoryTab;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
        <p className="text-xs text-gray-500 font-semibold">Loading services management...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Services Management</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Configure vehicle-specific detailing services, flat pricing, and durations.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
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

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', '2-wheeler', '4-wheeler', 'suv', 'custom'].map((catId) => {
          const labels = {
            All: 'All Services',
            '2-wheeler': '2-Wheeler',
            '4-wheeler': '4-Wheeler',
            suv: 'SUV',
            custom: 'Custom / Heavy',
          };
          const isActive = activeCategoryTab === catId;
          return (
            <button
              key={catId}
              type="button"
              onClick={() => setActiveCategoryTab(catId)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isActive ? 'bg-black text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {labels[catId]}
            </button>
          );
        })}
      </div>

      {/* SERVICES CARDS GRID */}
      <div className="space-y-3.5">
        {filteredServices.length === 0 ? (
          <div className="bg-white border border-gray-200/90 rounded-3xl p-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-800">No services configured for this category.</p>
            <p className="text-xs text-gray-500 font-medium">Click "+ Add Service" above to create a service specifically for this vehicle type.</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-900 shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-extrabold text-gray-900">{service.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200">
                        {service.vehicleCategory === '2-wheeler' ? '2-Wheeler' : service.vehicleCategory === 'suv' ? 'SUV' : service.vehicleCategory === 'custom' ? 'Custom / Heavy' : '4-Wheeler'}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{service.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs font-bold text-gray-700">
                      <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">₹{service.price}</span>
                      <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200">⏱ {service.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(service)}
                    className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                    title="Edit Service"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => toggleServiceActive(service.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      service.enabled !== false ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        service.enabled !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: ADD / EDIT VEHICLE-SPECIFIC SERVICE */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl relative z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-gray-900">
                  {editingService ? 'Edit Vehicle Service' : 'Add Vehicle-Specific Service'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Service Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Bike Foam Wash / Car Interior Detail"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short description of detailing steps..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Vehicle Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORY_OPTIONS.map((cat) => {
                      const IconComponent = cat.icon;
                      const isSelected = formCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormCategory(cat.id)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                            isSelected ? 'bg-black text-white border-black shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <IconComponent className="w-4 h-4 shrink-0" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="Price in ₹"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Duration</label>
                    <input
                      type="text"
                      required
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="e.g. 45 mins"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesManagement;
