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

class RelationalDatabase {
  constructor() {
    this.data = {
      users: [],
      bookings: [],
      availability_slots: []
    };
    this.init();
  }

  async init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // If Turso Cloud DB is active, sync from cloud
      if (tursoClient) {
        await this.syncFromTurso();
      } else if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          users: parsed.users || [],
          bookings: parsed.bookings || [],
          availability_slots: parsed.availability_slots || []
        };
      } else {
        this.saveLocal();
        this.seed();
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  async syncFromTurso() {
    try {
      const usersRs = await tursoClient.execute('SELECT * FROM users');
      const slotsRs = await tursoClient.execute('SELECT * FROM availability_slots');
      const bookingsRs = await tursoClient.execute('SELECT * FROM bookings');

      this.data.users = usersRs.rows.map(r => ({
        ...r,
        id: Number(r.id),
        is_verified: Number(r.is_verified),
        is_admin: Number(r.is_admin),
        max_travel_km: Number(r.max_travel_km || 25),
        latitude: r.latitude !== null ? Number(r.latitude) : null,
        longitude: r.longitude !== null ? Number(r.longitude) : null
      }));

      this.data.availability_slots = slotsRs.rows.map(r => ({
        ...r,
        id: Number(r.id),
        priest_id: Number(r.priest_id),
        languages: typeof r.languages === 'string' ? JSON.parse(r.languages || '[]') : r.languages
      }));

      this.data.bookings = bookingsRs.rows.map(r => ({
        ...r,
        id: Number(r.id),
        requester_id: Number(r.requester_id),
        responder_id: r.responder_id !== null ? Number(r.responder_id) : null,
        latitude: r.latitude !== null ? Number(r.latitude) : null,
        longitude: r.longitude !== null ? Number(r.longitude) : null
      }));

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
    return this.data.users.find(u => u.mobile === mobile) || null;
  }

  async createUser(user) {
    const nextId = this.data.users.reduce((max, u) => u.id > max ? u.id : max, 0) + 1;
    const newUser = {
      id: nextId,
      name: user.name,
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
      is_verified: 0,
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
          id, name, mobile, email, password_hash, clergy_type, religious_order,
          diocese_province, residence_name, residence_address, latitude, longitude,
          max_travel_km, transport_mode, is_verified, is_admin, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newUser.id, newUser.name, newUser.mobile, newUser.email, newUser.password_hash,
          newUser.clergy_type, newUser.religious_order, newUser.diocese_province,
          newUser.residence_name, newUser.residence_address, newUser.latitude, newUser.longitude,
          newUser.max_travel_km, newUser.transport_mode, newUser.is_verified, newUser.is_admin, newUser.created_at
        ]
      }).catch(err => console.error('Turso background insert user failed:', err));
    }

    return newUser;
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

  // --- Availability Roster Operations ---

  getAvailabilitySlots(filter = {}) {
    const { date, lat, lon } = filter;
    let slots = this.data.availability_slots.filter(s => s.status === 'available');

    if (date) {
      slots = slots.filter(s => s.date === date);
    }

    const enriched = slots.map(s => {
      const priest = this.getUserById(s.priest_id);
      let distance_km = null;
      if (lat && lon && priest && priest.latitude && priest.longitude) {
        distance_km = calculateDistanceKm(parseFloat(lat), parseFloat(lon), priest.latitude, priest.longitude);
      }

      return {
        ...s,
        priest_name: priest ? priest.name : 'Unknown Priest',
        priest_mobile: priest ? priest.mobile : '',
        clergy_type: priest ? priest.clergy_type : 'diocesan',
        religious_order: priest ? priest.religious_order : '',
        residence_name: priest ? priest.residence_name : '',
        diocese_province: priest ? priest.diocese_province : '',
        transport_mode: priest ? priest.transport_mode : 'own_bike',
        max_travel_km: priest ? priest.max_travel_km : 25,
        priest_latitude: priest ? priest.latitude : null,
        priest_longitude: priest ? priest.longitude : null,
        distance_km
      };
    });

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

  async setPriestBusy(priestId, date) {
    const slots = this.data.availability_slots.filter(
      s => s.priest_id === parseInt(priestId) && (!date || s.date === date)
    );
    slots.forEach(s => {
      s.status = 'offline';
      if (tursoClient) {
        tursoClient.execute({
          sql: 'UPDATE availability_slots SET status = ? WHERE id = ?',
          args: ['offline', s.id]
        }).catch(err => console.error('Turso background set busy failed:', err));
      }
    });
    this.saveLocal();
    return slots;
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

      return {
        ...b,
        requester_name: requester ? requester.name : 'Unknown',
        requester_mobile: requester ? requester.mobile : '',
        requester_clergy_type: requester ? requester.clergy_type : 'diocesan',
        requester_order: requester ? requester.religious_order : '',
        requester_diocese: requester ? requester.diocese_province : '',
        responder_name: responder ? responder.name : null,
        responder_mobile: responder ? responder.mobile : null,
        responder_clergy_type: responder ? responder.clergy_type : null,
        responder_order: responder ? responder.religious_order : null,
        responder_diocese: responder ? responder.diocese_province : null,
        distance_km
      };
    });
  }

  getBookingById(id) {
    return this.data.bookings.find(b => b.id === parseInt(id)) || null;
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
      location: booking.location,
      latitude: booking.latitude ? parseFloat(booking.latitude) : null,
      longitude: booking.longitude ? parseFloat(booking.longitude) : null,
      language: booking.language,
      honorarium: booking.honorarium || '',
      notes: booking.notes || '',
      status: booking.responder_id ? 'accepted' : 'pending',
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
          id, requester_id, responder_id, booking_type, service_type, datetime,
          location, latitude, longitude, language, honorarium, notes, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newBooking.id, newBooking.requester_id, newBooking.responder_id, newBooking.booking_type,
          newBooking.service_type, newBooking.datetime, newBooking.location, newBooking.latitude, newBooking.longitude,
          newBooking.language, newBooking.honorarium, newBooking.notes, newBooking.status, newBooking.created_at
        ]
      }).catch(err => console.error('Turso background insert booking failed:', err));
    }

    return newBooking;
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
