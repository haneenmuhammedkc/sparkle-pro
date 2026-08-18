import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requireSetupCompleted = false,
  preventSetupCompleted = false,
  requireBusiness = false,
  requireEmailVerified = true,
}) => {
  const { user, isAuthenticated, business, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FB]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-xs font-semibold text-gray-600">Loading SparklePro...</p>
        </div>
      </div>
    );
  }

  // Guard 1: Must be authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Guard 1.5: Role-based authorization
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Guard 2: Require email address to be verified
  if (requireEmailVerified && user && !user.isEmailVerified) {
    return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
  }

  // Guard 3: Prevent access to onboarding setup pages if setup is ALREADY completed
  if (preventSetupCompleted && business && business.setupCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  // Guard 4: Require a persisted Business document in MongoDB
  if (requireBusiness && !business) {
    return <Navigate to="/setup/business" replace />;
  }

  // Guard 5: Require setup to be completed before dashboard access
  if (requireSetupCompleted && (!business || !business.setupCompleted)) {
    return <Navigate to="/setup/business" replace />;
  }

  return children;
};

export default ProtectedRoute;
