const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2/promise');
const qr = require('qr-image');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// // Database connection
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'event_booking',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// Database connection with error handling and auto-initialization
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_booking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 0

   

});






// WebSocket for real-time seat updates
const seatLocks = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('lockSeats', async ({ eventId, seats }) => {
    try {
      const [result] = await pool.execute(
        'UPDATE events SET available_seats = available_seats - ? WHERE id = ? AND available_seats >= ?',
        [seats, eventId, seats]
      );

      if (result.affectedRows > 0) {
        seatLocks.set(socket.id, { eventId, seats, timestamp: Date.now() });
        socket.emit('seatsLocked', { success: true, seats });
        io.emit('seatUpdate', { eventId, seats });
      } else {
        socket.emit('seatsLocked', { success: false, message: 'Not enough seats available' });
      }
    } catch (error) {
      console.error('Seat locking error:', error);
    }
  });

  socket.on('releaseSeats', async ({ eventId, seats }) => {
    try {
      await pool.execute(
        'UPDATE events SET available_seats = available_seats + ? WHERE id = ?',
        [seats, eventId]
      );
      seatLocks.delete(socket.id);
      io.emit('seatUpdate', { eventId, seats });
    } catch (error) {
      console.error('Seat release error:', error);
    }
  });

  socket.on('disconnect', async () => {
    const lock = seatLocks.get(socket.id);
    if (lock) {
      try {
        await pool.execute(
          'UPDATE events SET available_seats = available_seats + ? WHERE id = ?',
          [lock.seats, lock.eventId]
        );
        seatLocks.delete(socket.id);
        io.emit('seatUpdate', { eventId: lock.eventId, seats: lock.seats });
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

// API Routes

// Get all events with search/filter
app.get('/api/events', async (req, res) => {
  try {
    const { search, location, date } = req.query;
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (date) {
      query += ' AND DATE(date) = DATE(?)';
      params.push(date);
    }

    query += ' ORDER BY date ASC';

    const [events] = await pool.execute(query, params);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single event
app.get('/api/events/:id', async (req, res) => {
  try {
    const [events] = await pool.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(events[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create event (admin)
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, location, date, total_seats, price, img } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO events (title, description, location, date, total_seats, available_seats, price, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, location, date, total_seats, total_seats, price, img]
    );
    
    const [newEvent] = await pool.execute('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(newEvent[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event (admin)
app.put('/api/events/:id', async (req, res) => {
  try {
    const { title, description, location, date, total_seats, price, img } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE events SET title = ?, description = ?, location = ?, date = ?, total_seats = ?, price = ?, img = ? WHERE id = ?',
      [title, description, location, date, total_seats, price, img, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const [updatedEvent] = await pool.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(updatedEvent[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete event (admin)
app.delete('/api/events/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Create booking
app.post('/api/bookings', async (req, res) => {
  console.log('Booking request received:', req.body);
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { event_id, name, email, mobile, quantity } = req.body;
    
    // Validate required fields
    if (!event_id || !name || !email || !mobile || !quantity) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: req.body 
      });
    }
    
    // Check if quantity is valid
    if (quantity <= 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    
    // Check event exists and get details
    const [events] = await connection.execute(
      'SELECT * FROM events WHERE id = ?',
      [event_id]
    );
    
    if (events.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = events[0];
    
    // Check seat availability
    if (event.available_seats < quantity) {
      await connection.rollback();
      return res.status(400).json({ 
        error: `Not enough seats available. Only ${event.available_seats} seats left.`,
        available_seats: event.available_seats 
      });
    }
    
    // Calculate total amount
    const total_amount = event.price * quantity;
    
    console.log('Creating booking with:', {
      event_id, name, email, mobile, quantity, total_amount
    });
    
    // Create booking
    const [bookingResult] = await connection.execute(
      'INSERT INTO bookings (event_id, name, email, mobile, quantity, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [event_id, name, email, mobile, quantity, total_amount]
    );
    
    const bookingId = bookingResult.insertId;
    console.log('Booking created with ID:', bookingId);
    
    // Update available seats
    await connection.execute(
      'UPDATE events SET available_seats = available_seats - ? WHERE id = ?',
      [quantity, event_id]
    );
    
    console.log('Seats updated for event:', event_id);
    
    // Create uploads directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate QR code
    const qr = require('qr-image');
    const qrData = `BOOKING-ID:${bookingId}|EVENT:${event_id}|NAME:${name}`;
    const qrCode = qr.imageSync(qrData, { type: 'png' });
    const qrFilename = `booking_${bookingId}.png`;
    const qrPath = path.join(uploadsDir, qrFilename);
    
    fs.writeFileSync(qrPath, qrCode);
    console.log('QR code saved at:', qrPath);
    
    const qrCodeUrl = `/uploads/${qrFilename}`;
    
    // Update booking with QR code URL
    await connection.execute(
      'UPDATE bookings SET qr_code_url = ? WHERE id = ?',
      [qrCodeUrl, bookingId]
    );
    
    await connection.commit();
    console.log('Transaction committed successfully');
    
    // Emit seat update via WebSocket
    if (io) {
      io.emit('seatUpdate', { eventId: event_id, seats: quantity });
    }
    
    // Get complete booking details
    const [newBooking] = await connection.execute(
      `SELECT b.*, e.title as event_title, e.date as event_date, e.location 
       FROM bookings b 
       JOIN events e ON b.event_id = e.id 
       WHERE b.id = ?`,
      [bookingId]
    );
    
    if (newBooking.length === 0) {
      throw new Error('Failed to retrieve booking details');
    }
    
    res.status(201).json({
      ...newBooking[0],
      qrCodeUrl
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Booking error details:', error);
    
    // More detailed error logging
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      console.error('Foreign key error: Event might not exist');
    } else if (error.code === 'ER_DATA_TOO_LONG') {
      console.error('Data too long for a column');
    } else if (error.code === 'ER_DUP_ENTRY') {
      console.error('Duplicate entry error');
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    connection.release();
  }
});

// // Get bookings by email
// app.get('/api/bookings', async (req, res) => {
//   try {
//     const { email } = req.query;
    
//     if (!email) {
//       return res.status(400).json({ error: 'Email parameter is required' });
//     }
    
//     console.log('Searching bookings for email:', email);
    
//     const [bookings] = await pool.execute(
//       `SELECT b.*, e.title as event_title, e.date as event_date, e.location
//        FROM bookings b
//        LEFT JOIN events e ON b.event_id = e.id
//        WHERE b.email = ?
//        ORDER BY b.booking_date DESC`,
//       [email]
//     );
    
//     console.log(`Found ${bookings.length} bookings for ${email}`);
    
//     if (bookings.length === 0) {
//       return res.status(404).json({
//         error: `No bookings found for email: ${email}`,
//         email: email
//       });
//     }
    
//     res.json(bookings);
//   } catch (error) {
//     console.error('Error fetching bookings:', error);
//     res.status(500).json({
//       error: 'Internal server error',
//       details: error.message
//     });
//   }
// });
app.get('/api/bookings', async (req, res) => {
  try {
    const { email, debug } = req.query;
    
    console.log('🔍 Booking search request:', { email, debug });
    
    if (debug === 'true') {
      // Debug mode: show all bookings
      const [allBookings] = await pool.execute(`
        SELECT 
          b.*,
          e.title as event_title,
          e.date as event_date,
          e.location
        FROM bookings b
        LEFT JOIN events e ON b.event_id = e.id
        ORDER BY b.booking_date DESC
      `);
      
      return res.json({
        debug: true,
        total: allBookings.length,
        all_bookings: allBookings,
        message: 'All bookings (debug mode)'
      });
    }
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required. Use ?email=your@email.com' 
      });
    }
    
    // Clean and normalize email
    const searchEmail = email.trim();
    
    console.log('📧 Searching for email:', searchEmail);
    
    // Try multiple search methods
    const [bookings] = await pool.execute(
      `SELECT 
        b.*,
        e.title as event_title,
        e.date as event_date,
        e.location,
        e.img as event_image
       FROM bookings b 
       LEFT JOIN events e ON b.event_id = e.id 
       WHERE b.email = ? OR LOWER(b.email) = LOWER(?) OR TRIM(b.email) = ?
       ORDER BY b.booking_date DESC`,
      [searchEmail, searchEmail, searchEmail]
    );
    
    console.log(`✅ Found ${bookings.length} bookings`);
    
    // If no results, try partial match
    if (bookings.length === 0 && searchEmail.includes('@')) {
      const emailParts = searchEmail.split('@');
      if (emailParts.length === 2) {
        const username = emailParts[0];
        const [partialMatches] = await pool.execute(
          `SELECT * FROM bookings WHERE email LIKE ?`,
          [`%${username}%@%`]
        );
        
        if (partialMatches.length > 0) {
          console.log(`🔎 Found ${partialMatches.length} partial matches`);
          return res.json({
            success: true,
            count: partialMatches.length,
            bookings: partialMatches,
            note: 'Partial email match found'
          });
        }
      }
    }
    
    res.json({
      success: true,
      count: bookings.length,
      bookings: bookings,
      searched_email: searchEmail
    });
    
  } catch (error) {
    console.error('❌ Booking search error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Search failed',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});