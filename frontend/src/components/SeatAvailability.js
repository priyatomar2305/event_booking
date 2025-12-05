import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import { Users } from 'lucide-react';

const SeatAvailability = ({ eventId, initialSeats, totalSeats }) => {
  const [availableSeats, setAvailableSeats] = useState(initialSeats);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('seatUpdate', ({ eventId: updatedEventId, seats }) => {
      if (updatedEventId === eventId) {
        setAvailableSeats(prev => Math.max(0, prev - seats));
      }
    });

    return () => {
      socket.off('seatUpdate');
    };
  }, [socket, eventId]);

  const percentage = (availableSeats / totalSeats) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-gray-700">
          <Users className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Seats Available</span>
        </div>
        <motion.span
          key={availableSeats}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="font-semibold text-gray-900"
        >
          {availableSeats}/{totalSeats}
        </motion.span>
      </div>
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${
            percentage > 50 ? 'bg-green-500' :
            percentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {availableSeats < 10 && availableSeats > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 font-medium"
        >
          ⚠️ Only {availableSeats} seats left!
        </motion.p>
      )}
      
      {availableSeats === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 font-medium"
        >
          🎫 Sold out!
        </motion.p>
      )}
    </div>
  );
};

export default SeatAvailability;