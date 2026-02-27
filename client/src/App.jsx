import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/common/Layout';
import Workflow from './pages/Workflow';
import PatientCheckupForm from './components/dashboard/PatientCheckupForm';
import ModelReport from './pages/ModelReport';

// Returns the correct dashboard path based on stored user role
const getDashboardPath = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const map = { user: '/dashboard/patient', doctor: '/dashboard/doctor', admin: '/dashboard/admin' };
  return map[user?.role] || '/login';
};

// Redirects to dashboard if already logged in
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to={getDashboardPath()} replace /> : children;
};

// Protects dashboard routes and enforces expected role
const ProtectedRoute = ({ children, expectedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (expectedRole && user.role !== expectedRole) return <Navigate to={getDashboardPath()} replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages — redirect to dashboard if already logged in */}
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

        {/* Role-specific dashboards */}
        <Route path="/dashboard/patient" element={<ProtectedRoute expectedRole="user"><PatientDashboard /></ProtectedRoute>} />

        {/* Clinician Portal (Doctor) */}
        <Route path="/dashboard/doctor" element={<ProtectedRoute expectedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />

        <Route path="/dashboard/admin" element={<ProtectedRoute expectedRole="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;