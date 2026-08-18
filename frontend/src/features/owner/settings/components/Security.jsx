import React, { useState, useEffect } from 'react';
import { Smartphone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import * as settingsService from '../services/settingsService';

const Security = () => {
  const [twoFactor, setTwoFactor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [twoFactorMsg, setTwoFactorMsg] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchSecuritySettings = async () => {
      try {
        setLoading(true);
        const res = await settingsService.getSettings();
        if (isMounted && res.success && res.data && res.data.user) {
          setTwoFactor(Boolean(res.data.user.twoFactorEnabled));
        }
      } catch (err) {
        // Fallback silently if offline
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSecuritySettings();
    return () => { isMounted = false; };
  }, []);

  const handleToggle2FA = async () => {
    try {
      const nextState = !twoFactor;
      setTwoFactor(nextState);
      setTwoFactorMsg(null);
      const res = await settingsService.toggle2FA(nextState);
      if (res.success) {
        setTwoFactorMsg({ type: 'success', text: `2FA requirement ${nextState ? 'enabled' : 'disabled'}.` });
      }
    } catch (err) {
      setTwoFactor(!twoFactor); // Revert on failure
      setTwoFactorMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update 2FA preference' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (passwordData.newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation password do not match.' });
      return;
    }

    try {
      setSavingPassword(true);
      const res = await settingsService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Admin password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update admin password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
        <p className="text-xs text-gray-500 font-semibold">Loading security settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Security & Authentication</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Update passwords, enable two-factor verification, and manage active sessions.
        </p>
      </div>

      {/* 2FA FEEDBACK ALERT */}
      {twoFactorMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-3 ${
            twoFactorMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {twoFactorMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{twoFactorMsg.text}</span>
        </div>
      )}

      {/* Two-Factor Toggle Card */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Two-Factor Authentication (2FA)</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Secure logins via SMS OTP verification</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle2FA}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            twoFactor ? 'bg-black' : 'bg-gray-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
              twoFactor ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Update Password Form */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900">Change Admin Password</h3>

        {/* PASSWORD FEEDBACK ALERT */}
        {passwordMsg && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-3 ${
              passwordMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {passwordMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
            {savingPassword ? 'Updating Password...' : 'Update Admin Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Security;
