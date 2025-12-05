import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import EventDetailPage from './pages/EventDetailPage';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MyBookings from './pages/MyBookings';  // Add this import
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/booking/:eventId" element={<BookingPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/my-bookings" element={<MyBookings />} />  {/* Add this route */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;