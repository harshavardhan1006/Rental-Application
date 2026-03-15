import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="page-loader">
      <div className="spinner spinner-dark" style={{ width: 40, height: 40, borderWidth: 3 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" replace />;
};

function AppContent() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="page-padding">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/listings/create" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
          <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
          <Route path="/listings/:id/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { fontFamily: 'Nunito, sans-serif', fontWeight: 600, borderRadius: 10 },
          success: { iconTheme: { primary: '#00A699', secondary: 'white' } },
          error: { iconTheme: { primary: '#FF385C', secondary: 'white' } }
        }}
      />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
