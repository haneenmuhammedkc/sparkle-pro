import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Droplet,
} from 'lucide-react';
import * as authService from '../services/authService';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const resetToken = location.state?.resetToken || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resetToken) {
      setErrorMessage('Missing password reset authorization. Please restart the password recovery process.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setErrorMessage('Password must contain at least one uppercase letter (A-Z).');
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setErrorMessage('Password must contain at least one lowercase letter (a-z).');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setErrorMessage('Password must contain at least one number (0-9).');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setErrorMessage('Password must contain at least one special character (!@#$%^&*).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await authService.resetPassword({ resetToken, newPassword });
      if (res && res.success) {
        setSuccessMessage('Password reset successfully! Redirecting to Sign In...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrorMessage(res?.message || 'Failed to reset password.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Password reset authorization is invalid or has expired. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col lg:flex-row font-sans antialiased selection:bg-black selection:text-white">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[#F4F4F6] relative overflow-hidden flex-col justify-between p-12 xl:p-16 select-none">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rotate-45 transform origin-bottom-right shadow-2xl"></div>
          <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-white/60 -rotate-12 transform shadow-sm"></div>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="w-10 h-10 flex items-center justify-center text-black">
            <Droplet className="w-8 h-8 fill-black text-black" />
          </div>
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
              Create New Password
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">
              Set a strong password for your SparklePro account. Updating your password will log out all active sessions on other devices.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4 pt-8">
          <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-gray-200/60 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Encrypted password storage & automatic session revocation</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium pt-4 border-t border-gray-200/80">
            <span>&copy; {new Date().getFullYear()} SparklePro SaaS</span>
            <span className="hover:text-gray-900 cursor-pointer">Security Center</span>
          </div>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-16 xl:p-24 overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <Droplet className="w-6 h-6 fill-black text-black" />
              <span className="font-bold text-lg text-gray-900">SparklePro</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Set New Password
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Your new password must be at least 8 characters long.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 shadow-2xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-800 shadow-2xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-10 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password & Finish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-4">
            <Link to="/login" className="text-gray-700 font-semibold hover:underline">
              Cancel and Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
