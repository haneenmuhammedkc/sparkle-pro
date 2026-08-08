import React, { useState } from 'react';
import { Pencil, Store, Mail, Phone, MapPin, FileText, Check, X } from 'lucide-react';

const BusinessProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    companyName: 'Elite Wash Co.',
    ownerName: 'Sarah Jenkins',
    taxId: 'TAX-889920-IN',
    email: 'sarah@elitewash.com',
    phone: '+91 98765 43210',
    address: '104 Industrial Area, Phase II, Bengaluru, KA - 560001',
    operatingHours: 'Mon - Sat: 8:00 AM - 7:00 PM',
    capacity: '30 Vehicles / Day',
  });

  const [formData, setFormData] = useState({ ...profile });

  const handleSave = (e) => {
    e.preventDefault();
    setProfile({ ...formData });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 text-gray-900">
      {/* Header & Edit Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Business Profile</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Verified details and contact information for your shop.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95"
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" /> Cancel Edit
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4" /> Edit Information
            </>
          )}
        </button>
      </div>

      {/* Header Banner Summary */}
      <div className="bg-gray-50 border border-gray-200/90 rounded-2xl p-5 flex items-center gap-4">
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
          alt={profile.ownerName}
          className="w-16 h-16 rounded-2xl object-cover border border-gray-300 shadow-2xs shrink-0"
        />
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">{profile.companyName}</h3>
          <p className="text-xs text-gray-500 font-semibold">{profile.ownerName} • Owner</p>
          <span className="mt-1.5 inline-block bg-gray-200 text-gray-800 text-[11px] font-bold px-3 py-0.5 rounded-full border border-gray-300">
            Verified Business
          </span>
        </div>
      </div>

      {/* READ-ONLY DISPLAY VS EDIT FORM */}
      {!isEditing ? (
        <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-gray-100">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Business Name</span>
              <span className="text-sm font-extrabold text-gray-900 mt-1 block">{profile.companyName}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Owner / Manager</span>
              <span className="text-sm font-extrabold text-gray-900 mt-1 block">{profile.ownerName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-gray-100">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Tax / GST Registration</span>
              <span className="text-sm font-extrabold text-gray-900 mt-1 block">{profile.taxId}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Operating Capacity</span>
              <span className="text-sm font-extrabold text-gray-900 mt-1 block">{profile.capacity}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-gray-100">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Email</span>
              <span className="text-sm font-bold text-gray-900 mt-1 block">{profile.email}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
              <span className="text-sm font-bold text-gray-900 mt-1 block">{profile.phone}</span>
            </div>
          </div>

          <div className="py-2">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Workshop Address</span>
            <span className="text-sm font-bold text-gray-900 mt-1 block">{profile.address}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Owner Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tax / GST Registration</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Workshop Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BusinessProfile;
