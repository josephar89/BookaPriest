import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { hashPassword } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (process.env.NODE_ENV === 'production' ? 8080 : 3001);


// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

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

// Helper to check if a user is an ordained priest (Fr.)
const isPriestUser = (user) => {
  if (!user) return false;
  const title = (user.title || '').trim();
  const cType = (user.clergy_type || '').trim().toLowerCase();
  if (title === 'Fr.') return true;
  if (title === 'Sr.' || title === 'Br.') return false;
  return cType === 'religious' || cType === 'diocesan' || cType === 'priest';
};

// Helper middleware to ensure the user is an ordained priest (Fr.)
const requirePriest = (req, res, next) => {
  if (!isPriestUser(req.user)) {
    return res.status(403).json({ error: 'Only ordained priests (Fr.) can accept or offer liturgical celebration ministry.' });
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
    name, title, congregation_abbr, mobile, email, password,
    diocese_province, clergy_type, religious_order,
    residence_name, residence_address,
    latitude, longitude, max_travel_km, transport_mode
  } = req.body;

  if (!name || !mobile || !password) {
    return res.status(400).json({ error: 'Name, mobile number, and password are required.' });
  }

  // Validate mobile format (+91 or numbers with at least 10 digits)
  let digits = mobile.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length > 10 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  if (digits.length !== 10) {
    return res.status(400).json({ error: 'Please provide a valid 10-digit mobile phone number.' });
  }
  const cleanedMobile = `+91${digits}`;

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
      title: title || (clergy_type === 'convent' || clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.'),
      congregation_abbr: congregation_abbr || '',
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
      transport_mode: transport_mode || 'own_bike',
      profile_photo: req.body.profile_photo || null
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

// Update User Profile (Photo, Name, Congregation, Contacts, Address, Location)
app.put('/api/users/profile', authenticate, async (req, res) => {
  const {
    name, title, congregation_abbr, mobile, email, clergy_type,
    religious_order, diocese_province,
    residence_name, residence_address,
    latitude, longitude, max_travel_km, transport_mode,
    profile_photo
  } = req.body;

  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Validate mobile if changed
  if (mobile && mobile !== user.mobile) {
    const cleanedMobile = mobile.replace(/[^0-9+]/g, '');
    if (cleanedMobile.length < 10) {
      return res.status(400).json({ error: 'Invalid mobile number.' });
    }
    const existingMobileUser = db.getUserByMobile(cleanedMobile);
    if (existingMobileUser && existingMobileUser.id !== user.id) {
      return res.status(400).json({ error: 'This mobile number is already registered by another account.' });
    }
  }

  // Validate email if changed
  if (email && email !== user.email) {
    const existingEmailUser = db.getUserByEmail(email);
    if (existingEmailUser && existingEmailUser.id !== user.id) {
      return res.status(400).json({ error: 'This email is already registered by another account.' });
    }
  }

  const updates = {};
  if (name !== undefined && name.trim()) updates.name = name.trim();
  if (title !== undefined && title.trim()) updates.title = title.trim();
  if (congregation_abbr !== undefined) updates.congregation_abbr = congregation_abbr.trim();
  if (mobile !== undefined && mobile.trim()) updates.mobile = mobile.replace(/[^0-9+]/g, '');
  if (email !== undefined) updates.email = email.trim();
  if (clergy_type !== undefined) updates.clergy_type = clergy_type;
  if (religious_order !== undefined) updates.religious_order = religious_order;
  if (diocese_province !== undefined) updates.diocese_province = diocese_province;
  if (residence_name !== undefined) updates.residence_name = residence_name;
  if (residence_address !== undefined) updates.residence_address = residence_address;
  if (latitude !== undefined) updates.latitude = latitude !== null ? parseFloat(latitude) : null;
  if (longitude !== undefined) updates.longitude = longitude !== null ? parseFloat(longitude) : null;
  if (max_travel_km !== undefined) updates.max_travel_km = parseInt(max_travel_km);
  if (transport_mode !== undefined) updates.transport_mode = transport_mode;
  if (profile_photo !== undefined) updates.profile_photo = profile_photo;

  try {
    const updated = await db.updateUser(user.id, updates);
    const { password_hash, ...userResponse } = updated;
    return res.json({ message: 'Profile updated successfully!', user: userResponse });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
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

// Direct Admin Onboarding (Registers and auto-verifies clergy or sisters on their behalf)
app.post('/api/admin/onboard-user', authenticate, requireAdmin, async (req, res) => {
  const {
    name, title, congregation_abbr, mobile, email, password,
    diocese_province, clergy_type, religious_order, residence_name, residence_address,
    pincode, latitude, longitude, max_travel_km, transport_mode, profile_photo
  } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({ error: 'Name and mobile number are required.' });
  }

  let digits = mobile.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length > 10 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  if (digits.length !== 10) {
    return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number.' });
  }
  const cleanedMobile = `+91${digits}`;

  if (db.getUserByMobile(cleanedMobile)) {
    return res.status(400).json({ error: 'An account with this mobile number already exists.' });
  }

  const assignedPassword = password && password.trim() ? password.trim() : 'Jesus@123';

  try {
    const newUser = await db.createUser({
      name: name.trim(),
      title: title || (clergy_type === 'convent' || clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.'),
      congregation_abbr: congregation_abbr || '',
      mobile: cleanedMobile,
      email: email || '',
      password: assignedPassword,
      diocese_province: diocese_province || '',
      clergy_type: clergy_type || 'diocesan',
      religious_order: religious_order || '',
      residence_name: residence_name || '',
      residence_address: residence_address || '',
      latitude,
      longitude,
      max_travel_km: max_travel_km || 25,
      transport_mode: transport_mode || 'own_bike',
      profile_photo: profile_photo || null,
      is_verified: 1 // Auto-verified by Administrator!
    });

    const { password_hash, ...userResponse } = newUser;
    return res.status(201).json({
      message: `${userResponse.title} ${userResponse.name} registered and verified successfully!`,
      user: userResponse,
      initialPassword: assignedPassword
    });
  } catch (error) {
    console.error('Admin direct onboarding error:', error);
    return res.status(500).json({ error: 'Failed to onboard user.' });
  }
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
app.post('/api/availability', authenticate, requireVerification, requirePriest, (req, res) => {
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

// Check priest's own current status (Available or Busy)
app.get('/api/availability/my-status', authenticate, (req, res) => {
  const { date } = req.query;
  const status = db.getPriestStatus(req.user.id, date);
  return res.json({ status, isAvailable: status === 'available' });
});

// 1-Tap Toggle: instantly switches priest between Available and Busy
app.post('/api/availability/toggle-status', authenticate, requireVerification, requirePriest, async (req, res) => {
  const { date } = req.body;

  try {
    const updatedSlot = await db.togglePriestStatus(req.user.id, date);
    const isNowAvailable = updatedSlot.status === 'available';
    return res.json({
      message: isNowAvailable ? 'You are now marked Available for ministry.' : 'You are now marked Busy / Offline.',
      status: updatedSlot.status,
      slot: updatedSlot
    });
  } catch (error) {
    console.error('Error toggling priest status:', error);
    return res.status(500).json({ error: 'Failed to update availability status.' });
  }
});

// Get all future busy/unavailable dates set by the logged in priest
app.get('/api/availability/my-unavailability', authenticate, (req, res) => {
  const pId = req.user.id;
  const busySlots = (db.data.availability_slots || []).filter(
    s => s.priest_id === pId && s.status === 'busy'
  );
  return res.json(busySlots);
});

// Remove / delete an unavailable date
app.delete('/api/availability/unavailable/:date', authenticate, requireVerification, async (req, res) => {
  const { date } = req.params;
  await db.clearPriestUnavailableDate(req.user.id, date);
  return res.json({ message: `Unavailability removed for ${date}` });
});

// Mark a specific date range and time period as unavailable / busy
app.post('/api/availability/unavailable', authenticate, requireVerification, async (req, res) => {
  const { startDate, endDate, date, startTime, endTime, notes } = req.body;
  const start = startDate || date;
  if (!start) {
    return res.status(400).json({ error: 'Start date is required to block out unavailable dates.' });
  }

  try {
    const slots = await db.setPriestUnavailableDate(req.user.id, {
      startDate: start,
      endDate: endDate || start,
      startTime: startTime || '00:00',
      endTime: endTime || '23:59',
      notes: notes || 'Unavailable / Personal Leave'
    });
    return res.json({
      message: `Marked as Unavailable / Busy from ${start}${endDate && endDate !== start ? ` to ${endDate}` : ''}.`,
      slots
    });
  } catch (error) {
    console.error('Error marking dates unavailable:', error);
    return res.status(500).json({ error: 'Failed to record unavailable dates.' });
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
  const { datetime, datetime_end, location, language, honorarium, latitude, longitude, notes, service_type } = req.body;

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
      datetime_end,
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

  // Check if Father is already locked for another celebration at this time
  const conflict = db.checkPriestTimeConflict(priestId, datetime, null);
  if (conflict) {
    const conflictDate = conflict.datetime.split('T')[0];
    const conflictTime = conflict.datetime.split('T')[1]?.slice(0, 5) || '';
    return res.status(400).json({
      error: `Conflict detected: Fr. ${responderPriest.name} is already confirmed for ${conflict.service_type || 'another celebration'} on ${conflictDate} at ${conflictTime}.`
    });
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

// Offer Ministry for an open request (Available Priest expresses willingness; request stays open)
app.post('/api/bookings/offer', authenticate, requireVerification, requirePriest, async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required.' });
  }

  const booking = db.getBookingById(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Liturgical request not found.' });
  }

  if (booking.status !== 'pending') {
    return res.status(400).json({ error: 'This liturgical request is already filled.' });
  }

  if (booking.requester_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot offer ministry for your own request.' });
  }

  try {
    const result = await db.applyForBooking(bookingId, req.user.id);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({
      message: 'Your offer for ministry has been submitted! The parish/convent will review and confirm.',
      booking: result.booking
    });
  } catch (error) {
    console.error('Error offering ministry for booking:', error);
    return res.status(500).json({ error: 'Failed to submit ministry offer.' });
  }
});

// Priest withdraws their tentative ministry offer before confirmation
app.post('/api/bookings/withdraw-offer', authenticate, requireVerification, requirePriest, async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required.' });
  }

  try {
    const result = await db.withdrawBookingOffer(bookingId, req.user.id);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({
      message: 'Your offer for this ministry has been withdrawn.',
      booking: result.booking
    });
  } catch (error) {
    console.error('Error withdrawing ministry offer:', error);
    return res.status(500).json({ error: 'Failed to withdraw offer.' });
  }
});

// Requester confirms a specific priest who offered ministry (Ticket locked, contacts revealed)
app.post('/api/bookings/confirm-applicant', authenticate, requireVerification, async (req, res) => {
  const { bookingId, priestId } = req.body;

  if (!bookingId || !priestId) {
    return res.status(400).json({ error: 'Booking ID and Priest ID are required.' });
  }

  try {
    const result = await db.confirmApplicant(bookingId, req.user.id, priestId);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({
      message: 'Priest confirmed! Contact details and WhatsApp have been unlocked.',
      booking: result.booking
    });
  } catch (error) {
    console.error('Error confirming applicant:', error);
    return res.status(500).json({ error: 'Failed to confirm priest.' });
  }
});

// Backward compatibility alias for single direct accept
app.post('/api/bookings/accept', authenticate, requireVerification, (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: 'Booking ID is required.' });
  try {
    const updatedBooking = db.acceptBooking(bookingId, req.user.id);
    return res.json({ message: 'Slot confirmed.', booking: updatedBooking });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to accept slot.' });
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

// Health check endpoint for Cloud Run container liveness probe
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'BookaPriest API', timestamp: new Date().toISOString() });
});

// Serve frontend static build files (for Production / Cloud Run)
app.use(express.static(distPath));

// SPA catch-all fallback (all non-API routes serve index.html) - Express 5 compatible
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});



// Start server - bind to 0.0.0.0 for containerized environments (Cloud Run)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ BookaPriest Server is live and listening on 0.0.0.0:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});



