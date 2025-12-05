import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EventCard from '../components/EventCard';
import SearchFilter from '../components/SearchFilter';
import { MapPin, Calendar, Users } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const LandingPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/events');
      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    let filtered = [...events];

    if (filters.search) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.date) {
      filtered = filtered.filter(event =>
        new Date(event.date).toDateString() === new Date(filters.date).toDateString()
      );
    }

    setFilteredEvents(filtered);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-hero-pattern bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Unforgettable</span> Events
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-2xl text-gray-200">
                Book tickets for the most exciting events around you. Concerts, conferences, workshops and more.
              </p>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                  onClick={() => document.getElementById('events').scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Events
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-4xl font-bold mb-2">50+</h3>
              <p className="text-blue-100">Upcoming Events</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-4xl font-bold mb-2">10,000+</h3>
              <p className="text-blue-100">Happy Attendees</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-4xl font-bold mb-2">15+</h3>
              <p className="text-blue-100">Cities Worldwide</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover amazing events happening near you. From tech conferences to music festivals.
            </p>
          </motion.div>

          <SearchFilter onSearch={handleSearch} />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          )}

          {filteredEvents.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// export default LandingPage;
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { MapPin, Calendar, Users } from 'lucide-react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// // Import components safely
// let EventCard, SearchFilter;
// try {
//   EventCard = require('../components/EventCard').default;
// } catch {
//   EventCard = () => <div>EventCard Component Error</div>;
// }

// try {
//   SearchFilter = require('../components/SearchFilter').default;
// } catch {
//   SearchFilter = () => <div>SearchFilter Component Error</div>;
// }

// const LandingPage = () => {
//   const [events, setEvents] = useState([]);
//   const [filteredEvents, setFilteredEvents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('http://localhost:5000/api/events');
//       setEvents(response.data);
//       setFilteredEvents(response.data);
//     } catch (error) {
//       toast.error('Failed to load events');
//       console.error('Error fetching events:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (filters) => {
//     let filtered = [...events];

//     if (filters.search) {
//       filtered = filtered.filter(event =>
//         event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
//         event.description.toLowerCase().includes(filters.search.toLowerCase())
//       );
//     }

//     if (filters.location) {
//       filtered = filtered.filter(event =>
//         event.location.toLowerCase().includes(filters.location.toLowerCase())
//       );
//     }

//     if (filters.date) {
//       filtered = filtered.filter(event =>
//         new Date(event.date).toDateString() === new Date(filters.date).toDateString()
//       );
//     }

//     setFilteredEvents(filtered);
//   };

//   return (
//     <div className="min-h-screen">
//       {/* Hero Section */}
//       <section className="relative h-[60vh] overflow-hidden">
//         <div className="absolute inset-0 bg-blue-600">
//           <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
//         </div>
        
//         <div className="relative h-full flex items-center">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8 }}
//             >
//               <h1 className="text-4xl md:text-6xl font-bold mb-6">
//                 Experience Unforgettable Events
//               </h1>
//               <p className="text-xl mb-8 max-w-2xl">
//                 Book tickets for the most exciting events around you.
//               </p>
//               <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold">
//                 Explore Events
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Events Section */}
//       <section className="py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
//           </div>

//           <SearchFilter onSearch={handleSearch} />

//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
//               {filteredEvents.map((event, index) => (
//                 <EventCard key={event.id} event={event} />
//               ))}
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// };

export default LandingPage;