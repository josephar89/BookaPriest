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

// --- In-Memory Store for Route 3 WhatsApp Verification Challenges ---
const pendingWaChallenges = new Map();

// Helper to clean up expired challenges (older than 10 mins)
const cleanupExpiredChallenges = () => {
  const now = Date.now();
  for (const [code, item] of pendingWaChallenges.entries()) {
    if (item.expiresAt < now) {
      pendingWaChallenges.delete(code);
    }
  }
};
setInterval(cleanupExpiredChallenges, 60000);

// Admin WhatsApp Hotline number for Book a Priest
const HELPLINE_WHATSAPP = process.env.HELPLINE_WHATSAPP || '919999999999';

// 1. Request WhatsApp Verification Code & Link
app.post('/api/auth/wa-request-code', (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ error: 'Mobile number is required.' });
  }

  let digits = mobile.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length > 10 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(-10);
  if (digits.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }
  const canonicalMobile = `+91${digits}`;

  // Generate 4-digit numeric code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const challengeId = `wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Find if user already exists
  const existingUser = db.getUserByMobile(canonicalMobile);

  pendingWaChallenges.set(code, {
    challengeId,
    code,
    mobile: canonicalMobile,
    isExistingUser: !!existingUser,
    userId: existingUser ? existingUser.id : null,
    verified: false,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  const messageText = `Praise be Jesus! Verify my BookaPriest account: #${code}`;
  const waLink = `https://wa.me/${HELPLINE_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(messageText)}`;

  return res.json({
    challengeId,
    code,
    mobile: canonicalMobile,
    waLink,
    helpline: HELPLINE_WHATSAPP,
    messageText,
    isExistingUser: !!existingUser
  });
});

// 2. Poll Verification Status (called by frontend every 1.5s)
app.get('/api/auth/wa-check-status/:code', (req, res) => {
  const { code } = req.params;
  const challenge = pendingWaChallenges.get(code);

  if (!challenge) {
    return res.status(404).json({ error: 'Verification session expired or invalid.' });
  }

  if (challenge.verified) {
    let userResponse = null;
    if (challenge.userId) {
      const u = db.getUserById(challenge.userId);
      if (u) {
        const { password_hash, ...clean } = u;
        userResponse = clean;
      }
    }
    return res.json({
      verified: true,
      mobile: challenge.mobile,
      isExistingUser: challenge.isExistingUser,
      user: userResponse
    });
  }

  return res.json({ verified: false, mobile: challenge.mobile });
});

// 3. Confirm / Simulate WhatsApp verification (Triggered when WhatsApp message arrives or via direct 1-tap test)
app.post('/api/auth/wa-confirm', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Verification code is required.' });

  const challenge = pendingWaChallenges.get(String(code).trim());
  if (!challenge) {
    return res.status(404).json({ error: 'Code not found or expired.' });
  }

  challenge.verified = true;
  let userResponse = null;
  if (challenge.userId) {
    const u = db.getUserById(challenge.userId);
    if (u) {
      const { password_hash, ...clean } = u;
      userResponse = clean;
    }
  }

  return res.json({
    message: 'WhatsApp verification confirmed successfully!',
    verified: true,
    mobile: challenge.mobile,
    isExistingUser: challenge.isExistingUser,
    user: userResponse
  });
});

// 4. Complete Registration with WhatsApp-verified mobile
app.post('/api/auth/register-wa-verified', (req, res) => {
  const {
    code, name, title, congregation_abbr, mobile, email,
    diocese_province, clergy_type, religious_order,
    residence_name, residence_address, pincode,
    latitude, longitude, max_travel_km, transport_mode, dob, profile_photo
  } = req.body;

  const challenge = pendingWaChallenges.get(String(code).trim());
  if (!challenge || !challenge.verified) {
    return res.status(403).json({ error: 'WhatsApp mobile verification required before completing registration.' });
  }

  const cleanMob = challenge.mobile;
  if (db.getUserByMobile(cleanMob)) {
    return res.status(400).json({ error: 'An account with this mobile number already exists.' });
  }

  const fullAddress = pincode && !residence_address.includes(pincode)
    ? `${residence_address} - ${pincode}`
    : residence_address;

  try {
    const newUser = db.createUser({
      name: (name || '').trim(),
      title: title || (clergy_type === 'convent' || clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.'),
      congregation_abbr: congregation_abbr || '',
      mobile: cleanMob,
      email: email ? email.trim() : '',
      password: 'wa_verified_login',
      diocese_province: diocese_province || '',
      clergy_type: clergy_type || 'diocesan',
      religious_order: religious_order || '',
      residence_name: residence_name || '',
      residence_address: fullAddress || '',
      latitude,
      longitude,
      max_travel_km: max_travel_km || 25,
      transport_mode: transport_mode || 'own_bike',
      transport_modes: req.body.transport_modes || [transport_mode || 'own_bike'],
      profile_photo: profile_photo || null,
      dob: dob || null,
      is_verified: 0 // Mandatory Admin Manual Verification Required!
    });

    // Remove used challenge
    pendingWaChallenges.delete(String(code).trim());

    const { password_hash, ...userResponse } = newUser;
    return res.status(201).json({
      message: 'Registration successful! Your profile has been sent to the Diocesan Administrator for verification.',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to complete registration.' });
  }
});

// 5. Reset Password using WhatsApp-verified challenge
app.post('/api/auth/reset-password-wa', async (req, res) => {
  const { code, newPassword } = req.body;
  if (!code || !newPassword) {
    return res.status(400).json({ error: 'Verification code and new password are required.' });
  }

  const challenge = pendingWaChallenges.get(String(code).trim());
  if (!challenge || !challenge.verified) {
    return res.status(403).json({ error: 'WhatsApp verification required before resetting password.' });
  }

  const user = db.getUserByMobile(challenge.mobile);
  if (!user) {
    return res.status(404).json({ error: 'No user account found with this WhatsApp mobile number.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  await db.adminResetPassword(user.id, newPassword);
  pendingWaChallenges.delete(String(code).trim());

  return res.json({
    message: 'Password reset successfully! You can now sign in with your new password.',
    mobile: challenge.mobile
  });
});

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
      transport_mode: transport_mode || (Array.isArray(req.body.transport_modes) && req.body.transport_modes[0]) || 'own_bike',
      transport_modes: req.body.transport_modes || (transport_mode ? [transport_mode] : ['own_bike']),
      profile_photo: req.body.profile_photo || null,
      dob: req.body.dob || null
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
    profile_photo, about_me, social_links
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
  if (req.body.transport_modes !== undefined) {
    updates.transport_modes = Array.isArray(req.body.transport_modes) ? req.body.transport_modes : [req.body.transport_modes];
    if (!updates.transport_mode && updates.transport_modes.length > 0) {
      updates.transport_mode = updates.transport_modes[0];
    }
  }
  if (profile_photo !== undefined) updates.profile_photo = profile_photo;
  if (req.body.dob !== undefined) updates.dob = req.body.dob || null;
  if (about_me !== undefined) updates.about_me = about_me ? String(about_me).trim() : '';
  if (social_links !== undefined) updates.social_links = typeof social_links === 'object' ? social_links : {};
  if (req.body.liturgical_languages !== undefined) {
    updates.liturgical_languages = Array.isArray(req.body.liturgical_languages)
      ? req.body.liturgical_languages.filter(Boolean)
      : [String(req.body.liturgical_languages)];
  }

  try {
    const updated = await db.updateUser(user.id, updates);
    const { password_hash, ...userResponse } = updated;
    return res.json({ message: 'Profile updated successfully!', user: userResponse });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Toggle favorite minister for the logged in user
app.post('/api/users/favorites/toggle', authenticate, async (req, res) => {
  try {
    const { ministerId } = req.body;
    if (!ministerId) {
      return res.status(400).json({ error: 'Minister ID is required.' });
    }
    const user = db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let currentFavs = Array.isArray(user.favorite_ministers)
      ? [...user.favorite_ministers]
      : (typeof user.favorite_ministers === 'string'
          ? (() => { try { return JSON.parse(user.favorite_ministers); } catch(e) { return []; } })()
          : []);

    const targetId = Number(ministerId);
    const isFav = currentFavs.includes(targetId);
    if (isFav) {
      currentFavs = currentFavs.filter(id => id !== targetId);
    } else {
      currentFavs.push(targetId);
    }

    const updated = await db.updateUser(user.id, { favorite_ministers: currentFavs });
    const { password_hash, ...userResponse } = updated;
    return res.json({
      message: isFav ? 'Removed from favorites.' : 'Saved to favorites!',
      isFavorite: !isFav,
      favorite_ministers: currentFavs,
      user: userResponse
    });
  } catch (error) {
    console.error('Error toggling favorite minister:', error);
    return res.status(500).json({ error: 'Failed to update favorite minister.' });
  }
});

// Get list of all favorite ministers for the logged in user
app.get('/api/users/favorites', authenticate, (req, res) => {
  try {
    const user = db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const favIds = Array.isArray(user.favorite_ministers)
      ? user.favorite_ministers.map(Number)
      : (typeof user.favorite_ministers === 'string'
          ? (() => { try { return JSON.parse(user.favorite_ministers).map(Number); } catch(e) { return []; } })()
          : []);

    const userLat = req.user.latitude;
    const userLon = req.user.longitude;

    const favoriteMinisters = (db.data.users || [])
      .filter(u => favIds.includes(Number(u.id)))
      .map(u => {
        let distance_km = null;
        if (userLat && userLon && u.latitude && u.longitude) {
          distance_km = calculateDistanceKm(parseFloat(userLat), parseFloat(userLon), u.latitude, u.longitude);
        }
        return {
          id: u.id,
          priest_id: u.id,
          title: u.title || (u.clergy_type === 'convent' || u.clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.'),
          priest_title: u.title || (u.clergy_type === 'convent' || u.clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.'),
          name: u.name,
          priest_name: u.name,
          congregation_abbr: u.congregation_abbr || '',
          clergy_type: u.clergy_type,
          religious_order: u.religious_order,
          diocese_province: u.diocese_province,
          residence_name: u.residence_name,
          residence_address: u.residence_address || '',
          mobile: u.mobile,
          priest_mobile: u.mobile,
          email: u.email,
          priest_email: u.email,
          profile_photo: u.profile_photo || null,
          about_me: u.about_me || '',
          dob: u.dob || null,
          age: calculateAge(u.dob),
          social_links: u.social_links || {},
          transport_modes: u.transport_modes || [u.transport_mode || 'own_bike'],
          distance_km
        };
      });

    return res.json({ favorites: favoriteMinisters, count: favoriteMinisters.length });
  } catch (error) {
    console.error('Error fetching favorite ministers:', error);
    return res.status(500).json({ error: 'Failed to retrieve favorite ministers.' });
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
      transport_mode: transport_mode || (Array.isArray(req.body.transport_modes) && req.body.transport_modes[0]) || 'own_bike',
      transport_modes: req.body.transport_modes || (transport_mode ? [transport_mode] : ['own_bike']),
      profile_photo: profile_photo || null,
      dob: req.body.dob || null,
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

// --- Super-Admin Management API Endpoints ---

// Get all registered users (Priests, Sisters, Admins) with detailed statistics
app.get('/api/admin/users', authenticate, requireAdmin, (req, res) => {
  try {
    const users = db.getAllUsersForAdmin();
    return res.json(users);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return res.status(500).json({ error: 'Failed to fetch users list.' });
  }
});

// Admin update user details (phone, email, title, parish, diocese, admin, verification)
app.patch('/api/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const updated = await db.updateUser(userId, updates);
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    const { password_hash, ...cleanUser } = updated;
    return res.json({ message: 'User profile updated successfully.', user: cleanUser });
  } catch (error) {
    console.error('Admin error updating user:', error);
    return res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Admin reset user password
app.post('/api/admin/users/:id/reset-password', authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;
    const updated = await db.adminResetPassword(userId, newPassword);
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    return res.json({ message: `Password reset successfully for ${updated.name}.`, newPassword: newPassword || 'Jesus@123' });
  } catch (error) {
    console.error('Admin error resetting password:', error);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// Admin toggle user role (admin, verification)
app.post('/api/admin/users/:id/toggle-role', authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { field, value } = req.body;
    if (field !== 'is_admin' && field !== 'is_verified') {
      return res.status(400).json({ error: 'Invalid field to toggle.' });
    }
    const updated = await db.adminToggleRole(userId, field, value);
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    const { password_hash, ...cleanUser } = updated;
    return res.json({ message: `User ${field} set to ${value ? 1 : 0}.`, user: cleanUser });
  } catch (error) {
    console.error('Admin error toggling role:', error);
    return res.status(500).json({ error: 'Failed to toggle role.' });
  }
});

// Admin delete user account
app.delete('/api/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }
    const success = await db.adminDeleteUser(userId);
    if (!success) return res.status(404).json({ error: 'User not found.' });
    return res.json({ message: 'User account and associated roster slots deleted successfully.' });
  } catch (error) {
    console.error('Admin error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// Admin get all bookings across the diocese
app.get('/api/admin/bookings', authenticate, requireAdmin, (req, res) => {
  try {
    const allBookings = db.getAllBookingsForAdmin();
    return res.json(allBookings);
  } catch (error) {
    console.error('Admin error fetching bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// Admin override / update booking
app.patch('/api/admin/bookings/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updates = req.body;
    const updated = await db.adminOverrideBooking(bookingId, updates);
    if (!updated) return res.status(404).json({ error: 'Booking not found.' });
    return res.json({ message: 'Booking updated successfully.', booking: updated });
  } catch (error) {
    console.error('Admin error overriding booking:', error);
    return res.status(500).json({ error: 'Failed to override booking.' });
  }
});

// Admin delete / purge booking
app.delete('/api/admin/bookings/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const success = await db.adminDeleteBooking(bookingId);
    if (!success) return res.status(404).json({ error: 'Booking not found.' });
    return res.json({ message: 'Booking deleted successfully.' });
  } catch (error) {
    console.error('Admin error deleting booking:', error);
    return res.status(500).json({ error: 'Failed to delete booking.' });
  }
});

// Admin Raw Database Inspection & Health Stats
app.get('/api/admin/database/snapshot', authenticate, requireAdmin, (req, res) => {
  try {
    const snapshot = db.getDatabaseRawSnapshot();
    return res.json(snapshot);
  } catch (error) {
    console.error('Admin error getting DB snapshot:', error);
    return res.status(500).json({ error: 'Failed to get database snapshot.' });
  }
});

// Admin 1-Click Database JSON Backup Download
app.get('/api/admin/database/download-backup', authenticate, requireAdmin, (req, res) => {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `bookapriest_db_backup_${dateStr}.json`;
    const dataToExport = {
      exported_at: new Date().toISOString(),
      exported_by: req.user.name,
      stats: db.getDatabaseRawSnapshot().stats,
      data: {
        users: db.data.users.map(({ password_hash, ...u }) => u),
        bookings: db.data.bookings,
        availability_slots: db.data.availability_slots
      }
    };
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(dataToExport, null, 2));
  } catch (error) {
    console.error('Admin backup download error:', error);
    return res.status(500).json({ error: 'Failed to download backup.' });
  }
});

// Admin Raw Record Editor
app.patch('/api/admin/database/record', authenticate, requireAdmin, async (req, res) => {
  try {
    const { table, id, updates } = req.body;
    if (!table || !id || !updates) {
      return res.status(400).json({ error: 'Table, record ID, and updates are required.' });
    }
    const updated = await db.adminUpdateRawRecord(table, id, updates);
    if (!updated) return res.status(404).json({ error: 'Record or table not found.' });
    return res.json({ message: 'Database record updated successfully.', record: updated });
  } catch (error) {
    console.error('Admin error updating raw record:', error);
    return res.status(500).json({ error: 'Failed to update database record.' });
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

// Update an existing ministry request (before or after confirmation)
app.put('/api/bookings/:id', authenticate, requireVerification, async (req, res) => {
  const bookingId = req.params.id;
  const { datetime, datetime_end, location, language, honorarium, latitude, longitude, notes, service_type } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required.' });
  }

  try {
    const result = await db.updateBooking(bookingId, req.user.id, {
      datetime,
      datetime_end,
      location,
      latitude,
      longitude,
      language,
      honorarium,
      notes,
      service_type
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const noticeMsg = result.notified_count > 0
      ? `Ministry request updated. ${result.notified_count} responding minister(s) have been flagged with the changes.`
      : 'Ministry request updated successfully.';

    return res.json({
      message: noticeMsg,
      booking: result.booking,
      changes: result.changes || []
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ error: 'Failed to update ministry request.' });
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

// Helper to check if a service is pastoral / non-sacramental (open for Sisters & Priests)
// Category C: Pastoral Ministries
const isNonSacramentalService = (serviceType) => {
  if (!serviceType) return false;
  const s = serviceType.toLowerCase();
  return s.includes('catechism') || s.includes('sunday school') || s.includes('faith formation') ||
         s.includes('altar decoration') || s.includes('decoration') ||
         s.includes('anbiam') || s.includes('bcc') || s.includes('small christian community') ||
         s.includes('house visit') || s.includes('home visit') || s.includes('family visit') ||
         s.includes('communion to sick') || (s.includes('communion') && s.includes('sick')) ||
         s.includes('choir') || s.includes('choir animation');
};

// Offer Ministry for an open request
// - Ordained Priests (Fr.) can accept ALL ministry
// - Religious Nuns (Sr.) can accept designated NON-SACRAMENTAL ministry (Anbiam, House Visit, Catechism)
app.post('/api/bookings/offer', authenticate, requireVerification, async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required.' });
  }

  const booking = db.getBookingById(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Ministry request not found.' });
  }

  if (booking.status !== 'pending') {
    return res.status(400).json({ error: 'This ministry request is already filled.' });
  }

  if (booking.requester_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot offer ministry for your own request.' });
  }

  const isPriest = isPriestUser(req.user);
  const isSister = req.user.title === 'Sr.' || req.user.clergy_type === 'convent' || req.user.clergy_type === 'convent_sister';
  const isNonSacramental = isNonSacramentalService(booking.service_type);

  if (!isPriest) {
    if (!isSister || !isNonSacramental) {
      return res.status(403).json({
        error: 'Only ordained priests (Fr.) can accept sacramental celebration ministry. Sisters may lead or assist in non-sacramental ministries (Anbiam, House Visit, Catechism).'
      });
    }
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

// Withdraw tentative ministry offer before confirmation
app.post('/api/bookings/withdraw-offer', authenticate, requireVerification, async (req, res) => {
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

// Requester confirms a specific priest/sister who offered ministry (Ticket locked, contacts revealed)
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



