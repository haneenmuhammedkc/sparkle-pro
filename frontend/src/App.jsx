import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

import WelcomePage from './pages/WelcomePage'
import BusinessReady from './pages/BusinessReady'

import AdminDashboard from './pages/admin-panel/AdminDashboard'
import Jobs from './pages/admin-panel/Jobs'
import Customers from './pages/admin-panel/Customers'
import CustomerDetails from './pages/admin-panel/CustomerDetails'
import Staff from './pages/admin-panel/Staff'
import Settings from './pages/admin-panel/settings/Settings'
import NewJob from './pages/admin-panel/NewJob'
import NotificationsPage from './pages/admin-panel/NotificationsPage'

import SetupBusiness from './pages/setup/SetupBusiness'
import OperationalDetails from './pages/setup/OperationalDetails'
import ServicesPricing from './pages/setup/ServicePricing'
import Review from './pages/setup/Review'

const App = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AdminDashboard />} />
          <Route path='/dashboard' element={<AdminDashboard />} />
          <Route path='/jobs' element={<Jobs />} />
          <Route path='/new-job' element={<NewJob />} />
          <Route path='/create-job' element={<NewJob />} />
          <Route path='/customers' element={<Customers />} />
          <Route path='/customers/:id' element={<CustomerDetails />} />
          <Route path='/staff' element={<Staff />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/more' element={<Settings />} />
          <Route path='/notifications' element={<NotificationsPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />

          <Route path='/welcome' element={<WelcomePage />} />
          <Route path='/ready' element={<BusinessReady />} />

          <Route path='/setup/business' element={<SetupBusiness />} />
          <Route path='/setup/detail' element={<OperationalDetails />} />
          <Route path='/setup/service' element={<ServicesPricing />} />
          <Route path='/setup/review' element={<Review />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App