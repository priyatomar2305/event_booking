// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import {
//   Ticket,
//   Calendar,
//   MapPin,
//   Users,
//   Download,
//   Search,
//   Filter,
//   Clock,
//   Mail,
//   ArrowLeft
// } from 'lucide-react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// const MyBookings = () => {
//   const [bookings, setBookings] = useState([]);
//   const [filteredBookings, setFilteredBookings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState('');
//   const [tempEmail, setTempEmail] = useState(''); // Temporary email for input
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [hasSearched, setHasSearched] = useState(false);

//   useEffect(() => {
//     // Try to get email from localStorage
//     const savedEmail = localStorage.getItem('booking_email');
//     if (savedEmail) {
//       setEmail(savedEmail);
//       setTempEmail(savedEmail);
//       fetchBookings(savedEmail);
//     }
//   }, []);

//   const fetchBookings = async (userEmail) => {
//     if (!userEmail || !userEmail.includes('@')) {
//       toast.error('Please enter a valid email address');
//       return;
//     }

//     try {
//       setLoading(true);
//       setHasSearched(true);
//       const response = await axios.get(`http://localhost:5000/api/bookings?email=${encodeURIComponent(userEmail)}`);
//       setBookings(response.data);
//       setFilteredBookings(response.data);
//       setEmail(userEmail);
//       setTempEmail(userEmail);
//       localStorage.setItem('booking_email', userEmail);
//       toast.success(`Found ${response.data.length} bookings`);
//     } catch (error) {
//       if (error.response?.status === 404 || error.response?.data?.error?.includes('No bookings')) {
//         setBookings([]);
//         setFilteredBookings([]);
//         toast('No bookings found for this email');
//       } else {
//         toast.error('Failed to load bookings');
//         console.error('Error fetching bookings:', error);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEmailSubmit = (e) => {
//     e.preventDefault();
//     if (!tempEmail.trim()) {
//       toast.error('Please enter your email');
//       return;
//     }
//     if (!tempEmail.includes('@') || !tempEmail.includes('.')) {
//       toast.error('Please enter a valid email address');
//       return;
//     }
//     fetchBookings(tempEmail.trim());
//   };

//   const handleSearch = () => {
//     let filtered = [...bookings];

//     if (searchTerm.trim()) {
//       filtered = filtered.filter(booking =>
//         booking.event_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         booking.id?.toString().includes(searchTerm) ||
//         booking.name?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(booking => booking.status === statusFilter);
//     }

//     setFilteredBookings(filtered);
//   };

//   useEffect(() => {
//     if (bookings.length > 0) {
//       handleSearch();
//     }
//   }, [searchTerm, statusFilter, bookings]);

//   const handleDownloadTicket = (booking) => {
//     if (booking.qr_code_url) {
//       const link = document.createElement('a');
//       link.href = `http://localhost:5000${booking.qr_code_url}`;
//       link.download = `ticket-${booking.id}.png`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       toast.success('Ticket downloaded!');
//     } else {
//       toast.error('QR code not available');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         weekday: 'short',
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch {
//       return dateString;
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'confirmed':
//         return 'bg-green-100 text-green-800';
//       case 'cancelled':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const clearEmail = () => {
//     setEmail('');
//     setTempEmail('');
//     setBookings([]);
//     setFilteredBookings([]);
//     setHasSearched(false);
//     localStorage.removeItem('booking_email');
//     toast('Email cleared. Enter a new email to search bookings.');
//   };

//   // If no email is set, show email input form
//   if (!email && !hasSearched) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
//         <div className="max-w-md mx-auto px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-white rounded-2xl shadow-xl p-8"
//           >
//             <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Ticket className="h-10 w-10 text-blue-600" />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">View Your Bookings</h1>
//             <p className="text-gray-600 mb-8 text-center">
//               Enter your email address to view all your bookings
//             </p>
            
//             <form onSubmit={handleEmailSubmit} className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                   <input
//                     type="email"
//                     value={tempEmail}
//                     onChange={(e) => setTempEmail(e.target.value)}
//                     placeholder="Enter your email address"
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                     required
//                   />
//                 </div>
//                 <p className="text-sm text-gray-500 mt-2">
//                   Use the same email you used for booking
//                 </p>
//               </div>
              
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? 'Searching...' : 'View My Bookings'}
//               </button>
              
//               <div className="text-center">
//                 <button
//                   type="button"
//                   onClick={() => window.history.back()}
//                   className="text-gray-600 hover:text-gray-800 flex items-center justify-center mx-auto"
//                 >
//                   <ArrowLeft className="h-4 w-4 mr-2" />
//                   Back to Events
//                 </button>
//               </div>
//             </form>
//           </motion.div>
          
//           {/* Info Section */}
//           <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
//             <h3 className="font-semibold text-gray-800 mb-3">How to use:</h3>
//             <ul className="space-y-2 text-sm text-gray-600">
//               <li className="flex items-start">
//                 <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-3"></div>
//                 Enter the exact email you used when booking tickets
//               </li>
//               <li className="flex items-start">
//                 <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-3"></div>
//                 You'll see all bookings made with that email
//               </li>
//               <li className="flex items-start">
//                 <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-3"></div>
//                 Download QR code tickets for entry
//               </li>
//               <li className="flex items-start">
//                 <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-3"></div>
//                 View booking details and event information
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Main bookings view
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
//               <p className="text-gray-600">
//                 View and manage all your event bookings
//               </p>
//             </div>
//             <button
//               onClick={clearEmail}
//               className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
//             >
//               Use Different Email
//             </button>
//           </div>
          
//           {/* Email Display */}
//           <div className="bg-white rounded-xl p-4 mb-6 shadow">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <Mail className="h-5 w-5 text-gray-500 mr-3" />
//                 <div>
//                   <div className="text-sm text-gray-500">Viewing bookings for</div>
//                   <div className="font-semibold text-gray-800">{email}</div>
//                 </div>
//               </div>
//               <div className="text-sm text-gray-500">
//                 {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filter - Only show if we have bookings */}
//         {bookings.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-white rounded-2xl shadow-lg p-6 mb-8"
//           >
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Bookings</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Search Input */}
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <input
//                   type="text"
//                   placeholder="Search by event name, booking ID, or name..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 />
//               </div>

//               {/* Status Filter */}
//               <div className="relative">
//                 <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="confirmed">Confirmed</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </div>

//               {/* Clear Filters Button */}
//               <button
//                 onClick={() => {
//                   setSearchTerm('');
//                   setStatusFilter('all');
//                 }}
//                 className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {/* Loading State */}
//         {loading && (
//           <div className="flex justify-center items-center h-64">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//               <p className="text-gray-600">Loading your bookings...</p>
//             </div>
//           </div>
//         )}

//         {/* Bookings List */}
//         {!loading && filteredBookings.length === 0 && hasSearched && (
//           <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
//             <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
//             <p className="text-gray-500 mb-6">
//               {bookings.length === 0
//                 ? `No bookings found for email: ${email}`
//                 : "No bookings match your search criteria"}
//             </p>
//             {bookings.length === 0 && (
//               <div className="space-y-3">
//                 <button
//                   onClick={clearEmail}
//                   className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold mr-3"
//                 >
//                   Try Different Email
//                 </button>
//                 <button
//                   onClick={() => window.location.href = '/'}
//                   className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold"
//                 >
//                   Browse Events
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Display Bookings */}
//         {!loading && filteredBookings.length > 0 && (
//           <>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//               {filteredBookings.map((booking, index) => (
//                 <motion.div
//                   key={booking.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.05 }}
//                   className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
//                 >
//                   {/* Booking Header */}
//                   <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <div className="flex items-center mb-2">
//                           <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
//                             {booking.status?.toUpperCase() || 'CONFIRMED'}
//                           </span>
//                           <span className="ml-4 text-gray-500 text-sm">
//                             ID: #{booking.id}
//                           </span>
//                         </div>
//                         <h3 className="text-xl font-bold text-gray-900">
//                           {booking.event_title || 'Event'}
//                         </h3>
//                       </div>
//                       <span className="text-2xl font-bold text-blue-600">
//                         ${parseFloat(booking.total_amount || 0).toFixed(2)}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Booking Details */}
//                   <div className="p-6">
//                     <div className="grid grid-cols-2 gap-4 mb-6">
//                       <div className="flex items-center text-gray-700">
//                         <Calendar className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
//                         <div>
//                           <div className="text-sm text-gray-500">Event Date</div>
//                           <div className="font-medium">{formatDate(booking.event_date)}</div>
//                         </div>
//                       </div>
//                       <div className="flex items-center text-gray-700">
//                         <MapPin className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
//                         <div>
//                           <div className="text-sm text-gray-500">Location</div>
//                           <div className="font-medium">{booking.location || 'N/A'}</div>
//                         </div>
//                       </div>
//                       <div className="flex items-center text-gray-700">
//                         <Users className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
//                         <div>
//                           <div className="text-sm text-gray-500">Tickets</div>
//                           <div className="font-medium">{booking.quantity || 0} tickets</div>
//                         </div>
//                       </div>
//                       <div className="flex items-center text-gray-700">
//                         <Clock className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
//                         <div>
//                           <div className="text-sm text-gray-500">Booked On</div>
//                           <div className="font-medium">{formatDate(booking.booking_date)}</div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex justify-between items-center pt-6 border-t">
//                       <div className="text-sm text-gray-500">
//                         Booked by: <span className="font-medium">{booking.name}</span>
//                       </div>
//                       <div className="flex space-x-3">
//                         {booking.qr_code_url && (
//                           <button
//                             onClick={() => handleDownloadTicket(booking)}
//                             className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
//                           >
//                             <Download className="h-4 w-4 mr-2" />
//                             Download Ticket
//                           </button>
//                         )}
//                         <button
//                           onClick={() => window.open(`/event/${booking.event_id}`, '_blank')}
//                           className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
//                         >
//                           View Event
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>

//             {/* Stats */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="grid grid-cols-1 md:grid-cols-3 gap-6"
//             >
//               <div className="bg-white rounded-2xl p-6 shadow">
//                 <div className="text-3xl font-bold text-blue-600 mb-2">
//                   {bookings.length}
//                 </div>
//                 <div className="text-gray-600">Total Bookings</div>
//               </div>
//               <div className="bg-white rounded-2xl p-6 shadow">
//                 <div className="text-3xl font-bold text-green-600 mb-2">
//                   {bookings.filter(b => b.status === 'confirmed').length}
//                 </div>
//                 <div className="text-gray-600">Confirmed</div>
//               </div>
//               <div className="bg-white rounded-2xl p-6 shadow">
//                 <div className="text-3xl font-bold text-gray-600 mb-2">
//                   ${bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0).toFixed(2)}
//                 </div>
//                 <div className="text-gray-600">Total Spent</div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyBookings;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Users, 
  Download, 
  Search,
  Filter,
  Clock,
  Mail,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  Printer,
  Share2,
  BarChart3,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Loader2,
  Star,
  Shield
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    cancelled: 0,
    totalSpent: 0
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('booking_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setTempEmail(savedEmail);
      fetchBookings(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      updateStats();
      handleSearch();
    }
  }, [bookings, searchTerm, statusFilter]);

  const updateStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const totalSpent = bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
    
    setStats({ total, confirmed, cancelled, totalSpent });
  };

  const fetchBookings = async (userEmail) => {
    if (!userEmail || !userEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      
      const response = await axios.get(`http://localhost:5000/api/bookings?email=${encodeURIComponent(userEmail)}`);
      
      const bookingsData = response.data.bookings || response.data || [];
      
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      setEmail(userEmail);
      setTempEmail(userEmail);
      localStorage.setItem('booking_email', userEmail);
      
      if (bookingsData.length === 0) {
        toast('No bookings found for this email', {
          icon: '🔍',
          style: {
            background: '#FEF3C7',
            color: '#92400E'
          }
        });
      } else {
        toast.success(`🎉 Found ${bookingsData.length} booking${bookingsData.length !== 1 ? 's' : ''}!`, {
          style: {
            background: '#D1FAE5',
            color: '#065F46'
          }
        });
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!tempEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }
    fetchBookings(tempEmail.trim());
  };

  const handleSearch = () => {
    let filtered = [...bookings];

    if (searchTerm.trim()) {
      filtered = filtered.filter(booking =>
        booking.event_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id?.toString().includes(searchTerm) ||
        booking.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleDownloadTicket = (booking) => {
    if (booking.qr_code_url) {
      const link = document.createElement('a');
      link.href = `http://localhost:5000${booking.qr_code_url}`;
      link.download = `ticket-${booking.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Ticket downloaded successfully! 🎫');
    } else {
      toast.error('QR code not available for this booking');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          text: 'text-green-700',
          icon: CheckCircle,
          badge: 'bg-gradient-to-r from-green-500 to-emerald-500',
          label: 'Confirmed'
        };
      case 'cancelled':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          text: 'text-red-700',
          icon: XCircle,
          badge: 'bg-gradient-to-r from-red-500 to-rose-500',
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
          text: 'text-gray-700',
          icon: Clock,
          badge: 'bg-gradient-to-r from-gray-500 to-slate-500',
          label: 'Pending'
        };
    }
  };

  const clearEmail = () => {
    setEmail('');
    setTempEmail('');
    setBookings([]);
    setFilteredBookings([]);
    setHasSearched(false);
    localStorage.removeItem('booking_email');
    toast('Email cleared. Enter a new email to search bookings.', {
      icon: '🔄'
    });
  };

  // Email Input Screen
  if (!email && !hasSearched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl shadow-2xl mb-6">
              <Ticket className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              My Bookings
            </h1>
            <p className="text-gray-600 text-xl">
              Access all your event bookings in one place
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
          >
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Find Your Bookings</h2>
                <p className="text-gray-600">Enter the email you used for booking</p>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg transition-all"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-3" />
                    View My Bookings
                  </>
                )}
              </motion.button>

              <div className="text-center pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </button>
              </div>
            </form>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">🎫</div>
                <div className="font-semibold text-gray-800">All Bookings</div>
                <div className="text-sm text-gray-600">View complete history</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">📱</div>
                <div className="font-semibold text-gray-800">Mobile Tickets</div>
                <div className="text-sm text-gray-600">Access on the go</div>
              </div>
              <div className="p-4 bg-pink-50 rounded-xl">
                <div className="text-2xl font-bold text-pink-600">🔄</div>
                <div className="font-semibold text-gray-800">Easy Management</div>
                <div className="text-sm text-gray-600">Cancel or modify</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center text-gray-500"
          >
            <p className="flex items-center justify-center">
              <Shield className="h-4 w-4 mr-2" />
              Your email is only used to fetch bookings and is not stored
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Bookings Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
              <p className="text-blue-100">
                Manage all your event tickets in one place
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-blue-200">Viewing bookings for</div>
                  <div className="font-semibold truncate max-w-xs">{email}</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearEmail}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Change Email
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            {
              label: 'Total Bookings',
              value: stats.total,
              icon: Ticket,
              color: 'from-blue-500 to-cyan-500',
              bg: 'bg-gradient-to-r from-blue-50 to-cyan-50'
            },
            {
              label: 'Confirmed',
              value: stats.confirmed,
              icon: CheckCircle,
              color: 'from-green-500 to-emerald-500',
              bg: 'bg-gradient-to-r from-green-50 to-emerald-50'
            },
            {
              label: 'Total Spent',
              value: `$${stats.totalSpent.toFixed(2)}`,
              icon: BarChart3,
              color: 'from-purple-500 to-pink-500',
              bg: 'bg-gradient-to-r from-purple-50 to-pink-50'
            },
            {
              label: 'Events Attended',
              value: stats.confirmed,
              icon: Star,
              color: 'from-amber-500 to-orange-500',
              bg: 'bg-gradient-to-r from-amber-50 to-orange-50'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bg} rounded-2xl p-6 shadow-lg border border-white/50`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <Sparkles className="h-5 w-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Search & Filter</h2>
              <p className="text-gray-600">Find specific bookings quickly</p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                List View
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by event, booking ID, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </button>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
            />
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredBookings.length === 0 && hasSearched && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12 text-center shadow-lg"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Bookings Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {bookings.length === 0 
                ? `We couldn't find any bookings for "${email}". Make sure you're using the correct email.`
                : "No bookings match your search criteria. Try adjusting your filters."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {bookings.length === 0 && (
                <>
                  <button
                    onClick={clearEmail}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Try Different Email
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Browse Events
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Bookings Grid */}
        {!loading && filteredBookings.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredBookings.map((booking, index) => {
                const status = getStatusConfig(booking.status);
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${status.bg} rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
                  >
                    {/* Header */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <span className={`px-3 py-1 ${status.badge} text-white text-xs font-semibold rounded-full`}>
                              {status.label}
                            </span>
                            <span className="ml-3 text-sm text-gray-500">#{booking.id}</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {booking.event_title || 'Event'}
                          </h3>
                        </div>
                        <StatusIcon className={`h-6 w-6 ${status.text}`} />
                      </div>

                      {/* Event Image */}
                      <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl mb-4 overflow-hidden">
                        {booking.event_image ? (
                          <img
                            src={booking.event_image}
                            alt={booking.event_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Ticket className="h-16 w-16 text-white/50" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                          <span className="text-sm">{formatDate(booking.event_date)}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <MapPin className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                          <span className="text-sm">{booking.location || 'Online Event'}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Users className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                          <span className="text-sm">{booking.quantity} ticket{booking.quantity !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${parseFloat(booking.total_amount || 0).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">Total Amount</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Booked on</div>
                          <div className="text-sm font-medium">{formatDate(booking.booking_date)}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownloadTicket(booking)}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Ticket
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open(`/event/${booking.event_id}`, '_blank')}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Bookings List View */}
        {!loading && filteredBookings.length > 0 && viewMode === 'list' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-gray-700 font-semibold">Event</th>
                    <th className="py-4 px-6 text-left text-gray-700 font-semibold">Date</th>
                    <th className="py-4 px-6 text-left text-gray-700 font-semibold">Tickets</th>
                    <th className="py-4 px-6 text-left text-gray-700 font-semibold">Amount</th>
                    <th className="py-4 px-6 text-left text-gray-700 font-semibold">Status</th>
                    <th className="py-4 px-6 text-left text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {filteredBookings.map((booking, index) => {
                      const status = getStatusConfig(booking.status);
                      return (
                        <motion.tr
                          key={booking.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-4">
                                <Ticket className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{booking.event_title}</div>
                                <div className="text-sm text-gray-500">{booking.location}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-gray-700">{formatDate(booking.event_date)}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium">{booking.quantity}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900">
                              ${parseFloat(booking.total_amount || 0).toFixed(2)}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 ${status.badge} text-white text-xs font-semibold rounded-full`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDownloadTicket(booking)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download Ticket"
                              >
                                <Download className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => window.open(`/event/${booking.event_id}`, '_blank')}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Event"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="More options"
                              >
                                <ChevronRight className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Pagination (if needed) */}
        {filteredBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-between items-center"
          >
            <div className="text-gray-600">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Previous
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;