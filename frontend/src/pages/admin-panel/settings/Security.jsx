import React, { useState } from 'react';
import { Shield, Lock, Smartphone, Check } from 'lucide-react';

const Security = () => {
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Security & Authentication</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Update passwords, enable two-factor verification, and manage active sessions.
        </p>
      </div>

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
          onClick={() => setTwoFactor(!twoFactor)}
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

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-sm"
          >
            Update Admin Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Security;
