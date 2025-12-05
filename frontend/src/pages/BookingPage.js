import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckCircle, Download } from 'lucide-react';

const BookingPage = () => {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    mobile: '',
    quantity: parseInt(searchParams.get('tickets')) || 1
  });
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      toast.error('Failed to load event details');
      navigate('/');
    }
  };

  const handleInputChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!bookingData.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!bookingData.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(bookingData.email)) {
      toast.error('Please enter a valid email');
      return false;
    }
    if (!bookingData.mobile.trim()) {
      toast.error('Please enter your mobile number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/bookings', {
        event_id: eventId,
        ...bookingData
      });

      setBookingDetails(response.data);
      setBookingComplete(true);
      toast.success('Booking confirmed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!bookingDetails?.qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = `http://localhost:5000${bookingDetails.qrCodeUrl}`;
    link.download = `ticket-${bookingDetails.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (bookingComplete && bookingDetails) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 to-purple-50">
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-effect rounded-3xl p-8 shadow-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
            >
              <CheckCircle className="h-12 w-12 text-green-600" />
            </motion.div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-8">
              Your tickets have been booked successfully. A confirmation email has been sent to {bookingDetails.email}
            </p>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="font-semibold text-gray-700 mb-2">Booking Details</h3>
                <p><strong>Booking ID:</strong> {bookingDetails.id}</p>
                <p><strong>Event:</strong> {bookingDetails.event_title}</p>
                <p><strong>Tickets:</strong> {bookingDetails.quantity}</p>
                <p><strong>Total Amount:</strong> ${bookingDetails.total_amount}</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="font-semibold text-gray-700 mb-2">QR Code</h3>
                <div className="flex flex-col items-center">
                  <img
                    src={`http://localhost:5000${bookingDetails.qrCodeUrl}`}
                    alt="QR Code"
                    className="w-48 h-48 mb-4"
                  />
                  <button
                    onClick={handleDownloadQR}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Ticket</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-x-4">
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Browse More Events
              </button>
              <button
                onClick={() => navigate(`/event/${eventId}`)}
                className="btn-secondary"
              >
                View Event Details
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                } font-semibold`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-24 h-1 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-3xl p-8 shadow-2xl">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={bookingData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={bookingData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div className="flex justify-between items-center pt-6">
                  <button
                    onClick={() => navigate(`/event/${eventId}`)}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="btn-primary"
                    disabled={!bookingData.name || !bookingData.email || !bookingData.mobile}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Review & Confirm</h2>
              
              <div className="space-y-8">
                {/* Event Summary */}
                <div className="bg-white p-6 rounded-xl shadow">
                  <h3 className="font-bold text-xl mb-4">Event Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Event</p>
                      <p className="font-semibold">{event.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-semibold">{event.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date & Time</p>
                      <p className="font-semibold">
                        {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tickets</p>
                      <p className="font-semibold">{bookingData.quantity}</p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow">
                  <h3 className="font-bold text-xl mb-4">Price Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Tickets ({bookingData.quantity} × ${event.price})</span>
                      <span>${(bookingData.quantity * event.price).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount</span>
                        <span className="text-blue-600">
                          ${(bookingData.quantity * event.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;