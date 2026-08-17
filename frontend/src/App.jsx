import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerifyPasswordResetOTP from './pages/auth/VerifyPasswordResetOTP';
import ResetPassword from './pages/auth/ResetPassword';

import WelcomePage from './pages/WelcomePage';
import BusinessReady from './pages/BusinessReady';

import AdminDashboard from './pages/admin-panel/AdminDashboard';
import Jobs from './pages/admin-panel/Jobs';
import Customers from './pages/admin-panel/Customers';
import CustomerDetails from './pages/admin-panel/CustomerDetails';
import Staff from './pages/admin-panel/Staff';
import Settings from './pages/admin-panel/settings/Settings';
import NewJob from './pages/admin-panel/NewJob';
import NotificationsPage from './pages/admin-panel/NotificationsPage';

import SetupBusiness from './pages/setup/SetupBusiness';
import OperationalDetails from './pages/setup/OperationalDetails';
import ServicesPricing from './pages/setup/ServicePricing';
import Review from './pages/setup/Review';

import TrackVehicle from './pages/user/TrackVehicle';
import VehicleDetails from './pages/user/VehicleDetails';

import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

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
                <AdminDashboard />
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
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;