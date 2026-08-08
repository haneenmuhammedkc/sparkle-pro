import React, { useState } from 'react';
import { Sparkles, Plus, Pencil, Trash2, X, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_SERVICES = [
  {
    id: 1,
    name: 'Exterior Wash',
    description: 'High-pressure foam wash, tire dressing & micro-fiber drying',
    pricing: {
      Bike: { price: 200, duration: '20 mins' },
      Car: { price: 400, duration: '45 mins' },
      SUV: { price: 600, duration: '60 mins' },
      Truck: { price: 800, duration: '75 mins' },
    },
    active: true,
  },
  {
    id: 2,
    name: 'Interior Detail',
    description: 'Deep vacuuming, upholstery steam cleaning & dashboard polish',
    pricing: {
      Bike: { price: 300, duration: '30 mins' },
      Car: { price: 650, duration: '60 mins' },
      SUV: { price: 950, duration: '90 mins' },
      Truck: { price: 1200, duration: '120 mins' },
    },
    active: true,
  },
  {
    id: 3,
    name: 'Ceramic Wax Protect',
    description: 'Hydrophobic paint protection, scratch seal & high gloss shine',
    pricing: {
      Bike: { price: 500, duration: '30 mins' },
      Car: { price: 1200, duration: '45 mins' },
      SUV: { price: 1800, duration: '60 mins' },
      Truck: { price: 2400, duration: '90 mins' },
    },
    active: true,
  },
];

const ServicesManagement = () => {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const toggleServiceActive = (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleCreateOrUpdateService = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const desc = formData.get('description');
    const bikePrice = Number(formData.get('bikePrice')) || 200;
    const carPrice = Number(formData.get('carPrice')) || 400;
    const suvPrice = Number(formData.get('suvPrice')) || 600;

    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                name: name || s.name,
                description: desc || s.description,
                pricing: {
                  ...s.pricing,
                  Bike: { ...s.pricing.Bike, price: bikePrice },
                  Car: { ...s.pricing.Car, price: carPrice },
                  SUV: { ...s.pricing.SUV, price: suvPrice },
                },
              }
            : s
        )
      );
      setEditingService(null);
    } else {
      setServices((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: name || 'New Service',
          description: desc || 'Custom vehicle service',
          pricing: {
            Bike: { price: bikePrice, duration: '20 mins' },
            Car: { price: carPrice, duration: '45 mins' },
            SUV: { price: suvPrice, duration: '60 mins' },
            Truck: { price: suvPrice + 300, duration: '75 mins' },
          },
          active: true,
        },
      ]);
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 text-gray-900">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Services Management</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Configure service packages and multi-vehicle pricing (Car, Bike, SUV, Truck).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Services List with Multi-Vehicle Pricing Cards */}
      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">{service.name}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{service.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingService(service)}
                  className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={() => toggleServiceActive(service.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    service.active ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      service.active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Multi-Vehicle Pricing Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {Object.entries(service.pricing).map(([vType, details]) => (
                <div key={vType} className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3 text-xs">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{vType}</span>
                  <span className="text-base font-extrabold text-gray-900 block mt-0.5">₹{details.price}</span>
                  <span className="text-[11px] text-gray-500 font-semibold block mt-0.5">⏱ {details.duration}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT SERVICE */}
      <AnimatePresence>
        {(isAddModalOpen || editingService) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingService(null);
              }}
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
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingService(null);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdateService} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Service Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingService?.name || ''}
                    placeholder="e.g. Foam Wash Express"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={editingService?.description || ''}
                    placeholder="Short summary of service steps..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Vehicle Type Pricing (₹)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block">Bike (₹)</span>
                      <input
                        name="bikePrice"
                        type="number"
                        defaultValue={editingService?.pricing.Bike.price || 200}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block">Car (₹)</span>
                      <input
                        name="carPrice"
                        type="number"
                        defaultValue={editingService?.pricing.Car.price || 400}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block">SUV (₹)</span>
                      <input
                        name="suvPrice"
                        type="number"
                        defaultValue={editingService?.pricing.SUV.price || 600}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingService(null);
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm"
                  >
                    Save Service
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
