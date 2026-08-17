import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Droplet,
  Loader2,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import * as authService from '../../services/authService.js';

export default function VerifyPasswordResetOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const targetEmail = location.state?.email || '';

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [emailInput, setEmailInput] = useState(targetEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 60-second Resend Cooldown Countdown
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Auto-focus first input box on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numeric characters

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1); // Take latest single digit
    setOtpDigits(newOtp);
    setErrorMessage('');

    // Auto-advance to next input if digit entered
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs[5].current?.focus();
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your recovery code.');
      return;
    }

    if (!emailInput) {
      setErrorMessage('Email address is missing. Please enter your email.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await authService.verifyPasswordResetOTP({ email: emailInput, otp: fullOtp });
      if (res && res.success && res.data?.resetToken) {
        setSuccessMessage('Recovery code verified! Redirecting to set new password...');
        setTimeout(() => {
          navigate('/reset-password', { state: { resetToken: res.data.resetToken } });
        }, 1000);
      } else {
        setErrorMessage(res?.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Invalid or expired recovery code. Please check and try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || isResending) return;

    if (!emailInput) {
      setErrorMessage('Please provide your email address to resend recovery code.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsResending(true);

    try {
      const res = await authService.resendPasswordResetOTP({ email: emailInput });
      if (res && res.success) {
        setSuccessMessage('A new 6-digit recovery code has been sent to your email.');
        setCooldown(60); // Reset 60s cooldown
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs[0].current?.focus();
      } else {
        setErrorMessage(res?.message || 'Failed to resend recovery code.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to resend recovery code. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col lg:flex-row font-sans antialiased selection:bg-black selection:text-white">
      {/* Left Branding Hero Section */}
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
              Password Recovery
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">
              We've sent a 6-digit recovery code to your email. Enter it below to authorize resetting your password.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4 pt-8">
          <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-gray-200/60 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Cryptographically secured 2-minute recovery code</span>
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
              Verify Recovery Code
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Enter the 6-digit recovery code sent to{' '}
              <strong className="text-gray-900">{emailInput || 'your email address'}</strong>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {!targetEmail && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@business.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                  />
                </div>
              </div>
            )}

            {/* 6 Individual Digit Inputs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">Recovery Code</label>
                <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Valid for 2 minutes
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold bg-[#F9FAFB] border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all shadow-2xs"
                  />
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading || otpDigits.join('').length !== 6}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Proceed to Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Cooldown Footer */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={cooldown > 0 || isResending}
              className={`flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                cooldown > 0 || isResending
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-black hover:text-gray-700'
              }`}
            >
              {isResending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Recovery Code'}
              </span>
            </button>

            <Link
              to="/forgot-password"
              className="text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              Need to change email?
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 pt-8">
          <span>Remember your password? </span>
          <Link to="/login" className="text-gray-700 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
