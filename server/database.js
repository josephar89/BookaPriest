import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@libsql/client';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Connect to Turso Cloud Client if credentials exist
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let tursoClient = null;
if (tursoUrl && tursoAuthToken) {
  try {
    tursoClient = createClient({ url: tursoUrl, authToken: tursoAuthToken });
    console.log('⚡ Turso Cloud Database client initialized.');
  } catch (err) {
    console.error('Warning: Turso client initialization failed, falling back to local file.', err);
  }
}

// Helper to hash password using Node's built-in crypto (SHA256) - zero dependencies
export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Zero-cost Haversine formula to calculate distance in kilometers between two GPS coordinates
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null ||
      lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place (e.g. 4.2 km)
}

// Calculate age from YYYY-MM-DD date of birth
export function calculateAge(dob) {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

class RelationalDatabase {
  constructor() {
    this.data = {
      users: [],
      bookings: [],
      availability_slots: []
    };
    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          users: parsed.users || [],
          bookings: parsed.bookings || [],
          availability_slots: parsed.availability_slots || []
        };
      } catch (e) {
        console.error('Error parsing local db cache:', e);
      }
    }
    this.init();
  }

  async init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        try {
          const fileContent = fs.readFileSync(DB_FILE, 'utf8');
          const parsed = JSON.parse(fileContent);
          this.data = {
            users: parsed.users || [],
            bookings: parsed.bookings || [],
            availability_slots: parsed.availability_slots || []
          };
        } catch (e) {
          console.error('Error parsing local db cache:', e);
        }
      }

      // If Turso Cloud DB is active, sync newest records from cloud
      if (tursoClient) {
        await this.syncFromTurso();
      } else if (!fs.existsSync(DB_FILE)) {
        this.saveLocal();
        this.seed();
      }

    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  async syncFromTurso() {
    try {
      // Ensure optional columns exist in Turso if not already created
      try {
        await tursoClient.execute('ALTER TABLE users ADD COLUMN profile_photo TEXT');
      } catch (e) {
        // Column likely already exists
      }
      try {
        await tursoClient.execute("ALTER TABLE users ADD COLUMN title TEXT DEFAULT 'Fr.'");
      } catch (e) {
        // Column likely already exists
      }
      try {
        await tursoClient.execute('ALTER TABLE users ADD COLUMN congregation_abbr TEXT');
      } catch (e) {
        // Column likely already exists
      }
      try {
        await tursoClient.execute('ALTER TABLE bookings ADD COLUMN datetime_end TEXT');
      } catch (e) {
        // Column likely already exists
      }
      try {
        await tursoClient.execute('ALTER TABLE users ADD COLUMN dob TEXT');
      } catch (e) {
        // Column likely already exists
      }
      try {
        await tursoClient.execute('ALTER TABLE users ADD COLUMN transport_modes TEXT');
      } catch (e) {
        // Column likely already exists
      }
      try {
        await tursoClient.execute('ALTER TABLE users ADD COLUMN about_me TEXT');
      } catch (e) {
        // Column likely already exists
      }
      try {
        await tursoClient.execute('ALTER TABLE users ADD COLUMN social_links TEXT');
      } catch (e) {
        // Column likely already exists
      }
      try {
        await tursoClient.execute('ALTER TABLE users ADD COLUMN favorite_ministers TEXT');
      } catch (e) {
        // Column likely already exists
      }
      try {
        await tursoClient.execute('ALTER TABLE users ADD COLUMN liturgical_languages TEXT');
      } catch (e) {
        // Column likely already exists
      }
      try {
        await tursoClient.execute('ALTER TABLE bookings ADD COLUMN edit_history TEXT');
      } catch (e) {
        // Column likely already exists
      }

      const usersRs = await tursoClient.execute('SELECT * FROM users');
      const slotsRs = await tursoClient.execute('SELECT * FROM availability_slots');
      const bookingsRs = await tursoClient.execute('SELECT * FROM bookings');

      // Merge Turso users with local users (keeping local test users if not in Turso)
      const tursoUserIds = new Set(usersRs.rows.map(r => Number(r.id)));
      const localUsersToKeep = (this.data.users || []).filter(u => !tursoUserIds.has(Number(u.id)));

      this.data.users = [
        ...usersRs.rows.map(r => ({
          ...r,
          id: Number(r.id),
          title: r.title || (r.clergy_type === 'convent' || r.clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.'),
          congregation_abbr: r.congregation_abbr || '',
          is_verified: Number(r.is_verified),
          is_admin: Number(r.is_admin),
          max_travel_km: Number(r.max_travel_km || 25),
          transport_mode: r.transport_mode || 'own_bike',
          transport_modes: typeof r.transport_modes === 'string'
            ? (() => { try { return JSON.parse(r.transport_modes); } catch(e) { return [r.transport_mode || 'own_bike']; } })()
            : (Array.isArray(r.transport_modes) ? r.transport_modes : [r.transport_mode || 'own_bike']),
          latitude: r.latitude !== null ? Number(r.latitude) : null,
          longitude: r.longitude !== null ? Number(r.longitude) : null,
          profile_photo: r.profile_photo || null,
          dob: r.dob || null,
          about_me: r.about_me || '',
          social_links: typeof r.social_links === 'string'
            ? (() => { try { return JSON.parse(r.social_links); } catch(e) { return {}; } })()
            : (r.social_links || {}),
          favorite_ministers: typeof r.favorite_ministers === 'string'
            ? (() => { try { return JSON.parse(r.favorite_ministers); } catch(e) { return []; } })()
            : (Array.isArray(r.favorite_ministers) ? r.favorite_ministers : []),
          liturgical_languages: typeof r.liturgical_languages === 'string'
            ? (() => { try { return JSON.parse(r.liturgical_languages); } catch(e) { return ['English', 'Tamil']; } })()
            : (Array.isArray(r.liturgical_languages) && r.liturgical_languages.length > 0 ? r.liturgical_languages : ['English', 'Tamil'])
        })),
        ...localUsersToKeep
      ];

      this.data.availability_slots = slotsRs.rows.map(r => ({
        ...r,
        id: Number(r.id),
        priest_id: Number(r.priest_id),
        languages: typeof r.languages === 'string' ? JSON.parse(r.languages || '[]') : r.languages
      }));

      // Merge Turso bookings with local bookings (keeping local test bookings if not in Turso)
      const tursoBookingIds = new Set(bookingsRs.rows.map(r => Number(r.id)));
      const localBookingsToKeep = (this.data.bookings || []).filter(b => !tursoBookingIds.has(Number(b.id)));

      this.data.bookings = [
        ...bookingsRs.rows.map(r => {
          const localExisting = (this.data.bookings || []).find(b => b.id === Number(r.id));
          return {
            ...r,
            id: Number(r.id),
            requester_id: Number(r.requester_id),
            responder_id: r.responder_id !== null ? Number(r.responder_id) : null,
            latitude: r.latitude !== null ? Number(r.latitude) : null,
            longitude: r.longitude !== null ? Number(r.longitude) : null,
            applicants: localExisting ? (localExisting.applicants || []) : (r.applicants ? JSON.parse(r.applicants) : []),
            edit_history: localExisting && localExisting.edit_history ? localExisting.edit_history : (r.edit_history ? (typeof r.edit_history === 'string' ? JSON.parse(r.edit_history) : r.edit_history) : [])
          };
        }),
        ...localBookingsToKeep
      ];

      this.saveLocal();
      console.log(`☁️ Synced from Turso Cloud: ${this.data.users.length} users, ${this.data.availability_slots.length} slots, ${this.data.bookings.length} bookings.`);
    } catch (err) {
      console.error('Failed syncing from Turso:', err);
    }
  }

  saveLocal() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to write local database file:', error);
    }
  }

  seed() {
    console.log('Seeding database with default admin...');
    const adminUser = {
      id: 1,
      name: 'System Administrator',
      mobile: '+919999999999',
      email: 'admin@bookapriest.in',
      diocese_province: 'Archdiocese of Madras-Mylapore',
      clergy_type: 'diocesan',
      religious_order: null,
      residence_name: 'Archbishop House, Santhome',
      residence_address: 'Santhome, Chennai - 600004',
      latitude: 13.0335,
      longitude: 80.2785,
      max_travel_km: 25,
      transport_mode: 'own_bike',
      is_verified: 1,
      is_admin: 1,
      password_hash: hashPassword('AdminPass123!'),
      created_at: new Date().toISOString()
    };
    this.data.users = [adminUser];
    this.data.bookings = [];
    this.data.availability_slots = [];
    this.saveLocal();
    console.log('Database seeded successfully.');
  }

  // --- Users Operations ---

  getUsers() {
    return this.data.users;
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === parseInt(id)) || null;
  }

  getUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  getUserByMobile(mobile) {
    if (!mobile) return null;
    const cleanSearch = String(mobile).replace(/\D/g, '');
    const last10 = cleanSearch.length >= 10 ? cleanSearch.slice(-10) : cleanSearch;
    return this.data.users.find(u => {
      if (!u.mobile) return false;
      const cleanUser = String(u.mobile).replace(/\D/g, '');
      const userLast10 = cleanUser.length >= 10 ? cleanUser.slice(-10) : cleanUser;
      return userLast10 === last10;
    }) || null;
  }

  async createUser(user) {
    const nextId = this.data.users.reduce((max, u) => u.id > max ? u.id : max, 0) + 1;
    const defaultTitle = user.title || (user.clergy_type === 'convent' || user.clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.');
    const newUser = {
      id: nextId,
      name: user.name,
      title: defaultTitle,
      congregation_abbr: user.congregation_abbr || '',
      mobile: user.mobile,
      email: user.email || '',
      diocese_province: user.diocese_province || '',
      clergy_type: user.clergy_type || 'diocesan',
      religious_order: user.religious_order || '',
      residence_name: user.residence_name || '',
      residence_address: user.residence_address || '',
      latitude: user.latitude ? parseFloat(user.latitude) : null,
      longitude: user.longitude ? parseFloat(user.longitude) : null,
      max_travel_km: user.max_travel_km ? parseInt(user.max_travel_km) : 25,
      transport_mode: user.transport_mode || 'own_bike',
      transport_modes: Array.isArray(user.transport_modes)
        ? user.transport_modes
        : (user.transport_mode ? [user.transport_mode] : ['own_bike']),
      profile_photo: user.profile_photo || null,
      dob: user.dob || null,
      is_verified: user.is_verified !== undefined ? Number(user.is_verified) : 0,
      is_admin: 0,
      password_hash: hashPassword(user.password),
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveLocal();

    // Persist asynchronously to Turso Cloud
    if (tursoClient) {
      tursoClient.execute({
        sql: `INSERT INTO users (
          id, name, title, congregation_abbr, mobile, email, password_hash, clergy_type, religious_order,
          diocese_province, residence_name, residence_address, latitude, longitude,
          max_travel_km, transport_mode, transport_modes, profile_photo, dob, is_verified, is_admin, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newUser.id, newUser.name, newUser.title, newUser.congregation_abbr, newUser.mobile, newUser.email, newUser.password_hash,
          newUser.clergy_type, newUser.religious_order, newUser.diocese_province,
          newUser.residence_name, newUser.residence_address, newUser.latitude, newUser.longitude,
          newUser.max_travel_km, newUser.transport_mode, JSON.stringify(newUser.transport_modes), newUser.profile_photo, newUser.dob, newUser.is_verified, newUser.is_admin, newUser.created_at
        ]
      }).catch(err => console.error('Turso background insert user failed:', err));
    }

    return newUser;
  }

  async updateUser(userId, updates) {
    const user = this.data.users.find(u => u.id === parseInt(userId));
    if (!user) return null;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    });

    this.saveLocal();

    if (tursoClient) {
      try {
        const fields = [];
        const args = [];
        const allowedColumns = [
          'name', 'title', 'congregation_abbr', 'mobile', 'email', 'clergy_type', 'religious_order',
          'diocese_province', 'residence_name', 'residence_address',
          'latitude', 'longitude', 'max_travel_km', 'transport_mode', 'transport_modes',
          'profile_photo', 'is_verified', 'dob', 'about_me', 'social_links', 'favorite_ministers', 'liturgical_languages'
        ];

        for (const col of allowedColumns) {
          if (updates[col] !== undefined) {
            fields.push(`${col} = ?`);
            if ((col === 'social_links' || col === 'transport_modes' || col === 'favorite_ministers' || col === 'liturgical_languages') && typeof updates[col] === 'object') {
              args.push(JSON.stringify(updates[col]));
            } else {
              args.push(updates[col]);
            }
          }
        }

        if (fields.length > 0) {
          args.push(user.id);
          tursoClient.execute({
            sql: `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            args
          }).catch(err => console.error('Turso background update user failed:', err));
        }
      } catch (err) {
        console.error('Turso update query error:', err);
      }
    }

    return user;
  }

  async verifyUser(userId, isVerified) {
    const user = this.data.users.find(u => u.id === parseInt(userId));
    if (user) {
      user.is_verified = isVerified ? 1 : 0;
      this.saveLocal();

      if (tursoClient) {
        tursoClient.execute({
          sql: 'UPDATE users SET is_verified = ? WHERE id = ?',
          args: [user.is_verified, user.id]
        }).catch(err => console.error('Turso background update user failed:', err));
      }

      return user;
    }
    return null;
  }

  // --- Super-Admin Operations ---

  getAllUsersForAdmin() {
    return this.data.users.map(u => {
      const { password_hash, ...rest } = u;
      const bookedCount = this.data.bookings.filter(b => b.responder_id === u.id && (b.status === 'accepted' || b.status === 'completed')).length;
      const requestedCount = this.data.bookings.filter(b => b.requester_id === u.id).length;
      return {
        ...rest,
        ministries_celebrated: bookedCount,
        requests_posted: requestedCount
      };
    });
  }

  async adminResetPassword(userId, newPassword) {
    const user = this.data.users.find(u => u.id === parseInt(userId));
    if (!user) return null;
    user.password_hash = hashPassword(newPassword || 'Jesus@123');
    this.saveLocal();

    if (tursoClient) {
      tursoClient.execute({
        sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
        args: [user.password_hash, user.id]
      }).catch(err => console.error('Turso admin reset password failed:', err));
    }
    return user;
  }

  async adminToggleRole(userId, field, val) {
    const user = this.data.users.find(u => u.id === parseInt(userId));
    if (!user) return null;
    user[field] = val ? 1 : 0;
    this.saveLocal();

    if (tursoClient && (field === 'is_admin' || field === 'is_verified')) {
      tursoClient.execute({
        sql: `UPDATE users SET ${field} = ? WHERE id = ?`,
        args: [user[field], user.id]
      }).catch(err => console.error(`Turso toggle ${field} failed:`, err));
    }
    return user;
  }

  async adminDeleteUser(userId) {
    const uId = parseInt(userId);
    const userIndex = this.data.users.findIndex(u => u.id === uId);
    if (userIndex === -1) return false;

    this.data.users.splice(userIndex, 1);
    // Clean up slots
    this.data.availability_slots = this.data.availability_slots.filter(s => s.priest_id !== uId);
    this.saveLocal();

    if (tursoClient) {
      tursoClient.execute({
        sql: 'DELETE FROM users WHERE id = ?',
        args: [uId]
      }).catch(err => console.error('Turso admin delete user failed:', err));
      tursoClient.execute({
        sql: 'DELETE FROM availability_slots WHERE priest_id = ?',
        args: [uId]
      }).catch(err => console.error('Turso admin delete slots failed:', err));
    }
    return true;
  }

  getAllBookingsForAdmin() {
    return this.getBookings();
  }

  async adminOverrideBooking(bookingId, updates) {
    const booking = this.data.bookings.find(b => b.id === parseInt(bookingId));
    if (!booking) return null;

    if (updates.status !== undefined) booking.status = updates.status;
    if (updates.responder_id !== undefined) {
      booking.responder_id = updates.responder_id ? parseInt(updates.responder_id) : null;
    }
    if (updates.location !== undefined) booking.location = updates.location;
    if (updates.datetime !== undefined) booking.datetime = updates.datetime;
    if (updates.datetime_end !== undefined) booking.datetime_end = updates.datetime_end;
    if (updates.honorarium !== undefined) booking.honorarium = updates.honorarium;
    if (updates.service_type !== undefined) booking.service_type = updates.service_type;
    if (updates.notes !== undefined) booking.notes = updates.notes;

    this.saveLocal();

    if (tursoClient) {
      tursoClient.execute({
        sql: `UPDATE bookings SET status = ?, responder_id = ?, location = ?, datetime = ?, datetime_end = ?, honorarium = ?, service_type = ?, notes = ? WHERE id = ?`,
        args: [
          booking.status,
          booking.responder_id,
          booking.location,
          booking.datetime,
          booking.datetime_end || null,
          booking.honorarium,
          booking.service_type,
          booking.notes || '',
          booking.id
        ]
      }).catch(err => console.error('Turso admin override booking failed:', err));
    }

    return booking;
  }

  async adminDeleteBooking(bookingId) {
    const bId = parseInt(bookingId);
    const index = this.data.bookings.findIndex(b => b.id === bId);
    if (index === -1) return false;

    this.data.bookings.splice(index, 1);
    this.saveLocal();

    if (tursoClient) {
      tursoClient.execute({
        sql: 'DELETE FROM bookings WHERE id = ?',
        args: [bId]
      }).catch(err => console.error('Turso admin delete booking failed:', err));
    }
    return true;
  }

  getDatabaseRawSnapshot() {
    return {
      stats: {
        total_users: this.data.users.length,
        verified_users: this.data.users.filter(u => u.is_verified === 1).length,
        admin_users: this.data.users.filter(u => u.is_admin === 1).length,
        total_bookings: this.data.bookings.length,
        open_bookings: this.data.bookings.filter(b => b.status === 'pending').length,
        accepted_bookings: this.data.bookings.filter(b => b.status === 'accepted').length,
        completed_bookings: this.data.bookings.filter(b => b.status === 'completed').length,
        availability_slots: this.data.availability_slots.length,
        turso_connected: !!tursoClient
      },
      tables: {
        users: this.data.users.map(({ password_hash, ...u }) => u),
        bookings: this.data.bookings,
        availability_slots: this.data.availability_slots
      }
    };
  }

  async adminUpdateRawRecord(table, recordId, updatedFields) {
    const id = parseInt(recordId);
    if (!this.data[table]) return null;

    const record = this.data[table].find(item => item.id === id);
    if (!record) return null;

    Object.keys(updatedFields).forEach(key => {
      if (key !== 'id' && key !== 'password_hash') {
        record[key] = updatedFields[key];
      }
    });

    this.saveLocal();
    return record;
  }

  // --- Availability Roster Operations ---

  getAvailabilitySlots(filter = {}) {
    const { date, lat, lon } = filter;
    const todayStr = date || new Date().toISOString().split('T')[0];

    // Get all verified priests (only Fr., excluding sisters, brothers, and unverified accounts)
    const verifiedPriests = this.data.users.filter(
      u => u.is_verified === 1 && (u.title ? u.title === 'Fr.' : (u.clergy_type !== 'convent' && u.clergy_type !== 'convent_sister')) && u.is_admin !== 1
    );

    // Build roster: by default every verified priest is available unless explicitly marked 'busy' or 'booked'
    const enriched = verifiedPriests.map(priest => {
      // Check if priest has a specific slot or status for this date
      const slot = this.data.availability_slots.find(
        s => s.priest_id === priest.id && (s.date === todayStr || !s.date)
      );

      // Check if priest has an accepted booking on this date
      const bookedOnDate = this.data.bookings.some(
        b => b.responder_id === priest.id && b.status === 'accepted' && b.datetime.startsWith(todayStr)
      );

      const isBusy = (slot && (slot.status === 'busy' || slot.status === 'offline' || slot.status === 'booked')) || bookedOnDate;

      let distance_km = null;
      if (lat && lon && priest.latitude && priest.longitude) {
        distance_km = calculateDistanceKm(parseFloat(lat), parseFloat(lon), priest.latitude, priest.longitude);
      }

      return {
        id: slot ? slot.id : `priest-${priest.id}`,
        priest_id: priest.id,
        date: todayStr,
        time_start: slot ? slot.time_start : '06:00',
        time_end: slot ? slot.time_end : '20:00',
        languages: (slot && Array.isArray(slot.languages) && slot.languages.length > 0)
          ? slot.languages
          : (Array.isArray(priest.liturgical_languages) && priest.liturgical_languages.length > 0
              ? priest.liturgical_languages
              : ['English', 'Tamil']),
        liturgical_languages: Array.isArray(priest.liturgical_languages) && priest.liturgical_languages.length > 0
          ? priest.liturgical_languages
          : ['English', 'Tamil'],
        status: isBusy ? 'busy' : 'available',
        priest_title: priest.title || 'Fr.',
        priest_name: priest.name,
        congregation_abbr: priest.congregation_abbr || '',
        priest_mobile: priest.mobile,
        clergy_type: priest.clergy_type,
        religious_order: priest.religious_order,
        residence_name: priest.residence_name,
        residence_address: priest.residence_address || '',
        diocese_province: priest.diocese_province,
        transport_mode: priest.transport_mode,
        transport_modes: Array.isArray(priest.transport_modes)
          ? priest.transport_modes
          : (typeof priest.transport_modes === 'string'
              ? (() => { try { return JSON.parse(priest.transport_modes); } catch(e) { return [priest.transport_mode || 'own_bike']; } })()
              : (priest.transport_mode ? [priest.transport_mode] : ['own_bike'])),
        max_travel_km: priest.max_travel_km,
        priest_latitude: priest.latitude,
        priest_longitude: priest.longitude,
        profile_photo: priest.profile_photo || null,
        dob: priest.dob || null,
        age: calculateAge(priest.dob),
        about_me: priest.about_me || '',
        social_links: typeof priest.social_links === 'string'
          ? (() => { try { return JSON.parse(priest.social_links); } catch(e) { return {}; } })()
          : (priest.social_links || {}),
        distance_km
      };
    }).filter(p => p.status === 'available'); // Only show currently available priests on public list

    if (lat && lon) {
      enriched.sort((a, b) => {
        if (a.distance_km === null) return 1;
        if (b.distance_km === null) return -1;
        return a.distance_km - b.distance_km;
      });
    }

    return enriched;
  }


  async createOrUpdateAvailability(slot) {
    const priestId = parseInt(slot.priest_id);
    let existing = this.data.availability_slots.find(
      s => s.priest_id === priestId && s.date === slot.date
    );

    if (existing) {
      existing.time_start = slot.time_start;
      existing.time_end = slot.time_end;
      existing.languages = slot.languages || ['English'];
      existing.status = 'available';
      existing.updated_at = new Date().toISOString();
      this.saveLocal();

      if (tursoClient) {
        tursoClient.execute({
          sql: 'UPDATE availability_slots SET time_start = ?, time_end = ?, languages = ?, status = ?, updated_at = ? WHERE id = ?',
          args: [existing.time_start, existing.time_end, JSON.stringify(existing.languages), existing.status, existing.updated_at, existing.id]
        }).catch(err => console.error('Turso background update slot failed:', err));
      }

      return existing;
    }

    const nextId = this.data.availability_slots.reduce((max, s) => s.id > max ? s.id : max, 0) + 1;
    const newSlot = {
      id: nextId,
      priest_id: priestId,
      date: slot.date,
      time_start: slot.time_start || '06:00',
      time_end: slot.time_end || '12:00',
      languages: slot.languages || ['English'],
      notes: slot.notes || '',
      status: 'available',
      created_at: new Date().toISOString()
    };
    this.data.availability_slots.push(newSlot);
    this.saveLocal();

    if (tursoClient) {
      tursoClient.execute({
        sql: `INSERT INTO availability_slots (
          id, priest_id, date, time_start, time_end, languages, notes, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newSlot.id, newSlot.priest_id, newSlot.date, newSlot.time_start, newSlot.time_end,
          JSON.stringify(newSlot.languages), newSlot.notes, newSlot.status, newSlot.created_at
        ]
      }).catch(err => console.error('Turso background insert slot failed:', err));
    }

    return newSlot;
  }

  getPriestStatus(priestId, date) {
    const pId = parseInt(priestId);
    const todayStr = date || new Date().toISOString().split('T')[0];
    const slot = this.data.availability_slots.find(
      s => s.priest_id === pId && (s.date === todayStr || !s.date)
    );
    const bookedOnDate = this.data.bookings.some(
      b => b.responder_id === pId && b.status === 'accepted' && b.datetime.startsWith(todayStr)
    );
    if (bookedOnDate) return 'busy';
    // Priests are busy by default unless explicitly toggled to 'available'
    return slot && slot.status === 'available' ? 'available' : 'busy';
  }

  async togglePriestStatus(priestId, date) {
    const pId = parseInt(priestId);
    const todayStr = date || new Date().toISOString().split('T')[0];

    let slot = this.data.availability_slots.find(
      s => s.priest_id === pId && (s.date === todayStr || !s.date)
    );

    if (!slot) {
      // By default priest was busy; toggling flips them to available
      const nextId = this.data.availability_slots.reduce((max, s) => s.id > max ? s.id : max, 0) + 1;
      slot = {
        id: nextId,
        priest_id: pId,
        date: todayStr,
        time_start: '06:00',
        time_end: '20:00',
        languages: ['English', 'Tamil'],
        notes: '',
        status: 'available',
        created_at: new Date().toISOString()
      };
      this.data.availability_slots.push(slot);
    } else {
      // Toggle between available and busy
      slot.status = slot.status === 'available' ? 'busy' : 'available';
      slot.updated_at = new Date().toISOString();
    }

    this.saveLocal();

    if (tursoClient) {
      tursoClient.execute({
        sql: `INSERT INTO availability_slots (id, priest_id, date, time_start, time_end, languages, notes, status, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET status = excluded.status`,
        args: [
          slot.id, slot.priest_id, slot.date, slot.time_start, slot.time_end,
          JSON.stringify(slot.languages || []), slot.notes || '', slot.status, slot.created_at || new Date().toISOString()
        ]
      }).catch(err => console.error('Turso background toggle status failed:', err));
    }
    return slot;
  }

  async setPriestUnavailableDate(priestId, { startDate, endDate, startTime = '00:00', endTime = '23:59', notes = 'Unavailable / Leave' }) {
    const pId = parseInt(priestId);
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    const slotsUpdated = [];

    // Loop through each day in the date range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const curDateStr = d.toISOString().split('T')[0];
      let slot = this.data.availability_slots.find(
        s => s.priest_id === pId && s.date === curDateStr
      );

      if (!slot) {
        const nextId = this.data.availability_slots.reduce((max, s) => s.id > max ? s.id : max, 0) + 1;
        slot = {
          id: nextId,
          priest_id: pId,
          date: curDateStr,
          time_start: startTime || '00:00',
          time_end: endTime || '23:59',
          languages: ['English'],
          notes: notes || '',
          status: 'busy',
          created_at: new Date().toISOString()
        };
        this.data.availability_slots.push(slot);
      } else {
        slot.status = 'busy';
        slot.time_start = startTime || '00:00';
        slot.time_end = endTime || '23:59';
        slot.notes = notes || '';
        slot.updated_at = new Date().toISOString();
      }

      slotsUpdated.push(slot);

      if (tursoClient) {
        tursoClient.execute({
          sql: `INSERT INTO availability_slots (id, priest_id, date, time_start, time_end, languages, notes, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET status = 'busy', time_start = excluded.time_start, time_end = excluded.time_end`,
          args: [
            slot.id, slot.priest_id, slot.date, slot.time_start, slot.time_end,
            JSON.stringify(slot.languages || []), slot.notes, slot.status, slot.created_at || new Date().toISOString()
          ]
        }).catch(err => console.error('Turso background set unavailable failed:', err));
      }
    }

    this.saveLocal();
    return slotsUpdated;
  }

  async setPriestBusy(priestId, date) {
    return this.togglePriestStatus(priestId, date);
  }

  async clearPriestUnavailableDate(priestId, dateStr) {
    const pId = parseInt(priestId);
    this.data.availability_slots = this.data.availability_slots.filter(
      s => !(s.priest_id === pId && s.date === dateStr && s.status === 'busy')
    );
    this.saveLocal();
    if (tursoClient) {
      tursoClient.execute({
        sql: `DELETE FROM availability_slots WHERE priest_id = ? AND date = ? AND status = 'busy'`,
        args: [pId, dateStr]
      }).catch(err => console.error('Turso background clear unavailable failed:', err));
    }
    return true;
  }


  // --- Bookings Operations ---

  getBookings(userLat, userLon) {
    return this.data.bookings.map(b => {
      const requester = this.getUserById(b.requester_id);
      const responder = b.responder_id ? this.getUserById(b.responder_id) : null;
      let distance_km = null;

      if (userLat && userLon && b.latitude && b.longitude) {
        distance_km = calculateDistanceKm(parseFloat(userLat), parseFloat(userLon), b.latitude, b.longitude);
      }
      // Enrich applicants (available priests who offered ministry)
      const rawApplicants = b.applicants || [];
      const applicants = rawApplicants.map(app => {
        const pId = typeof app === 'object' ? app.priest_id : app;
        const priestUser = this.getUserById(pId);
        if (!priestUser) return null;
        let pDistance = null;
        if (b.latitude && b.longitude && priestUser.latitude && priestUser.longitude) {
          pDistance = calculateDistanceKm(b.latitude, b.longitude, priestUser.latitude, priestUser.longitude);
        }
        return {
          priest_id: priestUser.id,
          priest_title: priestUser.title || 'Fr.',
          priest_name: priestUser.name,
          congregation_abbr: priestUser.congregation_abbr || '',
          priest_mobile: priestUser.mobile,
          priest_email: priestUser.email || '',
          clergy_type: priestUser.clergy_type,
          religious_order: priestUser.religious_order,
          diocese_province: priestUser.diocese_province,
          residence_name: priestUser.residence_name,
          residence_address: priestUser.residence_address || '',
          liturgical_languages: Array.isArray(priestUser.liturgical_languages) && priestUser.liturgical_languages.length > 0
            ? priestUser.liturgical_languages
            : ['English', 'Tamil'],
          transport_mode: priestUser.transport_mode || 'own_bike',
          transport_modes: Array.isArray(priestUser.transport_modes)
            ? priestUser.transport_modes
            : (typeof priestUser.transport_modes === 'string'
                ? (() => { try { return JSON.parse(priestUser.transport_modes); } catch(e) { return [priestUser.transport_mode || 'own_bike']; } })()
                : (priestUser.transport_mode ? [priestUser.transport_mode] : ['own_bike'])),
          max_travel_km: priestUser.max_travel_km || 25,
          is_verified: priestUser.is_verified || 0,
          profile_photo: priestUser.profile_photo || null,
          dob: priestUser.dob || null,
          age: calculateAge(priestUser.dob),
          about_me: priestUser.about_me || '',
          social_links: typeof priestUser.social_links === 'string'
            ? (() => { try { return JSON.parse(priestUser.social_links); } catch(e) { return {}; } })()
            : (priestUser.social_links || {}),
          distance_km: pDistance,
          offered_at: typeof app === 'object' ? app.offered_at : new Date().toISOString(),
          has_post_edit: typeof app === 'object' ? Boolean(app.has_post_edit) : false,
          last_edit_notice: typeof app === 'object' ? (app.last_edit_notice || '') : '',
          last_edited_at: typeof app === 'object' ? (app.last_edited_at || null) : null
        };
      }).filter(Boolean);

      return {
        ...b,
        applicants,
        requester_title: requester ? (requester.title || (requester.clergy_type === 'convent' || requester.clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.')) : '',
        requester_name: requester ? requester.name : 'Unknown',
        requester_congregation_abbr: requester ? (requester.congregation_abbr || '') : '',
        requester_mobile: requester ? requester.mobile : '',
        requester_clergy_type: requester ? requester.clergy_type : 'diocesan',
        requester_order: requester ? requester.religious_order : '',
        requester_diocese: requester ? requester.diocese_province : '',
        requester_photo: requester ? requester.profile_photo : null,
        responder_title: responder ? (responder.title || 'Fr.') : null,
        responder_name: responder ? responder.name : null,
        responder_congregation_abbr: responder ? (responder.congregation_abbr || '') : '',
        responder_mobile: responder ? responder.mobile : null,
        responder_clergy_type: responder ? responder.clergy_type : null,
        responder_order: responder ? responder.religious_order : null,
        responder_diocese: responder ? responder.diocese_province : null,
        responder_photo: responder ? responder.profile_photo : null,
        distance_km
      };
    });
  }

  getBookingById(id) {
    return this.data.bookings.find(b => b.id === parseInt(id)) || null;
  }

  // Check if a priest has an existing accepted/locked booking that overlaps with the given time window
  checkPriestTimeConflict(priestId, startIso, endIso, excludeBookingId = null) {
    const pId = parseInt(priestId);
    const startMs = new Date(startIso).getTime();
    // Default celebration duration is 1 hour (3600000ms) if end time is not provided
    const endMs = endIso ? new Date(endIso).getTime() : startMs + (60 * 60 * 1000);

    return this.data.bookings.find(b => {
      if (excludeBookingId && b.id === parseInt(excludeBookingId)) return false;
      if (b.status !== 'accepted') return false;
      if (b.responder_id !== pId) return false;

      const bStartMs = new Date(b.datetime).getTime();
      const bEndMs = b.datetime_end ? new Date(b.datetime_end).getTime() : bStartMs + (60 * 60 * 1000);

      // Overlap condition: startA < endB && endA > startB
      return startMs < bEndMs && endMs > bStartMs;
    }) || null;
  }

  async createBooking(booking) {
    const nextId = this.data.bookings.reduce((max, b) => b.id > max ? b.id : max, 0) + 1;
    const newBooking = {
      id: nextId,
      requester_id: parseInt(booking.requester_id),
      responder_id: booking.responder_id ? parseInt(booking.responder_id) : null,
      booking_type: booking.booking_type || 'open_request',
      service_type: booking.service_type || 'Holy Mass',
      datetime: booking.datetime,
      datetime_end: booking.datetime_end || null,
      location: booking.location,
      latitude: booking.latitude ? parseFloat(booking.latitude) : null,
      longitude: booking.longitude ? parseFloat(booking.longitude) : null,
      language: booking.language,
      honorarium: booking.honorarium || '',
      notes: booking.notes || '',
      status: booking.responder_id ? 'accepted' : 'pending',
      applicants: [],
      created_at: new Date().toISOString()
    };
    this.data.bookings.push(newBooking);

    if (booking.responder_id) {
      const bookingDate = booking.datetime.split('T')[0];
      const slot = this.data.availability_slots.find(
        s => s.priest_id === parseInt(booking.responder_id) && s.date === bookingDate
      );
      if (slot) {
        slot.status = 'booked';
        if (tursoClient) {
          tursoClient.execute({
            sql: 'UPDATE availability_slots SET status = ? WHERE id = ?',
            args: ['booked', slot.id]
          }).catch(err => console.error('Turso background slot status update failed:', err));
        }
      }
    }

    this.saveLocal();

    if (tursoClient) {
      tursoClient.execute({
        sql: `INSERT INTO bookings (
          id, requester_id, responder_id, booking_type, service_type, datetime, datetime_end,
          location, latitude, longitude, language, honorarium, notes, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newBooking.id, newBooking.requester_id, newBooking.responder_id, newBooking.booking_type,
          newBooking.service_type, newBooking.datetime, newBooking.datetime_end || null,
          newBooking.location, newBooking.latitude, newBooking.longitude,
          newBooking.language, newBooking.honorarium, newBooking.notes, newBooking.status, newBooking.created_at
        ]
      }).catch(err => console.error('Turso background insert booking failed:', err));
    }

    return newBooking;
  }

  // Update/Edit an existing booking (Only allowed before confirmation)
  async updateBooking(bookingId, requesterId, updates) {
    const booking = this.data.bookings.find(b => b.id === parseInt(bookingId));
    if (!booking) return { error: 'Booking request not found.' };

    // Only the requester (or an admin) can edit the request details
    if (booking.requester_id !== parseInt(requesterId)) {
      return { error: 'You are only authorized to edit your own ministry requests.' };
    }

    // Confirmed ministries cannot be edited or deleted through the app; arrangements must be made directly
    if (booking.status === 'accepted' || booking.status === 'completed') {
      return { error: 'This ministry is already confirmed and locked. To change details, please contact the celebrant directly via Phone or WhatsApp.' };
    }

    // Determine what changed for change tracking & notification
    const changes = [];
    if (updates.datetime && updates.datetime !== booking.datetime) {
      changes.push(`Date/time updated to ${updates.datetime.replace('T', ' ')}`);
      booking.datetime = updates.datetime;
    }
    if (updates.datetime_end !== undefined && updates.datetime_end !== booking.datetime_end) {
      booking.datetime_end = updates.datetime_end;
    }
    if (updates.location && updates.location !== booking.location) {
      changes.push(`Venue updated to "${updates.location}"`);
      booking.location = updates.location;
      if (updates.latitude !== undefined) booking.latitude = updates.latitude ? parseFloat(updates.latitude) : null;
      if (updates.longitude !== undefined) booking.longitude = updates.longitude ? parseFloat(updates.longitude) : null;
    }
    if (updates.language && updates.language !== booking.language) {
      changes.push(`Language updated to "${updates.language}"`);
      booking.language = updates.language;
    }
    if (updates.service_type && updates.service_type !== booking.service_type) {
      changes.push(`Ministry type updated to "${updates.service_type}"`);
      booking.service_type = updates.service_type;
    }
    if (updates.honorarium !== undefined && updates.honorarium !== booking.honorarium) {
      booking.honorarium = updates.honorarium;
    }
    if (updates.notes !== undefined && updates.notes !== booking.notes) {
      booking.notes = updates.notes;
    }

    if (changes.length === 0) {
      return { success: true, booking, notified_count: 0, message: 'No changes detected.' };
    }

    const editTimestamp = new Date().toISOString();
    booking.updated_at = editTimestamp;

    // Track edit record in edit_history
    if (!booking.edit_history) booking.edit_history = [];
    const editRecord = {
      edited_at: editTimestamp,
      summary: changes.join('; '),
      changes
    };
    booking.edit_history.push(editRecord);

    // If ministers already offered availability (or if confirmed with a celebrant),
    // mark their applicant record with an unacknowledged update flag so they get notified and can re-confirm or withdraw.
    const applicantsCount = (booking.applicants || []).length;
    if (booking.applicants && booking.applicants.length > 0) {
      booking.applicants = booking.applicants.map(app => {
        return {
          ...(typeof app === 'object' ? app : { priest_id: app }),
          has_post_edit: true,
          last_edit_notice: changes.join('; '),
          last_edited_at: editTimestamp
        };
      });
    }

    this.saveLocal();

    if (tursoClient) {
      tursoClient.execute({
        sql: `UPDATE bookings 
              SET service_type = ?, datetime = ?, datetime_end = ?, location = ?, latitude = ?, longitude = ?, language = ?, honorarium = ?, notes = ?, edit_history = ?
              WHERE id = ?`,
        args: [
          booking.service_type, booking.datetime, booking.datetime_end || null,
          booking.location, booking.latitude, booking.longitude,
          booking.language, booking.honorarium, booking.notes,
          JSON.stringify(booking.edit_history), booking.id
        ]
      }).catch(err => console.error('Turso background update booking failed:', err));
    }

    return {
      success: true,
      booking,
      changes,
      notified_count: applicantsCount + (booking.responder_id ? 1 : 0)
    };
  }

  // Available Priest offers ministry for an open request (ticket remains open)
  async applyForBooking(bookingId, priestId) {
    const booking = this.data.bookings.find(b => b.id === parseInt(bookingId));
    if (!booking) return { error: 'Booking request not found.' };
    if (booking.status !== 'pending') return { error: 'This request is already confirmed.' };

    const pId = parseInt(priestId);
    if (!booking.applicants) booking.applicants = [];

    // Check if priest already has an accepted/locked celebration clashing with this request's time
    const conflict = this.checkPriestTimeConflict(pId, booking.datetime, booking.datetime_end, booking.id);
    if (conflict) {
      const conflictDate = conflict.datetime.split('T')[0];
      const conflictTime = conflict.datetime.split('T')[1]?.slice(0, 5) || '';
      return {
        error: `Schedule conflict: You are already confirmed for ${conflict.service_type || 'another celebration'} on ${conflictDate} at ${conflictTime}.`
      };
    }

    const alreadyApplied = booking.applicants.some(
      a => (typeof a === 'object' ? a.priest_id : a) === pId
    );

    if (alreadyApplied) {
      return { error: 'You have already offered to take up this ministry.' };
    }

    booking.applicants.push({
      priest_id: pId,
      offered_at: new Date().toISOString()
    });

    this.saveLocal();
    return { success: true, booking };
  }

  // Priest withdraws their tentative offer before confirmation
  async withdrawBookingOffer(bookingId, priestId) {
    const booking = this.data.bookings.find(b => b.id === parseInt(bookingId));
    if (!booking) return { error: 'Booking request not found.' };
    if (booking.status !== 'pending') return { error: 'Cannot withdraw from an already confirmed celebration.' };

    const pId = parseInt(priestId);
    if (!booking.applicants) booking.applicants = [];

    const withdrawingApplicant = booking.applicants.find(
      a => (typeof a === 'object' ? a.priest_id : a) === pId
    );

    booking.applicants = booking.applicants.filter(
      a => (typeof a === 'object' ? a.priest_id : a) !== pId
    );

    if (booking.applicants.length === initialLength) {
      return { error: 'You have not offered for this ministry.' };
    }

    // Record the withdrawal for notifications timeline and history tracking
    if (!booking.withdrawals) booking.withdrawals = [];
    const ministerUser = this.getUserById(pId);
    booking.withdrawals.push({
      priest_id: pId,
      priest_name: ministerUser?.name || (typeof withdrawingApplicant === 'object' ? withdrawingApplicant.priest_name : 'Minister'),
      priest_title: ministerUser?.title || (typeof withdrawingApplicant === 'object' ? withdrawingApplicant.priest_title : 'Fr.'),
      clergy_type: ministerUser?.clergy_type || '',
      congregation_abbr: ministerUser?.congregation_abbr || ministerUser?.religious_order || '',
      withdrawn_at: new Date().toISOString()
    });

    this.saveLocal();
    return { success: true, booking };
  }

  // Requester chooses and confirms a specific priest among those who offered
  async confirmApplicant(bookingId, requesterId, chosenPriestId) {
    const booking = this.data.bookings.find(b => b.id === parseInt(bookingId));
    if (!booking) return { error: 'Booking request not found.' };
    if (booking.requester_id !== parseInt(requesterId)) {
      return { error: 'Only the requesting parish or convent can confirm this priest.' };
    }
    if (booking.status !== 'pending') {
      return { error: 'This request is already confirmed.' };
    }

    const pId = parseInt(chosenPriestId);

    // Verify priest has not since locked another clashing slot
    const conflict = this.checkPriestTimeConflict(pId, booking.datetime, booking.datetime_end, booking.id);
    if (conflict) {
      const conflictDate = conflict.datetime.split('T')[0];
      const conflictTime = conflict.datetime.split('T')[1]?.slice(0, 5) || '';
      return {
        error: `Cannot confirm: Father is already locked for ${conflict.service_type || 'another celebration'} on ${conflictDate} at ${conflictTime}.`
      };
    }

    booking.responder_id = pId;
    booking.status = 'accepted';
    booking.confirmed_at = new Date().toISOString();

    // Mark the confirmed priest as booked on this date
    const bookingDate = booking.datetime.split('T')[0];
    const slot = this.data.availability_slots.find(
      s => s.priest_id === pId && s.date === bookingDate
    );
    if (slot) {
      slot.status = 'booked';
      if (tursoClient) {
        tursoClient.execute({
          sql: 'UPDATE availability_slots SET status = ? WHERE id = ?',
          args: ['booked', slot.id]
        }).catch(err => console.error('Turso background slot status update failed:', err));
      }
    }

    this.saveLocal();

    if (tursoClient) {
      tursoClient.execute({
        sql: 'UPDATE bookings SET responder_id = ?, status = ? WHERE id = ?',
        args: [booking.responder_id, booking.status, booking.id]
      }).catch(err => console.error('Turso background confirm booking failed:', err));
    }

    return { success: true, booking };
  }

  async acceptBooking(bookingId, responderId) {
    const booking = this.data.bookings.find(b => b.id === parseInt(bookingId));
    if (booking && booking.status === 'pending') {
      booking.responder_id = parseInt(responderId);
      booking.status = 'accepted';

      const bookingDate = booking.datetime.split('T')[0];
      const slot = this.data.availability_slots.find(
        s => s.priest_id === parseInt(responderId) && s.date === bookingDate
      );
      if (slot) {
        slot.status = 'booked';
        if (tursoClient) {
          tursoClient.execute({
            sql: 'UPDATE availability_slots SET status = ? WHERE id = ?',
            args: ['booked', slot.id]
          }).catch(err => console.error('Turso background slot status update failed:', err));
        }
      }

      this.saveLocal();

      if (tursoClient) {
        tursoClient.execute({
          sql: 'UPDATE bookings SET responder_id = ?, status = ? WHERE id = ?',
          args: [booking.responder_id, booking.status, booking.id]
        }).catch(err => console.error('Turso background accept booking failed:', err));
      }

      return booking;
    }
    return null;
  }

  async completeBooking(bookingId) {
    const booking = this.data.bookings.find(b => b.id === parseInt(bookingId));
    if (booking && booking.status === 'accepted') {
      booking.status = 'completed';
      this.saveLocal();

      if (tursoClient) {
        tursoClient.execute({
          sql: 'UPDATE bookings SET status = ? WHERE id = ?',
          args: ['completed', booking.id]
        }).catch(err => console.error('Turso background complete booking failed:', err));
      }

      return booking;
    }
    return null;
  }
}

const db = new RelationalDatabase();
export default db;
