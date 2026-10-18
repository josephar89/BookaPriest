import 'dotenv/config';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let tursoClient = null;
if (tursoUrl && tursoAuthToken) {
  tursoClient = createClient({ url: tursoUrl, authToken: tursoAuthToken });
  console.log('⚡ Turso Cloud Database connected.');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedFresh() {
  console.log('🧹 Flushing existing data in Turso and local db.json...');

  if (tursoClient) {
    try {
      await tursoClient.execute('DELETE FROM bookings;');
      await tursoClient.execute('DELETE FROM availability_slots;');
      await tursoClient.execute('DELETE FROM users;');
      console.log('✓ Cleared bookings, availability_slots, users in Turso Cloud.');
    } catch (err) {
      console.error('Error clearing Turso tables:', err.message);
    }
  }

  // Common Passwords
  const adminPasswordHash = hashPassword('AdminPass123!');
  const priestPasswordHash = hashPassword('Priest@123');
  const sisterPasswordHash = hashPassword('Sister@123');

  // Realistic Users (Admin, Priests, Sisters across Chennai & Tamil Nadu)
  const users = [
    // 1. Admin
    {
      id: 1,
      name: 'Fr. Chancellor Maria Joseph',
      title: 'Fr.',
      congregation_abbr: '',
      mobile: '+919999999999',
      email: 'admin@bookapriest.in',
      password_hash: adminPasswordHash,
      clergy_type: 'diocesan',
      religious_order: '',
      diocese_province: 'Archdiocese of Madras-Mylapore',
      residence_name: 'Archbishop House, Santhome',
      residence_address: '21, Santhome High Road, Mylapore, Chennai - 600004',
      latitude: 13.0335,
      longitude: 80.2785,
      max_travel_km: 30,
      transport_mode: 'own_car',
      profile_photo: null,
      is_verified: 1,
      is_admin: 1,
      created_at: '2026-10-01T08:00:00.000Z'
    },
    // 2. Diocesan Priest (Primary Test Account)
    {
      id: 2,
      name: 'Fr. Joseph Raj',
      title: 'Fr.',
      congregation_abbr: '',
      mobile: '+919876543210',
      email: 'joseph.raj@diocese.org',
      password_hash: priestPasswordHash,
      clergy_type: 'diocesan',
      religious_order: '',
      diocese_province: 'Archdiocese of Madras-Mylapore',
      residence_name: 'National Shrine of St. Thomas',
      residence_address: '38, Santhome High Road, Chennai - 600004',
      latitude: 13.0336,
      longitude: 80.2778,
      max_travel_km: 25,
      transport_mode: 'own_car',
      profile_photo: null,
      is_verified: 1,
      is_admin: 0,
      created_at: '2026-10-02T09:00:00.000Z'
    },
    // 3. Religious Priest (Salesian SDB)
    {
      id: 3,
      name: 'Fr. Francis Xavier',
      title: 'Fr.',
      congregation_abbr: 'SDB',
      mobile: '+919876543220',
      email: 'francis.xavier@donbosco.in',
      password_hash: priestPasswordHash,
      clergy_type: 'religious',
      religious_order: 'Salesians of Don Bosco',
      diocese_province: 'Chennai Province (INM)',
      residence_name: 'Don Bosco Shrine & Provincialate',
      residence_address: '2, Portuguese Church St, Broadway, George Town, Chennai - 600001',
      latitude: 13.0982,
      longitude: 80.2858,
      max_travel_km: 35,
      transport_mode: 'own_bike',
      profile_photo: null,
      is_verified: 1,
      is_admin: 0,
      created_at: '2026-10-03T10:00:00.000Z'
    },
    // 4. Sister / Religious Nun (Primary Test Account)
    {
      id: 4,
      name: 'Sr. Maria Goretti',
      title: 'Sr.',
      congregation_abbr: 'FMM',
      mobile: '+919840998877',
      email: 'sr.maria@fmmchennai.org',
      password_hash: sisterPasswordHash,
      clergy_type: 'convent_sister',
      religious_order: 'Franciscan Missionaries of Mary',
      diocese_province: 'Archdiocese of Madras-Mylapore',
      residence_name: 'St. Thomas Convent',
      residence_address: 'Rosary Church Road, Mylapore, Chennai - 600004',
      latitude: 13.0360,
      longitude: 80.2730,
      max_travel_km: 20,
      transport_mode: 'public_transport',
      profile_photo: null,
      is_verified: 1,
      is_admin: 0,
      created_at: '2026-10-04T10:00:00.000Z'
    },
    // 5. Sister - Mother Superior / Convent Requester
    {
      id: 5,
      name: 'Sr. Agnes Clara',
      title: 'Sr.',
      congregation_abbr: 'FSMA',
      mobile: '+919840112233',
      email: 'superior.fsma@convent.in',
      password_hash: sisterPasswordHash,
      clergy_type: 'convent',
      religious_order: 'Franciscan Sisters of St. Mary of the Angels',
      diocese_province: 'Archdiocese of Madras-Mylapore',
      residence_name: 'St. Anthony Girls Convent',
      residence_address: 'Madhavaram High Road, Chennai - 600060',
      latitude: 13.1489,
      longitude: 80.2306,
      max_travel_km: 25,
      transport_mode: 'public_transport',
      profile_photo: null,
      is_verified: 1,
      is_admin: 0,
      created_at: '2026-10-05T08:00:00.000Z'
    },
    // 6. Diocesan Priest - Suburban Parish Priest
    {
      id: 6,
      name: 'Fr. Anthony Lazar',
      title: 'Fr.',
      congregation_abbr: '',
      mobile: '+919876543230',
      email: 'anthony.lazar@parish.org',
      password_hash: priestPasswordHash,
      clergy_type: 'diocesan',
      religious_order: '',
      diocese_province: 'Diocese of Chingleput',
      residence_name: 'St. Joseph Church Parish House',
      residence_address: 'GST Road, Tambaram, Chennai - 600045',
      latitude: 12.9249,
      longitude: 80.1165,
      max_travel_km: 40,
      transport_mode: 'own_car',
      profile_photo: null,
      is_verified: 1,
      is_admin: 0,
      created_at: '2026-10-05T11:00:00.000Z'
    },
    // 7. Religious Priest - Jesuit SJ
    {
      id: 7,
      name: 'Fr. Jerome D Souza',
      title: 'Fr.',
      congregation_abbr: 'SJ',
      mobile: '+919876543240',
      email: 'jerome.sj@loyola.edu',
      password_hash: priestPasswordHash,
      clergy_type: 'religious',
      religious_order: 'Society of Jesus (Jesuits)',
      diocese_province: 'Madurai Jesuit Province',
      residence_name: 'Loyola College Jesuit Residence',
      residence_address: 'Sterling Road, Nungambakkam, Chennai - 600034',
      latitude: 13.0645,
      longitude: 80.2337,
      max_travel_km: 30,
      transport_mode: 'own_bike',
      profile_photo: null,
      is_verified: 1,
      is_admin: 0,
      created_at: '2026-10-06T09:30:00.000Z'
    },
    // 8. Sister - Animator
    {
      id: 8,
      name: 'Sr. Catherine Therese',
      title: 'Sr.',
      congregation_abbr: 'SCJ',
      mobile: '+919840445566',
      email: 'catherine.therese@scj.org',
      password_hash: sisterPasswordHash,
      clergy_type: 'convent_sister',
      religious_order: 'Sisters of the Sacred Heart of Jesus',
      diocese_province: 'Archdiocese of Madras-Mylapore',
      residence_name: 'Sacred Heart Convent',
      residence_address: 'Church Park, Anna Salai, Chennai - 600006',
      latitude: 13.0526,
      longitude: 80.2514,
      max_travel_km: 20,
      transport_mode: 'public_transport',
      profile_photo: null,
      is_verified: 1,
      is_admin: 0,
      created_at: '2026-10-07T14:00:00.000Z'
    },
    // 9. Religious Priest - Capuchin OFM Cap
    {
      id: 9,
      name: 'Fr. Jude Peter',
      title: 'Fr.',
      congregation_abbr: 'OFM Cap',
      mobile: '+919876543250',
      email: 'jude.peter@capuchin.in',
      password_hash: priestPasswordHash,
      clergy_type: 'religious',
      religious_order: 'Order of Friars Minor Capuchin',
      diocese_province: 'Amala Province',
      residence_name: 'Capuchin Friary, Madhavaram',
      residence_address: 'GNT Road, Madhavaram, Chennai - 600051',
      latitude: 13.1437,
      longitude: 80.2389,
      max_travel_km: 30,
      transport_mode: 'own_bike',
      profile_photo: null,
      is_verified: 1,
      is_admin: 0,
      created_at: '2026-10-08T08:30:00.000Z'
    },
    // 10. Diocesan Priest - Supply / Assistant
    {
      id: 10,
      name: 'Fr. Paul Duraisamy',
      title: 'Fr.',
      congregation_abbr: '',
      mobile: '+919876543260',
      email: 'paul.durai@archdiocese.in',
      password_hash: priestPasswordHash,
      clergy_type: 'diocesan',
      religious_order: '',
      diocese_province: 'Archdiocese of Madras-Mylapore',
      residence_name: 'Priests Retirement Home',
      residence_address: 'Little Mount, Saidapet, Chennai - 600015',
      latitude: 13.0118,
      longitude: 80.2223,
      max_travel_km: 25,
      transport_mode: 'own_car',
      profile_photo: null,
      is_verified: 1,
      is_admin: 0,
      created_at: '2026-10-08T11:00:00.000Z',
      social_links: JSON.stringify({
        youtube: 'https://youtube.com/@FrPaulDuraisamyHomilies',
        facebook: 'https://facebook.com/fr.paul.duraisamy',
        website: 'https://archdiocese.in/clergy/paul-duraisamy'
      })
    }
  ];

  // 25 Dummy Bookings spanning Categories A, B, and C with realistic statuses and dates (Oct - Nov 2026)
  const bookings = [
    // 1. Category A - Mass (Pending, Open - 0 applicants)
    {
      id: 1,
      requester_id: 2, // Fr. Joseph Raj
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Holy Mass (Parish / Convent)',
      datetime: '2026-10-25T07:00:00.000Z',
      datetime_end: '2026-10-25T08:15:00.000Z',
      location: 'National Shrine of St. Thomas, Santhome, Chennai',
      latitude: 13.0336,
      longitude: 80.2778,
      language: 'Tamil',
      honorarium: '₹ 1,000',
      notes: 'Sunday Parish Morning Mass. Expecting around 400 faithful.',
      status: 'pending',
      applicants: [],
      created_at: '2026-10-15T09:00:00.000Z'
    },
    // 2. Category A - Marriage Mass (Pending, 2 applicants ready for confirmation)
    {
      id: 2,
      requester_id: 6, // Fr. Anthony Lazar (Tambaram)
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Marriage Mass',
      datetime: '2026-10-28T10:30:00.000Z',
      datetime_end: '2026-10-28T12:00:00.000Z',
      location: 'St. Joseph Church, GST Road, Tambaram',
      latitude: 12.9249,
      longitude: 80.1165,
      language: 'English & Tamil',
      honorarium: '₹ 2,500',
      notes: 'Bilingual nuptial mass with homily. Need supply priest as parish priest is travelling.',
      status: 'pending',
      applicants: [
        { priest_id: 3, offered_at: '2026-10-15T14:30:00.000Z' }, // Fr. Francis Xavier SDB
        { priest_id: 7, offered_at: '2026-10-16T08:15:00.000Z' }  // Fr. Jerome D Souza SJ
      ],
      created_at: '2026-10-14T11:00:00.000Z'
    },
    // 3. Category A - Concelebration (Confirmed)
    {
      id: 3,
      requester_id: 2, // Fr. Joseph Raj
      responder_id: 3, // Fr. Francis Xavier SDB
      booking_type: 'open_request',
      service_type: 'Concelebration (Feasts & Events)',
      datetime: '2026-10-22T18:00:00.000Z',
      datetime_end: '2026-10-22T20:00:00.000Z',
      location: 'St. Thomas Cathedral Grounds, Santhome',
      latitude: 13.0336,
      longitude: 80.2778,
      language: 'Tamil',
      honorarium: '₹ 1,500',
      notes: 'Annual Parish Feast Flag Hoisting and Concelebrated High Mass.',
      status: 'accepted',
      applicants: [
        { priest_id: 3, offered_at: '2026-10-10T12:00:00.000Z' }
      ],
      confirmed_at: '2026-10-11T09:00:00.000Z',
      created_at: '2026-10-09T10:00:00.000Z'
    },
    // 4. Category A - Confession Ministry (Pending, 1 applicant)
    {
      id: 4,
      requester_id: 6, // Fr. Anthony Lazar
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Confession Ministry',
      datetime: '2026-10-31T16:00:00.000Z',
      datetime_end: '2026-10-31T19:30:00.000Z',
      location: 'Our Lady of Fatima Shrine, Tambaram',
      latitude: 12.9255,
      longitude: 80.1170,
      language: 'Tamil',
      honorarium: '₹ 1,200',
      notes: 'All Saints Day eve confessions for children and youth.',
      status: 'pending',
      applicants: [
        { priest_id: 9, offered_at: '2026-10-16T17:00:00.000Z' } // Fr. Jude Peter OFM Cap
      ],
      created_at: '2026-10-15T15:00:00.000Z'
    },
    // 5. Category A - Funeral / Requiem Mass (Pending, Urgent)
    {
      id: 5,
      requester_id: 2, // Fr. Joseph Raj
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Funeral / Requiem Mass',
      datetime: '2026-10-20T10:00:00.000Z',
      datetime_end: '2026-10-20T11:30:00.000Z',
      location: 'St. Lazarus Church Cemetery Chapel, Mandaveli',
      latitude: 13.0280,
      longitude: 80.2640,
      language: 'Tamil',
      honorarium: '₹ 1,000',
      notes: 'Parishioner funeral service and blessing at the grave.',
      status: 'pending',
      applicants: [
        { priest_id: 10, offered_at: '2026-10-17T06:30:00.000Z' } // Fr. Paul Duraisamy
      ],
      created_at: '2026-10-17T06:00:00.000Z'
    },
    // 6. Category A - Anointing of the Sick (Confirmed)
    {
      id: 6,
      requester_id: 5, // Sr. Agnes Clara (Madhavaram Convent)
      responder_id: 9, // Fr. Jude Peter OFM Cap
      booking_type: 'open_request',
      service_type: 'Anointing of the Sick',
      datetime: '2026-10-21T15:30:00.000Z',
      datetime_end: '2026-10-21T17:00:00.000Z',
      location: 'St. Anthony Girls Convent Infirmary, Madhavaram',
      latitude: 13.1489,
      longitude: 80.2306,
      language: 'Tamil',
      honorarium: '₹ 1,000',
      notes: 'For two senior sick sisters in the convent infirmary.',
      status: 'accepted',
      applicants: [
        { priest_id: 9, offered_at: '2026-10-14T09:00:00.000Z' }
      ],
      confirmed_at: '2026-10-14T10:00:00.000Z',
      created_at: '2026-10-13T16:00:00.000Z'
    },

    // 7. Category B - Adoration Service (Pending, 1 applicant)
    {
      id: 7,
      requester_id: 5, // Sr. Agnes Clara
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Adoration Service',
      datetime: '2026-11-06T18:00:00.000Z',
      datetime_end: '2026-11-06T19:30:00.000Z',
      location: 'St. Anthony Convent Chapel, Madhavaram',
      latitude: 13.1489,
      longitude: 80.2306,
      language: 'Tamil & English',
      honorarium: '₹ 1,000',
      notes: 'First Friday Eucharistic Holy Hour and Benediction.',
      status: 'pending',
      applicants: [
        { priest_id: 7, offered_at: '2026-10-16T11:00:00.000Z' } // Fr. Jerome D Souza SJ
      ],
      created_at: '2026-10-15T10:00:00.000Z'
    },
    // 8. Category B - Charismatic Prayer Service (Pending, Open)
    {
      id: 8,
      requester_id: 6, // Fr. Anthony Lazar
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Charismatic Prayer Service',
      datetime: '2026-11-08T17:00:00.000Z',
      datetime_end: '2026-11-08T19:30:00.000Z',
      location: 'Fatima Parish Hall, Tambaram East',
      latitude: 12.9249,
      longitude: 80.1165,
      language: 'Tamil',
      honorarium: '₹ 1,500',
      notes: 'Parish prayer group healing service and praise and worship animation.',
      status: 'pending',
      applicants: [],
      created_at: '2026-10-16T12:00:00.000Z'
    },
    // 9. Category B - House Blessing (Pending, 2 applicants)
    {
      id: 9,
      requester_id: 2, // Fr. Joseph Raj
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'House Blessing',
      datetime: '2026-10-29T17:30:00.000Z',
      datetime_end: '2026-10-29T18:45:00.000Z',
      location: 'Kutchery Road, Mylapore, Chennai',
      latitude: 13.0370,
      longitude: 80.2710,
      language: 'Tamil',
      honorarium: '₹ 1,000',
      notes: 'New family house blessing prayer for parishioner.',
      status: 'pending',
      applicants: [
        { priest_id: 3, offered_at: '2026-10-16T15:00:00.000Z' }, // Fr. Francis Xavier SDB
        { priest_id: 10, offered_at: '2026-10-17T07:00:00.000Z' } // Fr. Paul Duraisamy
      ],
      created_at: '2026-10-15T16:00:00.000Z'
    },
    // 10. Category B - Monthly Recollection Talk (Confirmed)
    {
      id: 10,
      requester_id: 5, // Sr. Agnes Clara
      responder_id: 7, // Fr. Jerome D Souza SJ
      booking_type: 'open_request',
      service_type: 'Monthly Recollection Talk',
      datetime: '2026-10-24T09:30:00.000Z',
      datetime_end: '2026-10-24T12:30:00.000Z',
      location: 'Convent Chapel Hall, Madhavaram',
      latitude: 13.1489,
      longitude: 80.2306,
      language: 'English',
      honorarium: '₹ 2,000',
      notes: 'Monthly spiritual recollection on "Living the Joy of the Gospel" for 15 sisters.',
      status: 'accepted',
      applicants: [
        { priest_id: 7, offered_at: '2026-10-12T10:00:00.000Z' }
      ],
      confirmed_at: '2026-10-13T11:00:00.000Z',
      created_at: '2026-10-11T14:00:00.000Z'
    },
    // 11. Category B - Retreat for Religious (Pending, Open)
    {
      id: 11,
      requester_id: 5, // Sr. Agnes Clara
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Retreat for Religious',
      datetime: '2026-11-15T09:00:00.000Z',
      datetime_end: '2026-11-17T17:00:00.000Z',
      location: 'St. Mary Provincial House, Madhavaram',
      latitude: 13.1495,
      longitude: 80.2310,
      language: 'English',
      honorarium: '₹ 10,000',
      notes: '3-day guided retreat for junior sisters preparing for final profession.',
      status: 'pending',
      applicants: [],
      created_at: '2026-10-16T18:00:00.000Z'
    },
    // 12. Category B - Retreat for Lay Faithful (Confirmed)
    {
      id: 12,
      requester_id: 6, // Fr. Anthony Lazar
      responder_id: 9, // Fr. Jude Peter OFM Cap
      booking_type: 'open_request',
      service_type: 'Retreat for Lay Faithful',
      datetime: '2026-11-01T09:00:00.000Z',
      datetime_end: '2026-11-01T17:00:00.000Z',
      location: 'St. Joseph Community Hall, Tambaram',
      latitude: 12.9249,
      longitude: 80.1165,
      language: 'Tamil',
      honorarium: '₹ 3,500',
      notes: 'One-day Advent renewal retreat for couples and youth.',
      status: 'accepted',
      applicants: [
        { priest_id: 9, offered_at: '2026-10-14T15:30:00.000Z' }
      ],
      confirmed_at: '2026-10-15T09:30:00.000Z',
      created_at: '2026-10-13T10:00:00.000Z'
    },

    // 13. Category C - Catechism (Pending, Sister applied)
    {
      id: 13,
      requester_id: 2, // Fr. Joseph Raj (Santhome Parish)
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Catechism',
      datetime: '2026-10-25T08:30:00.000Z',
      datetime_end: '2026-10-25T10:00:00.000Z',
      location: 'St. Thomas Parish Catechetical Centre, Santhome',
      latitude: 13.0336,
      longitude: 80.2778,
      language: 'Tamil',
      honorarium: '₹ 800',
      notes: 'First Holy Communion class preparation module for 25 children.',
      status: 'pending',
      applicants: [
        { priest_id: 4, offered_at: '2026-10-16T16:00:00.000Z' } // Sr. Maria Goretti FMM
      ],
      created_at: '2026-10-15T11:00:00.000Z'
    },
    // 14. Category C - BCC / Anbiam Animation (Pending, 2 applicants - Sister & Priest)
    {
      id: 14,
      requester_id: 2, // Fr. Joseph Raj
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'BCC / Anbiam Animation',
      datetime: '2026-10-30T18:30:00.000Z',
      datetime_end: '2026-10-30T20:00:00.000Z',
      location: 'St. Xavier Anbiam Ward, Foreshore Estate, Santhome',
      latitude: 13.0298,
      longitude: 80.2792,
      language: 'Tamil',
      honorarium: '₹ 800',
      notes: 'Ward prayer gathering animation, Gospel sharing, and youth mobilization.',
      status: 'pending',
      applicants: [
        { priest_id: 4, offered_at: '2026-10-16T18:20:00.000Z' }, // Sr. Maria Goretti FMM
        { priest_id: 8, offered_at: '2026-10-17T07:15:00.000Z' }  // Sr. Catherine Therese SCJ
      ],
      created_at: '2026-10-15T12:30:00.000Z'
    },
    // 15. Category C - House Visit (Confirmed - Assigned to Sr. Maria Goretti)
    {
      id: 15,
      requester_id: 2, // Fr. Joseph Raj
      responder_id: 4, // Sr. Maria Goretti FMM
      booking_type: 'open_request',
      service_type: 'House Visit',
      datetime: '2026-10-23T16:00:00.000Z',
      datetime_end: '2026-10-23T18:30:00.000Z',
      location: 'Doveton Nagar Fishermen Colony, Santhome',
      latitude: 13.0315,
      longitude: 80.2780,
      language: 'Tamil',
      honorarium: '₹ 1,000',
      notes: 'Visiting elderly and marginalized parish families with pastoral counseling.',
      status: 'accepted',
      applicants: [
        { priest_id: 4, offered_at: '2026-10-12T14:00:00.000Z' }
      ],
      confirmed_at: '2026-10-13T09:00:00.000Z',
      created_at: '2026-10-11T16:00:00.000Z'
    },
    // 16. Category C - Communion to Sick (Pending, Sister applied)
    {
      id: 16,
      requester_id: 6, // Fr. Anthony Lazar (Tambaram)
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Communion to Sick',
      datetime: '2026-10-27T09:00:00.000Z',
      datetime_end: '2026-10-27T11:30:00.000Z',
      location: 'Suburban Homes, West Tambaram, Chennai',
      latitude: 12.9230,
      longitude: 80.1140,
      language: 'Tamil',
      honorarium: '₹ 800',
      notes: 'Extraordinary Minister of Holy Communion for 6 bedridden parishioners.',
      status: 'pending',
      applicants: [
        { priest_id: 8, offered_at: '2026-10-16T19:00:00.000Z' } // Sr. Catherine Therese SCJ
      ],
      created_at: '2026-10-16T14:00:00.000Z'
    },
    // 17. Category C - Choir Animation (Confirmed - Assigned to Sr. Catherine Therese)
    {
      id: 17,
      requester_id: 6, // Fr. Anthony Lazar
      responder_id: 8, // Sr. Catherine Therese SCJ
      booking_type: 'open_request',
      service_type: 'Choir Animation',
      datetime: '2026-10-24T17:00:00.000Z',
      datetime_end: '2026-10-24T19:00:00.000Z',
      location: 'St. Joseph Church Choir Loft, Tambaram',
      latitude: 12.9249,
      longitude: 80.1165,
      language: 'Tamil & English',
      honorarium: '₹ 1,000',
      notes: 'Vocal training and liturgical choir rehearsal for Christ the King feast.',
      status: 'accepted',
      applicants: [
        { priest_id: 8, offered_at: '2026-10-13T10:00:00.000Z' }
      ],
      confirmed_at: '2026-10-14T08:30:00.000Z',
      created_at: '2026-10-12T11:00:00.000Z'
    },
    // 18. Category C - Altar Decoration (Pending, Open)
    {
      id: 18,
      requester_id: 2, // Fr. Joseph Raj
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Altar Decoration',
      datetime: '2026-10-31T14:00:00.000Z',
      datetime_end: '2026-10-31T18:00:00.000Z',
      location: 'National Shrine of St. Thomas Altar, Santhome',
      latitude: 13.0336,
      longitude: 80.2778,
      language: 'English',
      honorarium: '₹ 1,500',
      notes: 'Floral decoration and sanctuary arrangement for All Saints Day solemnity.',
      status: 'pending',
      applicants: [],
      created_at: '2026-10-16T17:00:00.000Z'
    },

    // 19. Category A - Holy Mass (Confirmed - Fr. Joseph Raj requested, Fr. Jerome SJ confirmed)
    {
      id: 19,
      requester_id: 2, // Fr. Joseph Raj
      responder_id: 7, // Fr. Jerome D Souza SJ
      booking_type: 'open_request',
      service_type: 'Holy Mass (Parish / Convent)',
      datetime: '2026-11-01T06:30:00.000Z',
      datetime_end: '2026-11-01T07:45:00.000Z',
      location: 'St. Thomas Shrine Basilica, Mylapore',
      latitude: 13.0336,
      longitude: 80.2778,
      language: 'English',
      honorarium: '₹ 1,000',
      notes: 'Solemnity of All Saints Morning High Mass.',
      status: 'accepted',
      applicants: [
        { priest_id: 7, offered_at: '2026-10-14T11:30:00.000Z' }
      ],
      confirmed_at: '2026-10-15T10:00:00.000Z',
      created_at: '2026-10-14T09:00:00.000Z'
    },
    // 20. Category A - Marriage Mass (Pending, Open)
    {
      id: 20,
      requester_id: 2, // Fr. Joseph Raj
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Marriage Mass',
      datetime: '2026-11-12T10:30:00.000Z',
      datetime_end: '2026-11-12T12:00:00.000Z',
      location: 'St. Thomas Basilica, Santhome High Road',
      latitude: 13.0336,
      longitude: 80.2778,
      language: 'Tamil',
      honorarium: '₹ 2,000',
      notes: 'Parish marriage celebration. Need main celebrant priest.',
      status: 'pending',
      applicants: [],
      created_at: '2026-10-16T19:30:00.000Z'
    },
    // 21. Category B - Adoration Service (Confirmed - Fr. Anthony Lazar / Fr. Francis Xavier SDB)
    {
      id: 21,
      requester_id: 6, // Fr. Anthony Lazar
      responder_id: 3, // Fr. Francis Xavier SDB
      booking_type: 'open_request',
      service_type: 'Adoration Service',
      datetime: '2026-10-25T18:00:00.000Z',
      datetime_end: '2026-10-25T19:30:00.000Z',
      location: 'St. Joseph Church Adoration Chapel, Tambaram',
      latitude: 12.9249,
      longitude: 80.1165,
      language: 'Tamil',
      honorarium: '₹ 1,200',
      notes: 'Youth Sunday special praise, adoration and benediction.',
      status: 'accepted',
      applicants: [
        { priest_id: 3, offered_at: '2026-10-14T18:00:00.000Z' }
      ],
      confirmed_at: '2026-10-15T08:00:00.000Z',
      created_at: '2026-10-13T14:00:00.000Z'
    },
    // 22. Category C - BCC / Anbiam Animation (Sister Maria Goretti exploring / pending)
    {
      id: 22,
      requester_id: 6, // Fr. Anthony Lazar
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'BCC / Anbiam Animation',
      datetime: '2026-11-04T18:30:00.000Z',
      datetime_end: '2026-11-04T20:00:00.000Z',
      location: 'Subramaniam Nagar Ward, Tambaram West',
      latitude: 12.9260,
      longitude: 80.1120,
      language: 'Tamil',
      honorarium: '₹ 800',
      notes: 'BCC leadership formation and rosary devotion animation.',
      status: 'pending',
      applicants: [],
      created_at: '2026-10-16T13:00:00.000Z'
    },
    // 23. Category A - Concelebration (Pending, 1 applicant)
    {
      id: 23,
      requester_id: 5, // Sr. Agnes Clara
      responder_id: null,
      booking_type: 'open_request',
      service_type: 'Concelebration (Feasts & Events)',
      datetime: '2026-11-18T17:30:00.000Z',
      datetime_end: '2026-11-18T19:30:00.000Z',
      location: 'St. Anthony Girls Convent Auditorium, Madhavaram',
      latitude: 13.1489,
      longitude: 80.2306,
      language: 'English & Tamil',
      honorarium: '₹ 1,500',
      notes: 'Convent Patronal Jubilee Celebration High Mass.',
      status: 'pending',
      applicants: [
        { priest_id: 9, offered_at: '2026-10-16T20:00:00.000Z' } // Fr. Jude Peter OFM Cap
      ],
      created_at: '2026-10-16T09:00:00.000Z'
    },
    // 24. Category B - House Blessing (Confirmed - Fr. Joseph Raj / Fr. Jude Peter)
    {
      id: 24,
      requester_id: 2, // Fr. Joseph Raj
      responder_id: 9, // Fr. Jude Peter OFM Cap
      booking_type: 'open_request',
      service_type: 'House Blessing',
      datetime: '2026-10-26T18:00:00.000Z',
      datetime_end: '2026-10-26T19:00:00.000Z',
      location: 'Karpagam Avenue, R.A. Puram, Chennai',
      latitude: 13.0235,
      longitude: 80.2612,
      language: 'English & Tamil',
      honorarium: '₹ 1,000',
      notes: 'Apartment blessing prayer and family consecration.',
      status: 'accepted',
      applicants: [
        { priest_id: 9, offered_at: '2026-10-15T16:30:00.000Z' }
      ],
      confirmed_at: '2026-10-16T09:00:00.000Z',
      created_at: '2026-10-14T15:00:00.000Z'
    },
    // 25. Category C - Catechism (Confirmed - Fr. Joseph Raj / Sr. Catherine Therese)
    {
      id: 25,
      requester_id: 2, // Fr. Joseph Raj
      responder_id: 8, // Sr. Catherine Therese SCJ
      booking_type: 'open_request',
      service_type: 'Catechism',
      datetime: '2026-10-18T08:30:00.000Z',
      datetime_end: '2026-10-18T10:00:00.000Z',
      location: 'Santhome Sunday School Hall, Chennai',
      latitude: 13.0336,
      longitude: 80.2778,
      language: 'Tamil',
      honorarium: '₹ 800',
      notes: 'Confirmation class weekend intensive animation.',
      status: 'accepted',
      applicants: [
        { priest_id: 8, offered_at: '2026-10-15T18:00:00.000Z' }
      ],
      confirmed_at: '2026-10-16T10:00:00.000Z',
      created_at: '2026-10-15T08:00:00.000Z'
    }
  ];

  // Realistic Availability Slots (Supply Priests available for call & supply duty)
  const todayStr = new Date().toISOString().split('T')[0];
  const availability_slots = [
    {
      id: 1,
      priest_id: 3, // Fr. Francis Xavier SDB
      date: todayStr,
      time_start: '06:00',
      time_end: '20:00',
      languages: ['Tamil', 'English'],
      notes: 'Available for evening masses or recollection talk in Chennai central',
      status: 'available',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      priest_id: 7, // Fr. Jerome D Souza SJ
      date: todayStr,
      time_start: '07:00',
      time_end: '18:00',
      languages: ['English', 'Tamil'],
      notes: 'Free from lectures; available for confession ministry or adoration',
      status: 'available',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      priest_id: 9, // Fr. Jude Peter OFM Cap
      date: todayStr,
      time_start: '06:00',
      time_end: '21:00',
      languages: ['Tamil', 'Malayalam'],
      notes: 'Supply ministry open for North and Central Chennai',
      status: 'available',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      priest_id: 10, // Fr. Paul Duraisamy
      date: todayStr,
      time_start: '06:00',
      time_end: '12:00',
      languages: ['Tamil', 'English'],
      notes: 'Available for morning mass supply in South Chennai',
      status: 'available',
      created_at: new Date().toISOString()
    }
  ];

  // 1. Write fresh data to local db.json
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const freshDbData = {
    users,
    bookings,
    availability_slots
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(freshDbData, null, 2), 'utf8');
  console.log('✓ Successfully wrote fresh 10 users, 25 bookings, and 4 availability slots to server/data/db.json.');

  // 2. Insert into Turso Cloud if available
  if (tursoClient) {
    console.log('☁️ Syncing fresh seed into Turso Cloud Database...');

    for (const u of users) {
      await tursoClient.execute({
        sql: `INSERT INTO users (
          id, name, title, congregation_abbr, mobile, email, password_hash, clergy_type, religious_order,
          diocese_province, residence_name, residence_address, latitude, longitude,
          max_travel_km, transport_mode, profile_photo, is_verified, is_admin, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          u.id, u.name, u.title, u.congregation_abbr, u.mobile, u.email, u.password_hash,
          u.clergy_type, u.religious_order, u.diocese_province,
          u.residence_name, u.residence_address, u.latitude, u.longitude,
          u.max_travel_km, u.transport_mode, u.profile_photo, u.is_verified, u.is_admin, u.created_at
        ]
      });
    }
    console.log('✓ Seeded 10 users to Turso.');

    for (const s of availability_slots) {
      await tursoClient.execute({
        sql: `INSERT INTO availability_slots (
          id, priest_id, date, time_start, time_end, languages, notes, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          s.id, s.priest_id, s.date, s.time_start, s.time_end,
          JSON.stringify(s.languages), s.notes, s.status, s.created_at
        ]
      });
    }
    console.log('✓ Seeded availability slots to Turso.');

    for (const b of bookings) {
      await tursoClient.execute({
        sql: `INSERT INTO bookings (
          id, requester_id, responder_id, booking_type, service_type, datetime,
          location, latitude, longitude, language, honorarium, notes, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          b.id, b.requester_id, b.responder_id, b.booking_type,
          b.service_type, b.datetime, b.location, b.latitude, b.longitude,
          b.language, b.honorarium, b.notes, b.status, b.created_at
        ]
      });
    }
    console.log('✓ Seeded 25 bookings to Turso.');
  }

  console.log('🎉 Fresh database seed completed successfully!');
}

seedFresh().catch(console.error);
