import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { hashPassword } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper middleware to authenticate users using the simple Authorization header: "Bearer <user_id>"
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing.' });
  }

  const userId = authHeader.replace('Bearer ', '').trim();
  const user = db.getUserById(userId);

  if (!user) {
    return res.status(401).json({ error: 'Invalid authentication credentials.' });
  }

  req.user = user;
  next();
};

// Helper middleware to ensure the user is manually verified by the administrator
const requireVerification = (req, res, next) => {
  if (req.user.is_verified !== 1) {
    return res.status(403).json({ error: 'Your account is pending verification by the system administrator.' });
  }
  next();
};

// Helper middleware to ensure the user is an administrator
const requireAdmin = (req, res, next) => {
  if (req.user.is_admin !== 1) {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
};

// --- Auth Routes ---

app.post('/api/auth/register', (req, res) => {
  const {
    name, mobile, email, password,
    diocese_province, clergy_type, religious_order,
    residence_name, residence_address,
    latitude, longitude, max_travel_km, transport_mode
  } = req.body;

  if (!name || !mobile || !password) {
    return res.status(400).json({ error: 'Name, mobile number, and password are required.' });
  }

  // Validate mobile format (+91 or numbers with at least 10 digits)
  const cleanedMobile = mobile.replace(/[^0-9+]/g, '');
  if (cleanedMobile.length < 10) {
    return res.status(400).json({ error: 'Invalid mobile number. Please provide a valid phone number.' });
  }

  // Check unique constraints
  if (db.getUserByMobile(cleanedMobile)) {
    return res.status(400).json({ error: 'An account with this mobile number already exists.' });
  }

  if (email && db.getUserByEmail(email)) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  try {
    const newUser = db.createUser({
      name,
      mobile: cleanedMobile,
      email: email || '',
      password,
      diocese_province: diocese_province || '',
      clergy_type: clergy_type || 'diocesan',
      religious_order: religious_order || '',
      residence_name: residence_name || '',
      residence_address: residence_address || '',
      latitude,
      longitude,
      max_travel_km: max_travel_km || 25,
      transport_mode: transport_mode || 'own_bike'
    });

    const { password_hash, ...userResponse } = newUser;
    return res.status(201).json({ message: 'Registration submitted. Awaiting diocesan verification.', user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to complete registration due to database error.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { identifier, email, mobile, password } = req.body;

  const loginId = identifier || email || mobile;
  if (!loginId || !password) {
    return res.status(400).json({ error: 'Please enter your mobile/email and password.' });
  }

  // Find user by either email or mobile number
  let user = db.getUserByMobile(loginId);
  if (!user) {
    user = db.getUserByEmail(loginId);
  }

  if (!user) {
    return res.status(401).json({ error: 'No account found with this mobile number or email.' });
  }

  const inputHash = hashPassword(password);
  if (user.password_hash !== inputHash) {
    return res.status(401).json({ error: 'Incorrect credentials. Please verify your password.' });
  }

  const { password_hash, ...userResponse } = user;
  return res.json({ message: 'Login successful.', user: userResponse });
});

// Update Priest Profile (GPS location, travel radius, transport mode)
app.put('/api/users/profile', authenticate, (req, res) => {
  const {
    residence_name, residence_address,
    latitude, longitude, max_travel_km, transport_mode,
    religious_order, diocese_province
  } = req.body;

  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (residence_name !== undefined) user.residence_name = residence_name;
  if (residence_address !== undefined) user.residence_address = residence_address;
  if (latitude !== undefined) user.latitude = parseFloat(latitude);
  if (longitude !== undefined) user.longitude = parseFloat(longitude);
  if (max_travel_km !== undefined) user.max_travel_km = parseInt(max_travel_km);
  if (transport_mode !== undefined) user.transport_mode = transport_mode;
  if (religious_order !== undefined) user.religious_order = religious_order;
  if (diocese_province !== undefined) user.diocese_province = diocese_province;

  db.save();
  const { password_hash, ...userResponse } = user;
  return res.json({ message: 'Profile updated successfully.', user: userResponse });
});

// --- Admin Routes ---

// Get all users waiting for verification
app.get('/api/users/pending', authenticate, requireAdmin, (req, res) => {
  const pendingUsers = db.getUsers()
    .filter(u => u.is_verified === 0 && u.is_admin === 0)
    .map(({ password_hash, ...rest }) => rest);

  return res.json(pendingUsers);
});

// Toggle verification of a user
app.post('/api/users/verify', authenticate, requireAdmin, (req, res) => {
  const { userId, isVerified } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  const updatedUser = db.verifyUser(userId, isVerified);
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { password_hash, ...userResponse } = updatedUser;
  return res.json({
    message: `Priest account ${isVerified ? 'verified' : 'unverified'} successfully.`,
    user: userResponse
  });
});

// --- Availability Roster Routes ("Bike-Taxi" Mode) ---

// Get live available priests sorted by distance to caller
app.get('/api/availability', authenticate, (req, res) => {
  const { date, lat, lon } = req.query;
  const userLat = lat || req.user.latitude;
  const userLon = lon || req.user.longitude;

  try {
    const availableSlots = db.getAvailabilitySlots({
      date,
      lat: userLat,
      lon: userLon
    });
    return res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return res.status(500).json({ error: 'Failed to retrieve available priests.' });
  }
});

// Priest sets availability ("Go Available on this date")
app.post('/api/availability', authenticate, requireVerification, (req, res) => {
  const { date, time_start, time_end, languages, notes } = req.body;

  if (!date) {
    return res.status(400).json({ error: 'Date is required to set availability.' });
  }

  try {
    const slot = db.createOrUpdateAvailability({
      priest_id: req.user.id,
      date,
      time_start: time_start || '06:00',
      time_end: time_end || '12:00',
      languages: languages || ['English'],
      notes: notes || ''
    });

    return res.status(201).json({
      message: 'You are now marked available on the public roster!',
      slot
    });
  } catch (error) {
    console.error('Error setting availability:', error);
    return res.status(500).json({ error: 'Failed to set availability.' });
  }
});

// 1-Tap Quick Mark Busy: instantly toggles priest offline if verbally booked elsewhere
app.post('/api/availability/quick-busy', authenticate, requireVerification, (req, res) => {
  const { date } = req.body;

  try {
    db.setPriestBusy(req.user.id, date);
    return res.json({ message: 'You are now marked offline/busy. Your slot was removed from the live roster.' });
  } catch (error) {
    console.error('Error setting busy status:', error);
    return res.status(500).json({ error: 'Failed to update availability status.' });
  }
});

// --- Bookings Routes ---

// Get all booking slots
app.get('/api/bookings', authenticate, (req, res) => {
  try {
    const { lat, lon } = req.query;
    const userLat = lat || req.user.latitude;
    const userLon = lon || req.user.longitude;

    const bookings = db.getBookings(userLat, userLon);
    return res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
});

// Create a booking (Requesting Parish Priest or Convent Sister posts an open request)
app.post('/api/bookings', authenticate, requireVerification, (req, res) => {
  const { datetime, location, language, honorarium, latitude, longitude, notes, service_type } = req.body;

  if (!datetime || !location || !language) {
    return res.status(400).json({ error: 'Date/time, location, and language requirements are required.' });
  }

  if (new Date(datetime) < new Date()) {
    return res.status(400).json({ error: 'Booking date and time must be in the future.' });
  }

  try {
    const newBooking = db.createBooking({
      requester_id: req.user.id,
      datetime,
      location,
      latitude: latitude || req.user.latitude,
      longitude: longitude || req.user.longitude,
      language,
      honorarium,
      notes: notes || '',
      service_type: service_type || 'Holy Mass',
      booking_type: 'open_request'
    });

    return res.status(201).json({ message: 'Liturgical service request posted successfully.', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: 'Failed to post liturgical slot.' });
  }
});

// Direct booking from the Availability Roster ("Phone call verbal agreement confirmed")
app.post('/api/bookings/confirm-call', authenticate, requireVerification, (req, res) => {
  const { priestId, datetime, location, language, honorarium, notes, service_type } = req.body;

  if (!priestId || !datetime || !location) {
    return res.status(400).json({ error: 'Priest ID, datetime, and location are required to confirm booking.' });
  }

  const responderPriest = db.getUserById(priestId);
  if (!responderPriest) {
    return res.status(404).json({ error: 'Selected priest could not be found.' });
  }

  try {
    const newBooking = db.createBooking({
      requester_id: req.user.id,
      responder_id: parseInt(priestId),
      datetime,
      location,
      latitude: req.user.latitude,
      longitude: req.user.longitude,
      language: language || 'English',
      honorarium: honorarium || '',
      service_type: service_type || 'Holy Mass',
      notes: notes || 'Booked directly via phone call agreement',
      booking_type: 'direct_roster'
    });

    return res.status(201).json({
      message: `Booking with Fr. ${responderPriest.name} successfully confirmed and locked!`,
      booking: newBooking
    });
  } catch (error) {
    console.error('Error confirming direct booking:', error);
    return res.status(500).json({ error: 'Failed to confirm booking.' });
  }
});

// Accept an open slot from the broadcast board (Available Priest claims it)
app.post('/api/bookings/accept', authenticate, requireVerification, (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required.' });
  }

  const booking = db.getBookingById(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Liturgical slot not found.' });
  }

  if (booking.status !== 'pending') {
    return res.status(400).json({ error: 'This liturgical slot is no longer available.' });
  }

  if (booking.requester_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot accept your own liturgical slot.' });
  }

  try {
    const updatedBooking = db.acceptBooking(bookingId, req.user.id);
    return res.json({ message: 'Liturgical slot accepted successfully. WhatsApp contact unlocked!', booking: updatedBooking });
  } catch (error) {
    console.error('Error accepting booking:', error);
    return res.status(500).json({ error: 'Failed to accept liturgical slot.' });
  }
});

// Complete a liturgical slot
app.post('/api/bookings/complete', authenticate, requireVerification, (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required.' });
  }

  const booking = db.getBookingById(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Liturgical slot not found.' });
  }

  if (booking.requester_id !== req.user.id && booking.responder_id !== req.user.id) {
    return res.status(403).json({ error: 'You are not authorized to mark this slot as completed.' });
  }

  if (booking.status !== 'accepted') {
    return res.status(400).json({ error: 'Only accepted slots can be marked as completed.' });
  }

  try {
    const updatedBooking = db.completeBooking(bookingId);
    return res.json({ message: 'Liturgical celebration marked as completed.', booking: updatedBooking });
  } catch (error) {
    console.error('Error completing booking:', error);
    return res.status(500).json({ error: 'Failed to mark slot as completed.' });
  }
});

// Serve frontend static build files (for Production / Cloud Run)
app.use(express.static(distPath));

// Health check endpoint for Cloud Run
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'BookaPriest API', timestamp: new Date().toISOString() });
});

// SPA catch-all fallback (all non-API routes serve index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`BookaPriest Server running on port ${PORT}`);
});


