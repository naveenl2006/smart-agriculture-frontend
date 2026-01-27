import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Loader from './components/common/Loader';
import LoadingScreen from './components/common/LoadingScreen';
import IntroScreen from './components/common/IntroScreen';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import CropScheduler from './pages/CropScheduler';
import CropTracking from './pages/CropTracking';
import DiseaseDetection from './pages/DiseaseDetection';
import MarketPrice from './pages/MarketPrice';
import Irrigation from './pages/Irrigation';
import EquipmentRental from './pages/EquipmentRental';
import RentalDetails from './pages/RentalDetails';
import LaborHiring from './pages/LaborHiring';

import Profile from './pages/Profile';
import WeatherAlerts from './pages/WeatherAlerts';
import GovernmentNews from './pages/GovernmentNews';
import SeedAvailability from './pages/SeedAvailability';
import FarmSetup from './pages/FarmSetup';
import Settings from './pages/Settings';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout with Sidebar - SIMPLIFIED VERSION
const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="app-layout">
      <Navbar
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="app-body">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        {/* REMOVED the sidebar-hidden class - it's causing the issue */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />}
      />

      {/* Protected Routes with Layout */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/crops/recommend" element={
        <ProtectedRoute>
          <AppLayout><CropRecommendation /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/crops/schedule" element={
        <ProtectedRoute>
          <AppLayout><CropScheduler /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/crops/tracking" element={
        <ProtectedRoute>
          <AppLayout><CropTracking /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/diseases/detect" element={
        <ProtectedRoute>
          <AppLayout><DiseaseDetection /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/market" element={
        <ProtectedRoute>
          <AppLayout><MarketPrice /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/irrigation" element={
        <ProtectedRoute>
          <AppLayout><Irrigation /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/weather/alerts" element={
        <ProtectedRoute>
          <AppLayout><WeatherAlerts /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/equipment" element={
        <ProtectedRoute>
          <AppLayout><EquipmentRental /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/equipment/rental/:id" element={
        <ProtectedRoute>
          <AppLayout><RentalDetails /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/labor" element={
        <ProtectedRoute>
          <AppLayout><LaborHiring /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><Profile /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/government-news" element={
        <ProtectedRoute>
          <AppLayout><GovernmentNews /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/seeds" element={
        <ProtectedRoute>
          <AppLayout><SeedAvailability /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/farm-setup" element={
        <ProtectedRoute>
          <AppLayout><FarmSetup /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout><Settings /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/help" element={
        <ProtectedRoute>
          <AppLayout><Help /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout><Notifications /></AppLayout>
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <IntroScreen duration={3500}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <LoadingScreen>
                <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
                <AppRoutes />
              </LoadingScreen>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </IntroScreen>
  );
}

export default App;