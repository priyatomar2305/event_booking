import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';

const EventCard = ({ event }) => {
  if (!event) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-500">No event data available</p>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format time
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  // Calculate seat percentage
  const getSeatPercentage = () => {
    if (!event.total_seats || event.total_seats === 0) return 0;
    return Math.round((event.available_seats / event.total_seats) * 100);
  };

  // Get seat status color
  const getSeatColor = () => {
    const percentage = getSeatPercentage();
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get seat status text
  const getSeatStatus = () => {
    const percentage = getSeatPercentage();
    if (event.available_seats === 0) return 'Sold Out';
    if (percentage < 20) return 'Almost Full';
    if (percentage < 50) return 'Limited Seats';
    return 'Available';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
      {/* Event Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={event.img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87';
          }}
        />
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700">
              {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {new Date(event.date).getDate()}
            </div>
          </div>
        </div>

        {/* Seat Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            event.available_seats === 0 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {getSeatStatus()}
          </span>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6">
        {/* Event Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {event.title}
        </h3>

        {/* Event Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.description || 'No description available'}
        </p>

        {/* Event Details */}
        <div className="space-y-3 mb-6">
          {/* Location */}
          <div className="flex items-center text-gray-700">
            <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="text-sm truncate">{event.location}</span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center text-gray-700">
            <Calendar className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
            <div className="text-sm">
              <div>{formatDate(event.date)}</div>
              <div className="text-gray-500">{formatTime(event.date)}</div>
            </div>
          </div>

          {/* Seats Available */}
          <div className="flex items-center text-gray-700">
            <Users className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Seats Available</span>
                <span className="font-semibold">
                  {event.available_seats} / {event.total_seats}
                </span>
              </div>
              {/* Progress Bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getSeatColor()} transition-all duration-500`}
                  style={{ width: `${getSeatPercentage()}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Price and Book Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Price */}
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ${typeof event.price === 'number' ? event.price.toFixed(2) : event.price}
            </div>
            <div className="text-sm text-gray-500">per ticket</div>
          </div>

          {/* Book Button */}
          <Link to={`/event/${event.id}`}>
            <button
              disabled={event.available_seats === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                event.available_seats === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {event.available_seats === 0 ? 'Sold Out' : 'Book Now'}
            </button>
          </Link>
        </div>

        {/* Quick Info */}
        {event.available_seats > 0 && event.available_seats < 10 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 text-center">
              ⚠️ Only {event.available_seats} seats left!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;