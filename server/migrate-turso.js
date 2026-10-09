import 'dotenv/config';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function migrate() {
  console.log('🚀 Initializing Turso Cloud Database Tables...');

  // 1. Users Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      mobile TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT NOT NULL,
      clergy_type TEXT DEFAULT 'diocesan',
      religious_order TEXT,
      diocese_province TEXT,
      residence_name TEXT,
      residence_address TEXT,
      latitude REAL,
      longitude REAL,
      max_travel_km INTEGER DEFAULT 25,
      transport_mode TEXT DEFAULT 'own_bike',
      is_verified INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
  console.log('✓ Users table ready.');

  // 2. Availability Slots Table ("Bike-Taxi" supply mode)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS availability_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      priest_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time_start TEXT DEFAULT '06:00',
      time_end TEXT DEFAULT '12:00',
      languages TEXT DEFAULT '["English"]',
      notes TEXT,
      status TEXT DEFAULT 'available',
      created_at TEXT NOT NULL,
      updated_at TEXT,
      FOREIGN KEY (priest_id) REFERENCES users(id)
    );
  `);
  console.log('✓ Availability slots table ready.');

  // 3. Bookings Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id INTEGER NOT NULL,
      responder_id INTEGER,
      booking_type TEXT DEFAULT 'open_request',
      service_type TEXT DEFAULT 'Holy Mass',
      datetime TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      language TEXT NOT NULL,
      honorarium TEXT,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL,
      FOREIGN KEY (requester_id) REFERENCES users(id),
      FOREIGN KEY (responder_id) REFERENCES users(id)
    );
  `);
  console.log('✓ Bookings table ready.');

  // 4. Migrate local db.json data if present
  const dbJsonPath = path.join(process.cwd(), 'server', 'data', 'db.json');
  if (fs.existsSync(dbJsonPath)) {
    console.log('📦 Migrating existing local accounts from db.json to Turso...');
    const localData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

    // Migrate users
    if (localData.users && localData.users.length > 0) {
      for (const u of localData.users) {
        try {
          await client.execute({
            sql: `INSERT OR IGNORE INTO users (
              id, name, mobile, email, password_hash, clergy_type, religious_order,
              diocese_province, residence_name, residence_address, latitude, longitude,
              max_travel_km, transport_mode, is_verified, is_admin, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              u.id, u.name, u.mobile, u.email || '', u.password_hash,
              u.clergy_type || 'diocesan', u.religious_order || '', u.diocese_province || '',
              u.residence_name || '', u.residence_address || '', u.latitude || null, u.longitude || null,
              u.max_travel_km || 25, u.transport_mode || 'own_bike',
              u.is_verified || 0, u.is_admin || 0, u.created_at || new Date().toISOString()
            ]
          });
        } catch (e) {
          console.error(`Skipping user ${u.name}:`, e.message);
        }
      }
      console.log(`✓ Migrated ${localData.users.length} users into Turso.`);
    }

    // Migrate bookings
    if (localData.bookings && localData.bookings.length > 0) {
      for (const b of localData.bookings) {
        try {
          await client.execute({
            sql: `INSERT OR IGNORE INTO bookings (
              id, requester_id, responder_id, booking_type, service_type, datetime,
              location, latitude, longitude, language, honorarium, notes, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              b.id, b.requester_id, b.responder_id || null, b.booking_type || 'open_request',
              b.service_type || 'Holy Mass', b.datetime, b.location, b.latitude || null, b.longitude || null,
              b.language || 'English', b.honorarium || '', b.notes || '', b.status || 'pending',
              b.created_at || new Date().toISOString()
            ]
          });
        } catch (e) {
          console.error(`Skipping booking ${b.id}:`, e.message);
        }
      }
      console.log(`✓ Migrated ${localData.bookings.length} bookings into Turso.`);
    }
  }

  // Check admin user
  const adminCheck = await client.execute({
    sql: 'SELECT * FROM users WHERE mobile = ? OR email = ?',
    args: ['+919999999999', 'admin@bookapriest.in']
  });

  if (adminCheck.rows.length === 0) {
    console.log('Seeding default administrator in Turso...');
    await client.execute({
      sql: `INSERT INTO users (
        name, mobile, email, password_hash, clergy_type, diocese_province,
        is_verified, is_admin, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'System Administrator', '+919999999999', 'admin@bookapriest.in',
        'a44ca5d29f6dab4320ab986479fa985b2d584b11a7da934f7e80bb1449913a07', // AdminPass123!
        'diocesan', 'Archdiocese of Madras-Mylapore', 1, 1, new Date().toISOString()
      ]
    });
    console.log('✓ Admin user seeded.');
  }

  console.log('🎉 Turso Cloud Database migration successfully completed!');
}

migrate().catch(console.error);
