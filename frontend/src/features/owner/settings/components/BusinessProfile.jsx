import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Upload,
  Trash2,
  Building2,
} from 'lucide-react';
import * as settingsService from '../services/settingsService';

const BusinessProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
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
    whatsappNumber: '',
    address: '',
    capacity: '30 Vehicles / Day',
    logo: null,
  });

  const [formData, setFormData] = useState({ ...profile });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoError, setLogoError] = useState(null);

  // Change Password Drawer State
  const [isPasswordDrawerOpen, setIsPasswordDrawerOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

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
            whatsappNumber: b.whatsappNumber || '',
            address: b.address || '',
            capacity: `${b.capacity || 30} Vehicles / Day`,
            logo: b.logo || null,
          };
          setProfile(fetchedProfile);
          setFormData(fetchedProfile);
          setLogoPreview(fetchedProfile.logo);
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

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setLogoError('Please upload a PNG, JPG, or WEBP image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo image must be smaller than 2 MB.');
      return;
    }

    setLogoError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      setLogoPreview(result);
      setFormData((prev) => ({ ...prev, logo: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoError(null);
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (logoError) {
      setMessage({ type: 'error', text: logoError });
      return;
    }

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
          whatsappNumber: b.whatsappNumber || formData.whatsappNumber,
          address: b.address || formData.address,
          capacity: `${b.capacity || 30} Vehicles / Day`,
          logo: b.logo !== undefined ? b.logo : formData.logo,
        };
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        setLogoPreview(updatedProfile.logo);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Business profile updated successfully!' });

        // Dispatch custom event for real-time header & sidebar logo update
        window.dispatchEvent(new CustomEvent('sparklepro:logo_updated', { detail: updatedProfile.logo }));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update business profile' });
    } finally {
      setSaving(false);
    }
  };

  const validatePasswordRules = (pass) => {
    if (!pass || pass.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter (A-Z).';
    if (!/[a-z]/.test(pass)) return 'Password must contain at least one lowercase letter (a-z).';
    if (!/[0-9]/.test(pass)) return 'Password must contain at least one number (0-9).';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) return 'Password must contain at least one special character (!@#$%^&*).';
    return null;
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Please enter your current password.' });
      return;
    }

    const passError = validatePasswordRules(newPassword);
    if (passError) {
      setPasswordMessage({ type: 'error', text: passError });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation password do not match.' });
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await settingsService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setPasswordMessage({ type: 'success', text: res.message || 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: res.message || 'Failed to update password.' });
      }
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update password.',
      });
    } finally {
      setPasswordSaving(false);
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
          className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
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
        {profile.logo ? (
          <img
            src={profile.logo}
            alt={profile.companyName || 'Business Logo'}
            className="w-16 h-16 rounded-2xl object-cover border border-gray-300 shadow-2xs shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center font-black text-xl border border-gray-300 shadow-2xs shrink-0">
            {profile.companyName ? profile.companyName.charAt(0).toUpperCase() : 'S'}
          </div>
        )}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-3 border-b border-gray-100">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Email</span>
              <span className="text-sm font-bold text-gray-900 mt-1 block">{profile.email || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
              <span className="text-sm font-bold text-gray-900 mt-1 block">{profile.phone || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">WhatsApp Number</span>
              <span className="text-sm font-bold text-gray-900 mt-1 block">{profile.whatsappNumber || '—'}</span>
            </div>
          </div>

          <div className="py-2">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Workshop Address</span>
            <span className="text-sm font-bold text-gray-900 mt-1 block">{profile.address || 'Not Configured'}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
          {/* Business Logo Upload Area */}
          <div className="bg-gray-50 border border-gray-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Business Logo
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Business Logo Preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-300 shadow-2xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-black text-white flex items-center justify-center font-black text-2xl border-2 border-gray-300 shadow-2xs">
                    {formData.companyName ? formData.companyName.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </button>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Logo
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoSelect}
                  className="hidden"
                />

                <p className="text-[11px] font-semibold text-gray-500">
                  Recommended: 512 × 512 px. PNG, JPG, or WEBP (Max 2 MB).
                </p>

                {logoError && (
                  <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {logoError}
                  </p>
                )}
              </div>
            </div>
          </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WhatsApp Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
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
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* COLLAPSIBLE CHANGE PASSWORD SECTION                                       */}
      {/* ========================================================================= */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
        <button
          type="button"
          onClick={() => {
            setIsPasswordDrawerOpen(!isPasswordDrawerOpen);
            setPasswordMessage(null);
          }}
          className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Change Password</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Update your Security credentials to keep your owner account safe
              </p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-gray-200 transition-colors">
            {isPasswordDrawerOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {isPasswordDrawerOpen && (
          <div className="pt-4 border-t border-gray-100 space-y-4">
            {passwordMessage && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-3 ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Current Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 p-1 focus:outline-none cursor-pointer"
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters (A-Z, a-z, 0-9, special char)"
                    className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 p-1 focus:outline-none cursor-pointer"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Confirm New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 p-1 focus:outline-none cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessProfile;
