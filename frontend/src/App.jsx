import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import VerifyEmail from './features/auth/pages/VerifyEmail';
import VerifyPasswordResetOTP from './features/auth/pages/VerifyPasswordResetOTP';
import ResetPassword from './features/auth/pages/ResetPassword';

import WelcomePage from './features/owner/setup/pages/WelcomePage';
import BusinessReady from './features/owner/setup/pages/BusinessReady';

import Dashboard from './features/owner/dashboard/pages/Dashboard';
import Jobs from './features/owner/jobs/pages/Jobs';
import Customers from './features/owner/customers/pages/Customers';
import CustomerDetails from './features/owner/customers/pages/CustomerDetails';
import Staff from './features/owner/staff/pages/Staff';
import Settings from './features/owner/settings/pages/Settings';
import NewJob from './features/owner/jobs/pages/NewJob';
import Notifications from './features/owner/notifications/pages/Notifications';

import SetupBusiness from './features/owner/setup/pages/SetupBusiness';
import OperationalDetails from './features/owner/setup/pages/OperationalDetails';
import ServicesPricing from './features/owner/setup/pages/ServicePricing';
import Review from './features/owner/setup/pages/Review';

import TrackVehicle from './features/user/tracking/pages/TrackVehicle';
import VehicleDetails from './features/user/tracking/pages/VehicleDetails';

import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* User Side Public Pages */}
          <Route path="/user/track" element={<TrackVehicle />} />
          <Route path="/user/details" element={<VehicleDetails />} />
          <Route path="/track" element={<TrackVehicle />} />
          <Route path="/track/details" element={<VehicleDetails />} />
          <Route path="/track/:id" element={<VehicleDetails />} />
          <Route path="/tracking" element={<TrackVehicle />} />
          <Route path="/tracking/details" element={<VehicleDetails />} />
          <Route path="/tracking/:token" element={<VehicleDetails />} />
          <Route path="/track/:token" element={<VehicleDetails />} />

          {/* Auth Public Pages */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password/verify" element={<VerifyPasswordResetOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Owner Protected Onboarding Routes */}
          <Route
            path="/welcome"
            element={
              <ProtectedRoute preventSetupCompleted={true}>
                <WelcomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ready"
            element={
              <ProtectedRoute>
                <BusinessReady />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setup/business"
            element={
              <ProtectedRoute preventSetupCompleted={true}>
                <SetupBusiness />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setup/detail"
            element={
              <ProtectedRoute requireBusiness={true} preventSetupCompleted={true}>
                <OperationalDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setup/service"
            element={
              <ProtectedRoute requireBusiness={true} preventSetupCompleted={true}>
                <ServicesPricing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setup/review"
            element={
              <ProtectedRoute requireBusiness={true} preventSetupCompleted={true}>
                <Review />
              </ProtectedRoute>
            }
          />

          {/* Owner Dashboard Routes (Protected) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireSetupCompleted={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute requireSetupCompleted={true}>
                <Jobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-job"
            element={
              <ProtectedRoute requireSetupCompleted={true}>
                <NewJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-job"
            element={
              <ProtectedRoute requireSetupCompleted={true}>
                <NewJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute requireSetupCompleted={true}>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute requireSetupCompleted={true}>
                <CustomerDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute requireSetupCompleted={true}>
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requireSetupCompleted={true}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/more"
            element={
              <ProtectedRoute requireSetupCompleted={true}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute requireSetupCompleted={true}>
                <Notifications />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;