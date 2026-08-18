import React, { useState, useEffect } from 'react';
import { Pencil, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import * as settingsService from '../services/settingsService';

const BusinessProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [profile, setProfile] = useState({
    companyName: '',
    ownerName: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    capacity: '30 Vehicles / Day',
    logo: null,
  });

  const [formData, setFormData] = useState({ ...profile });

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await settingsService.getSettings();
        if (isMounted && res.success && res.data) {
          const b = res.data.business || {};
          const u = res.data.user || {};
          const fetchedProfile = {
            companyName: b.name || '',
            ownerName: b.ownerName || u.fullName || '',
            taxId: b.taxId || '',
            email: b.email || u.email || '',
            phone: b.mobileNumber || '',
            address: b.address || '',
            capacity: `${b.capacity || 30} Vehicles / Day`,
            logo: b.logo || null,
          };
          setProfile(fetchedProfile);
          setFormData(fetchedProfile);
        }
      } catch (err) {
        if (isMounted) {
          setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load business profile' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const res = await settingsService.updateProfile(formData);
      if (res.success && res.data) {
        const b = res.data.business || {};
        const u = res.data.user || {};
        const updatedProfile = {
          companyName: b.name || formData.companyName,
          ownerName: b.ownerName || formData.ownerName,
          taxId: b.taxId || formData.taxId,
          email: b.email || formData.email,
          phone: b.mobileNumber || formData.phone,
          address: b.address || formData.address,
          capacity: `${b.capacity || 30} Vehicles / Day`,
          logo: b.logo || formData.logo,
        };
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Business profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update business profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
        <p className="text-xs text-gray-500 font-semibold">Loading business profile...</p>
      </div>
    );
  }

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
          onClick={() => {
            setIsEditing(!isEditing);
            setFormData({ ...profile });
            setMessage(null);
          }}
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

      {/* Header Banner Summary */}
      <div className="bg-gray-50 border border-gray-200/90 rounded-2xl p-5 flex items-center gap-4">
        <img
          src={profile.logo || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"}
          alt={profile.ownerName}
          className="w-16 h-16 rounded-2xl object-cover border border-gray-300 shadow-2xs shrink-0"
        />
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">{profile.companyName || 'My Detailing Workshop'}</h3>
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
              <span className="text-sm font-extrabold text-gray-900 mt-1 block">{profile.companyName || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Owner / Manager</span>
              <span className="text-sm font-extrabold text-gray-900 mt-1 block">{profile.ownerName || '—'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-gray-100">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Tax / GST Registration</span>
              <span className="text-sm font-extrabold text-gray-900 mt-1 block">{profile.taxId || 'Not Configured'}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Operating Capacity</span>
              <span className="text-sm font-extrabold text-gray-900 mt-1 block">{profile.capacity}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-gray-100">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Email</span>
              <span className="text-sm font-bold text-gray-900 mt-1 block">{profile.email || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
              <span className="text-sm font-bold text-gray-900 mt-1 block">{profile.phone || '—'}</span>
            </div>
          </div>

          <div className="py-2">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Workshop Address</span>
            <span className="text-sm font-bold text-gray-900 mt-1 block">{profile.address || 'Not Configured'}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company Name</label>
              <input
                type="text"
                required
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
                placeholder="e.g. TAX-889920-IN"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Email</label>
              <input
                type="email"
                required
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
              disabled={saving}
              onClick={() => {
                setIsEditing(false);
                setFormData({ ...profile });
                setMessage(null);
              }}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BusinessProfile;
