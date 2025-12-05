import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState(1);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (selectedTickets > event.available_seats) {
      toast.error('Not enough seats available');
      return;
    }
    navigate(`/booking/${id}?tickets=${selectedTickets}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Event not found</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 btn-secondary"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Event Image & Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={event.img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
                alt={event.title}
                className="w-full h-96 object-cover"
              />
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{event.title}</h1>
                <p className="mt-4 text-gray-600 leading-relaxed">{event.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                  <span>{format(new Date(event.date), 'PPP')}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-3 text-blue-600" />
                  <span>{format(new Date(event.date), 'p')}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-3 text-blue-600" />
                  <span>{event.available_seats} seats available out of {event.total_seats}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Booking Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect rounded-2xl p-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Your Tickets</h2>
            
            {/* Seat Availability */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Seats Available</span>
                <span className="font-semibold">{event.available_seats} / {event.total_seats}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(event.available_seats / event.total_seats) * 100}%` }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                />
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="mb-8">
              <label className="block text-gray-700 mb-4 font-medium">
                Number of Tickets
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedTickets(Math.max(1, selectedTickets - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <span className="text-2xl">-</span>
                </button>
                <motion.div
                  key={selectedTickets}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-gray-900 w-12 text-center"
                >
                  {selectedTickets}
                </motion.div>
                <button
                  onClick={() => setSelectedTickets(Math.min(event.available_seats, selectedTickets + 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <span className="text-2xl">+</span>
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="mb-8 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Price per ticket</span>
                <span className="font-semibold">${event.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of tickets</span>
                <span className="font-semibold">{selectedTickets}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <motion.span
                    key={selectedTickets * event.price}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-blue-600"
                  >
                    ${(selectedTickets * event.price).toFixed(2)}
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBooking}
              className="w-full btn-primary py-4 text-lg"
              disabled={event.available_seats === 0}
            >
              {event.available_seats === 0 ? 'Sold Out' : 'Proceed to Booking'}
            </motion.button>

            {event.available_seats < 10 && event.available_seats > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm text-center">
                  ⚠️ Only {event.available_seats} seats left!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;