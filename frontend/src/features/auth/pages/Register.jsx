import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  Droplet,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function Register({
  onSignUp,
  onGoogleSignUp,
  onPrivacyPolicyClick,
  onTermsClick,
  onNeedHelpClick,
}) {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validatePassword = (pass) => {
    if (!pass || pass.length < 8)
      return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass))
      return "Password must contain at least one uppercase letter (A-Z).";
    if (!/[a-z]/.test(pass))
      return "Password must contain at least one lowercase letter (a-z).";
    if (!/[0-9]/.test(pass))
      return "Password must contain at least one number (0-9).";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass))
      return "Password must contain at least one special character (!@#$%^&*).";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const passError = validatePassword(password);
    if (passError) {
      setErrorMessage(passError);
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setErrorMessage("Please agree to the Terms & Conditions to continue.");
      setIsLoading(false);
      return;
    }

    try {
      if (onSignUp) {
        await onSignUp({ fullName, email, password, agreeToTerms });
      } else {
        const res = await register({ fullName, email, password });
        if (res.success) {
          navigate("/verify-email", {
            state: { email: res.data?.email || email },
          });
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create account. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    if (onGoogleSignUp) {
      setIsLoading(true);
      try {
        await onGoogleSignUp();
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col lg:flex-row font-sans antialiased selection:bg-black selection:text-white">
      {/* Left Branding Hero Section - Hidden on Mobile, Visible on Large Screens */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[#F4F4F6] relative overflow-hidden flex-col justify-between p-12 xl:p-16 select-none">
        {/* Subtle geometric background accents matching brand image */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rotate-45 transform origin-bottom-right shadow-2xl"></div>
          <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-white/60 -rotate-12 transform shadow-sm"></div>
        </div>

        {/* Top Branding Drop Icon */}
        <div className="relative z-10 flex flex-col gap-6">
          <div className="w-10 h-10 flex items-center justify-center text-black">
            <Droplet className="w-8 h-8 fill-black text-black" />
          </div>

          <div>
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.12] tracking-tight text-gray-900">
              Manage Your Car <br />
              Wash. <br />
              Smarter. Faster. <br />
              Better.
            </h1>
          </div>
        </div>

        {/* Bottom Hero Spacer */}
        <div className="relative z-10"></div>
      </div>

      {/* Right Content / Form Section - Takes Full Width on Mobile */}
      <div className="w-full lg:w-1/2 xl:w-7/12 min-h-screen flex flex-col justify-between px-6 py-7 sm:px-12 lg:px-16 xl:px-24">
        {/* Central Content Container */}
        <div className="w-full max-w-[400px] mx-auto my-auto flex flex-col justify-center py-6">
          {/* Header Section */}
          <div className="text-left mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-1.5">
              Start Free Trial
            </h1>
            <p className="text-gray-500 text-sm font-normal">
              Get started with your 14-day free trial today
            </p>
          </div>

          {/* Error Alert Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Input Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-gray-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all duration-200 text-sm"
                />
              </div>
            </div>

            {/* Email Input Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-gray-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all duration-200 text-sm"
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-gray-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Must be at least 8 characters"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all duration-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start justify-between text-xs pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 border border-gray-300 rounded peer-checked:bg-black peer-checked:border-black transition-all duration-150 flex items-center justify-center bg-white group-hover:border-gray-400">
                    {agreeToTerms && (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    )}
                  </div>
                </div>
                <span className="text-gray-600 font-normal text-xs leading-tight">
                  I agree to the{" "}
                  <a
                    href="/terms-of-service"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onTermsClick) onTermsClick();
                      else navigate("/terms-of-service");
                    }}
                    className="font-semibold text-gray-900 hover:underline cursor-pointer"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy-policy"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onPrivacyPolicyClick) onPrivacyPolicyClick();
                      else navigate("/privacy-policy");
                    }}
                    className="font-semibold text-gray-900 hover:underline cursor-pointer"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Create Account Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-lg text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-3 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex w-full items-center gap-4 my-6">
            <div className="h-px flex-1 bg-gray-200"></div>

            <span className="shrink-0 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
              OR
            </span>

            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          {/* Google Register Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg text-sm transition-all duration-200 shadow-sm active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          {/* Bottom Switch to Sign In CTA */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-gray-900 hover:underline transition-all focus:outline-none cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Footer Legal Links */}
        <footer className="w-full max-w-[400px] mx-auto pt-6 text-center">
          <div className="flex items-center justify-center gap-6 text-[11px] text-gray-500 font-medium">
            <a
              href="/privacy-policy"
              onClick={(e) => {
                e.preventDefault();
                if (onPrivacyPolicyClick) onPrivacyPolicyClick();
                else navigate("/privacy-policy");
              }}
              className="hover:text-gray-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-of-service"
              onClick={(e) => {
                e.preventDefault();
                if (onTermsClick) onTermsClick();
                else navigate("/terms-of-service");
              }}
              className="hover:text-gray-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </a>
            <a
              href="/help"
              onClick={(e) => {
                e.preventDefault();
                if (onNeedHelpClick) onNeedHelpClick();
                else navigate("/help");
              }}
              className="hover:text-gray-900 transition-colors cursor-pointer"
            >
              Need Help?
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
