import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, KeyRound, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService.js';

const ForgotPassword = ({
  onPrivacyPolicyClick,
  onTermsClick,
  onNeedHelpClick,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      if (res && res.success) {
        // Navigate to OTP verification page passing email state
        navigate('/forgot-password/verify', { state: { email } });
      } else {
        setErrorMessage(res?.message || 'Failed to send recovery code.');
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to process request. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col justify-between items-center px-4 py-8 sm:px-6 lg:px-8 font-sans antialiased selection:bg-black selection:text-white">
      {/* Central Content Box */}
      <div className="w-full max-w-[420px] mx-auto my-auto flex flex-col justify-center py-6 lg:border lg:border-gray-200 lg:rounded-2xl lg:px-8 lg:shadow-sm">
        {/* Back to Sign In Link */}
        <button
          onClick={() => navigate('/login')}
          type="button"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black font-medium mb-6 transition-colors w-fit focus:outline-none cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Back to Sign In</span>
        </button>

        <div>
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-900">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-[34px] font-bold tracking-tight text-gray-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-normal leading-relaxed">
              Enter your account email address and we'll send you a 6-digit recovery code to reset your password.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Reset Request Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-gray-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all duration-200 text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                'Send Recovery Code'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Legal Links */}
      <footer className="w-full max-w-[420px] mx-auto pt-6 text-center">
        <div className="flex items-center justify-center gap-6 sm:gap-8 text-xs text-gray-500 font-medium">
          <a
            href="#privacy"
            onClick={(e) => {
              e.preventDefault();
              if (onPrivacyPolicyClick) onPrivacyPolicyClick();
            }}
            className="hover:text-gray-900 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#terms"
            onClick={(e) => {
              e.preventDefault();
              if (onTermsClick) onTermsClick();
            }}
            className="hover:text-gray-900 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#help"
            onClick={(e) => {
              e.preventDefault();
              if (onNeedHelpClick) onNeedHelpClick();
            }}
            className="hover:text-gray-900 transition-colors"
          >
            Need Help?
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;