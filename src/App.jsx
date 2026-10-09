import React, { useState, useEffect } from 'react';

export default function App() {
  // Authentication & User State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Login Form States (Phone-First)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States (Diocesan & Religious Clergy)
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regClergyType, setRegClergyType] = useState('religious'); // 'religious' or 'diocesan'
  const [regOrder, setRegOrder] = useState('');
  const [regDiocese, setRegDiocese] = useState('');
  const [regResidenceName, setRegResidenceName] = useState('');
  const [regResidenceAddress, setRegResidenceAddress] = useState('');
  const [regLatitude, setRegLatitude] = useState(null);
  const [regLongitude, setRegLongitude] = useState(null);
  const [regMaxTravelKm, setRegMaxTravelKm] = useState(20);
  const [regTransportMode, setRegTransportMode] = useState('own_bike');

  // Application Modes & Views
  // 'roster': Browse available priests (Bike-Taxi style)
  // 'broadcast': Open mass requests posted by parish priests
  // 'admin': Diocesan admin verification queue
  const [activeMode, setActiveMode] = useState('roster');
  const [rosterDateFilter, setRosterDateFilter] = useState('');

  // Data States
  const [availablePriests, setAvailablePriests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  // Modals & Feedback
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showDirectConfirmModal, setShowDirectConfirmModal] = useState(null); // selected priest object
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // New Mass Request Form Fields
  const [bookingLocation, setBookingLocation] = useState('');
  const [bookingDatetime, setBookingDatetime] = useState('');
  const [bookingLanguage, setBookingLanguage] = useState('Tamil');
  const [bookingHonorarium, setBookingHonorarium] = useState('');
  const [bookingServiceType, setBookingServiceType] = useState('Holy Mass');
  const [bookingNotes, setBookingNotes] = useState('');

  // Set Availability Form Fields
  const [availDate, setAvailDate] = useState('');
  const [availStart, setAvailStart] = useState('06:00');
  const [availEnd, setAvailEnd] = useState('12:00');
  const [availLanguages, setAvailLanguages] = useState(['English', 'Tamil']);
  const [availNotes, setAvailNotes] = useState('');

  // Direct Verbal Booking Confirmation Fields
  const [confirmDate, setConfirmDate] = useState('');
  const [confirmLocation, setConfirmLocation] = useState('');
  const [confirmLanguage, setConfirmLanguage] = useState('English');
  const [confirmHonorarium, setConfirmHonorarium] = useState('1000');
  const [confirmServiceType, setConfirmServiceType] = useState('Holy Mass');

  const SERVICE_TYPES = [
    'Holy Mass (Convent / Parish)',
    'Monthly Recollection Talk (Half Day)',
    'Annual Retreat Preacher (3-5 Days)',
    'Solemn Feast Day Mass / Jubilee',
    'Confessions / Penitential Service',
    'Special Eucharistic Adoration'
  ];

  const RELIGIOUS_ORDERS = [
    'Salesians of Don Bosco (SDB)',
    'Society of Jesus / Jesuits (SJ)',
    'Order of Friars Minor Capuchin (OFM Cap)',
    'Congregation of the Most Holy Redeemer (CSsR)',
    'Discalced Carmelites (OCD)',
    'Carmelites of Mary Immaculate (CMI)',
    'Claretian Missionaries (CMF)',
    'Society of the Divine Word (SVD)',
    'Vincentians / Congregation of the Mission (CM)',
    'Other Religious Congregation'
  ];

  const DIOCESES = [
    'Archdiocese of Bangalore',
    'Archdiocese of Madras-Mylapore',
    'Archdiocese of Madurai',
    'Archdiocese of Bombay',
    'Archdiocese of Hyderabad',
    'Archdiocese of Verapoly (Kochi)',
    'Archdiocese of Goa and Daman',
    'Diocese of Coimbatore',
    'Diocese of Mangalore',
    'Diocese of Kottayam'
  ];

  const LANGUAGES = ['English', 'Tamil', 'Malayalam', 'Hindi', 'Kannada', 'Latin', 'Konkani', 'Telugu'];

  useEffect(() => {
    const cached = localStorage.getItem('bookapriest_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        loadDashboardData(parsed);
      } catch (e) {
        localStorage.removeItem('bookapriest_user');
      }
    }
    setLoading(false);
  }, []);

  const getHeaders = (u = user) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${u ? u.id : ''}`
  });

  const loadDashboardData = async (u = user) => {
    if (!u) return;
    try {
      // 1. Fetch live available priests (Roster Mode)
      const queryParams = new URLSearchParams();
      if (rosterDateFilter) queryParams.append('date', rosterDateFilter);
      if (u.latitude) queryParams.append('lat', u.latitude);
      if (u.longitude) queryParams.append('lon', u.longitude);

      const resAvail = await fetch(`/api/availability?${queryParams.toString()}`, { headers: getHeaders(u) });
      if (resAvail.ok) {
        setAvailablePriests(await resAvail.json());
      }

      // 2. Fetch Mass bookings
      const resBookings = await fetch(`/api/bookings?lat=${u.latitude || ''}&lon=${u.longitude || ''}`, { headers: getHeaders(u) });
      if (resBookings.ok) {
        setBookings(await resBookings.json());
      }

      // 3. Fetch Admin Queue if Admin
      if (u.is_admin === 1) {
        const resPending = await fetch('/api/users/pending', { headers: getHeaders(u) });
        if (resPending.ok) {
          setPendingUsers(await resPending.json());
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const showFeedback = (type, message) => {
    if (type === 'error') {
      setErrorMsg(message);
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 6000);
    } else {
      setSuccessMsg(message);
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 6000);
    }
  };

  // 1-Tap Native Device GPS Capture
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      showFeedback('error', 'GPS Location is not supported on this device/browser.');
      return;
    }
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRegLatitude(pos.coords.latitude);
        setRegLongitude(pos.coords.longitude);
        setGpsDetecting(false);
        showFeedback('success', `📍 GPS Location captured! (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      (err) => {
        setGpsDetecting(false);
        showFeedback('error', 'Could not retrieve GPS location. Please ensure location permissions are enabled.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      showFeedback('error', 'Please enter your mobile phone number and password.');
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback('error', data.error || 'Login failed.');
      } else {
        localStorage.setItem('bookapriest_user', JSON.stringify(data.user));
        setUser(data.user);
        showFeedback('success', `Welcome back, Fr. ${data.user.name}!`);
        loadDashboardData(data.user);
      }
    } catch (err) {
      showFeedback('error', 'Network error. Please ensure backend server is reachable.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regMobile || !regPassword) {
      showFeedback('error', 'Name, mobile phone, and password are required.');
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          mobile: regMobile,
          email: regEmail,
          password: regPassword,
          clergy_type: regClergyType,
          religious_order: regClergyType === 'religious' ? regOrder : null,
          diocese_province: regDiocese,
          residence_name: regResidenceName,
          residence_address: regResidenceAddress,
          latitude: regLatitude,
          longitude: regLongitude,
          max_travel_km: regMaxTravelKm,
          transport_mode: regTransportMode
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback('error', data.error || 'Registration failed.');
      } else {
        showFeedback('success', 'Registration submitted! You are placed in the diocesan verification queue.');
        setAuthMode('login');
        setLoginIdentifier(regMobile);
      }
    } catch (err) {
      showFeedback('error', 'Network error submitting registration.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('bookapriest_user');
    setUser(null);
    setAvailablePriests([]);
    setBookings([]);
    setActiveMode('roster');
  };

  // Set Availability Handler ("Go Available")
  const handleSetAvailability = async (e) => {
    e.preventDefault();
    if (!availDate) {
      showFeedback('error', 'Please choose the celebration date.');
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          date: availDate,
          time_start: availStart,
          time_end: availEnd,
          languages: availLanguages,
          notes: availNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Your availability has been saved! Parishes and convents can now find you.');
        setShowAvailabilityModal(false);
        loadDashboardData();
      } else {

        showFeedback('error', data.error || 'Failed to set availability.');
      }
    } catch (err) {
      showFeedback('error', 'Failed to communicate with server.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // 1-Tap Quick Mark Busy Handler
  const handleQuickMarkBusy = async () => {
    try {
      const res = await fetch('/api/availability/quick-busy', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'You are now marked offline/busy. Your slot was removed from the live roster.');
        loadDashboardData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to update status.');
    }
  };

  // Direct Verbal Booking Confirmation Handler
  const handleConfirmDirectBooking = async (e) => {
    e.preventDefault();
    if (!showDirectConfirmModal || !confirmDate || !confirmLocation) {
      showFeedback('error', 'Date/Time and parish location are required.');
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/bookings/confirm-call', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          priestId: showDirectConfirmModal.priest_id,
          datetime: confirmDate,
          location: confirmLocation,
          language: confirmLanguage,
          honorarium: confirmHonorarium,
          service_type: confirmServiceType,
          notes: 'Verbal booking confirmed via phone call'
        })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', `${confirmServiceType} with Fr. ${showDirectConfirmModal.priest_name} confirmed & locked!`);
        setShowDirectConfirmModal(null);
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to confirm booking.');
      }
    } catch (err) {
      showFeedback('error', 'Failed to communicate with server.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Create Broadcast Mass Request
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingLocation || !bookingDatetime || !bookingLanguage) {
      showFeedback('error', 'Venue location, date/time, and language are required.');
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          location: bookingLocation,
          datetime: bookingDatetime,
          language: bookingLanguage,
          honorarium: bookingHonorarium,
          service_type: bookingServiceType,
          notes: bookingNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Mass request broadcasted successfully!');
        setShowRequestModal(false);
        setBookingLocation('');
        setBookingDatetime('');
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to post slot.');
      }
    } catch (err) {
      showFeedback('error', 'Failed to communicate with server.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Accept Broadcast Slot
  const handleAcceptBooking = async (bookingId) => {
    try {
      const res = await fetch('/api/bookings/accept', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookingId })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Mass slot accepted! You can now contact the parish priest via WhatsApp or call.');
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to accept slot.');
      }
    } catch (err) {
      showFeedback('error', 'Failed to communicate with server.');
    }
  };

  // Admin Approve Priest
  const handleVerifyUser = async (userId, approve) => {
    try {
      const res = await fetch('/api/users/verify', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, isVerified: approve ? 1 : 0 })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
        loadDashboardData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to update verification status.');
    }
  };

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    const date = d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  const getWhatsAppLink = (mobileNumber, messageText) => {
    const cleaned = mobileNumber.replace(/[^0-9+]/g, '');
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(messageText)}`;
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div style={{ textAlign: 'center', fontSize: '1.2rem', fontFamily: 'Outfit' }}>
          ⛪ Loading BookaPriest Portal...
        </div>
      </div>
    );
  }

  // --- Login / Register Screen ---
  if (!user) {
    return (
      <div className="auth-page">
        <div className="glass-card auth-card">
          <div className="auth-header">
            <h1>BookaPriest</h1>
            <p>Priest Booking & Liturgical Coordination Platform</p>
          </div>

          {errorMsg && <div className="error-alert">{errorMsg}</div>}
          {successMsg && <div className="success-alert">{successMsg}</div>}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">WHATSAPP MOBILE PHONE OR EMAIL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 98765 43210 or admin@bookapriest.in"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">PASSWORD</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Verifying...' : 'Sign In to Portal'}
              </button>

              <div className="auth-footer">
                New Father?{' '}
                <span className="auth-link" onClick={() => setAuthMode('register')}>
                  Register Account Here
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">FULL NAME</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Rev. Fr. Francis Xavier"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">WHATSAPP MOBILE (+91)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">EMAIL ADDRESS (OPTIONAL)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="father@domain.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Clergy & Religious Sister Affiliation */}
              <div className="form-group">
                <label className="form-label">AFFILIATION / ECCLESIASTICAL ROLE</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className={`btn ${regClergyType === 'religious' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setRegClergyType('religious')}
                    style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                  >
                    ⛪ Religious Priest
                  </button>
                  <button
                    type="button"
                    className={`btn ${regClergyType === 'diocesan' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setRegClergyType('diocesan')}
                    style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                  >
                    🏛️ Diocesan Priest
                  </button>
                  <button
                    type="button"
                    className={`btn ${regClergyType === 'convent' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setRegClergyType('convent')}
                    style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                  >
                    🕊️ Convent / Sister
                  </button>
                </div>
              </div>

              {regClergyType === 'religious' && (
                <div className="form-group">
                  <label className="form-label">RELIGIOUS CONGREGATION / ORDER</label>
                  <input
                    type="text"
                    className="form-input"
                    list="religious-orders-list"
                    placeholder="e.g. Capuchin (OFM Cap), Jesuit (SJ), Salesian (SDB), etc."
                    value={regOrder}
                    onChange={(e) => setRegOrder(e.target.value)}
                    required
                  />
                  <datalist id="religious-orders-list">
                    {RELIGIOUS_ORDERS.map(ord => <option key={ord} value={ord} />)}
                  </datalist>
                </div>
              )}

              {regClergyType === 'diocesan' && (
                <div className="form-group">
                  <label className="form-label">DIOCESE / ARCHDIOCESE</label>
                  <input
                    type="text"
                    className="form-input"
                    list="dioceses-list"
                    placeholder="e.g. Diocese of Thanjavur, Archdiocese of Bangalore, etc."
                    value={regDiocese}
                    onChange={(e) => setRegDiocese(e.target.value)}
                    required
                  />
                  <datalist id="dioceses-list">
                    {DIOCESES.map(dio => <option key={dio} value={dio} />)}
                  </datalist>
                </div>
              )}

              {regClergyType === 'convent' && (
                <div className="form-group">
                  <label className="form-label">SISTERS CONGREGATION (CONVENT ORDER)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Cluny Sisters (SJC), Franciscan Sisters (FMM), Tarbes (SJT), etc."
                    value={regOrder}
                    onChange={(e) => setRegOrder(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Residence & Proximity */}
              <div className="form-group">
                <label className="form-label">
                  {regClergyType === 'convent' ? 'CONVENT / INSTITUTION NAME' : 'RESIDENCE / COMMUNITY HOUSE NAME'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={regClergyType === 'convent' ? "e.g. Cluny Convent, Jalahalli / St. Anne's Convent" : "e.g. Don Bosco TC Palya / St. Joseph's Boys School"}
                  value={regResidenceName}
                  onChange={(e) => setRegResidenceName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">LOCALITY ADDRESS / AREA</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. TC Palya Road, Bangalore - 560036"
                  value={regResidenceAddress}
                  onChange={(e) => setRegResidenceAddress(e.target.value)}
                />
                <button
                  type="button"
                  className="gps-btn"
                  onClick={handleDetectGPS}
                  disabled={gpsDetecting}
                >
                  📍 {gpsDetecting ? 'Detecting GPS...' : regLatitude ? '✓ Base GPS Location Saved' : '1-Tap: Use My Device GPS for Accurate Distance'}
                </button>
              </div>

              {/* Travel Radius is only for Priests who travel for ministry */}
              {regClergyType !== 'convent' && (
                <div className="form-group">
                  <label className="form-label">TRAVEL RADIUS (KM)</label>
                  <select
                    className="form-input"
                    value={regMaxTravelKm}
                    onChange={(e) => setRegMaxTravelKm(e.target.value)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value={10}>Within 10 km</option>
                    <option value={20}>Within 20 km</option>
                    <option value={35}>Within 35 km</option>
                    <option value={50}>Within 50 km</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">PASSWORD</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={formSubmitting}
              >
                {formSubmitting
                  ? 'Registering...'
                  : regClergyType === 'convent'
                    ? 'Register Convent / Sister Account'
                    : 'Request Clergy Credentials'}
              </button>

              <div className="auth-footer">
                Already registered?{' '}
                <span className="auth-link" onClick={() => setAuthMode('login')}>
                  Sign In
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- Main Application Dashboard ---
  return (
    <div className="app-container">
      {/* Header */}
      <header className="navbar">
        <div className="brand-section">
          <span className="brand-logo">BookaPriest</span>
          <span className="brand-badge">India</span>
        </div>

        <div className="nav-user">
          <div className="user-tag">
            <span className="user-name">Fr. {user.name}</span>
            <span className="user-status">
              <span className={`status-dot ${user.is_verified === 1 ? 'verified' : 'pending'}`}></span>
              {user.is_verified === 1 ? 'Verified Clergy' : 'Pending Verification'}
            </span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleSignOut}>
            🚪 Sign Out
          </button>
        </div>
      </header>

      <main className="main-content">
        {errorMsg && <div className="error-alert">{errorMsg}</div>}
        {successMsg && <div className="success-alert">{successMsg}</div>}

        {/* Verification Gate Banner */}
        {user.is_verified !== 1 && user.is_admin !== 1 && (
          <div className="quick-status-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
            <div className="quick-status-info">
              <h4 style={{ color: 'var(--accent-gold)' }}>🔒 Account Under Diocesan Review</h4>
              <p>Your sign-up is awaiting manual verification by the Diocesan Chancellor. Once verified, you can go live on the Availability Roster and post/accept Mass slots.</p>
            </div>
          </div>
        )}

        {/* Admin Navigation Tab */}
        {user.is_admin === 1 && (
          <div className="tabs" style={{ marginBottom: '1rem' }}>
            <div
              className={`tab ${activeMode !== 'admin' ? 'active' : ''}`}
              onClick={() => setActiveMode('roster')}
            >
              ⛪ Liturgical Platform
            </div>
            <div
              className={`tab ${activeMode === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveMode('admin')}
            >
              ⚙️ Admin Verification Queue ({pendingUsers.length})
            </div>
          </div>
        )}

        {activeMode !== 'admin' && (
          <>
            {/* Quick Priest Availability Toggle Banner (Priests Only) */}
            {user.is_verified === 1 && user.clergy_type !== 'convent' && (
              <div className="quick-status-card">
                <div className="quick-status-info">
                  <h4>🕊️ Your Ministry Availability</h4>
                  <p>
                    {user.residence_name ? `📍 ${user.residence_name}` : 'Residence not set'} • Travel radius: {user.max_travel_km} km
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-success btn-sm" onClick={() => setShowAvailabilityModal(true)}>
                    🟢 Set Available Dates
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleQuickMarkBusy}
                    title="Mark yourself offline or busy when you are already engaged"
                    style={{ borderColor: '#CBD5E1', color: '#475569' }}
                  >
                    ⚪ Mark as Busy / Offline
                  </button>
                </div>
              </div>
            )}


            {/* Marketplace Dual-Mode Switcher */}
            <div className="mode-switcher">
              <div
                className={`mode-tab ${activeMode === 'roster' ? 'active' : ''}`}
                onClick={() => setActiveMode('roster')}
              >
                <div className="mode-tab-title">
                  🔍 Find Available Priests
                </div>
                <div className="mode-tab-subtitle">
                  Priests nearby ready to take up ministry
                </div>
              </div>

              <div
                className={`mode-tab ${activeMode === 'broadcast' ? 'active' : ''}`}
                onClick={() => setActiveMode('broadcast')}
              >
                <div className="mode-tab-title">
                  📖 Ministry Requests ({bookings.filter(b => b.status === 'pending').length})
                </div>
                <div className="mode-tab-subtitle">
                  Parishes & Convents needing a priest
                </div>
              </div>
            </div>

            {/* --- MODE 1: AVAILABLE PRIESTS --- */}
            {activeMode === 'roster' && (
              <div>
                <div className="dashboard-header">
                  <div className="dashboard-title">
                    <h2>Available Priests</h2>
                    <p>Verified priests nearby ready for Holy Mass, Recollections, and Retreats</p>
                  </div>
                </div>

                {availablePriests.length === 0 ? (
                  <div className="no-data">
                    <div className="no-data-icon">⛪</div>
                    <p>No priests are currently listed as available for this date.</p>
                    {user.clergy_type !== 'convent' && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Are you free, Father? Tap <strong>"🟢 Go Available for Mass"</strong> above to help parishes and convents find you!
                      </p>
                    )}
                  </div>
                ) : (

                  <div className="roster-grid">
                    {availablePriests.map((slot) => {
                      const isOwnSlot = slot.priest_id === user.id;
                      const callMsg = `Praised be Jesus Christ, Fr. ${slot.priest_name}. I found your availability on BookaPriest for ${slot.date}. Could you please celebrate Mass for our parish?`;

                      return (
                        <div className="priest-card" key={slot.id}>
                          <div className="priest-header">
                            <div>
                              <div className="priest-name">Fr. {slot.priest_name}</div>
                              <div className="priest-order">
                                {slot.clergy_type === 'religious' ? slot.religious_order : slot.diocese_province}
                              </div>
                            </div>
                            {slot.distance_km !== null && (
                              <span className="distance-badge">
                                📍 {slot.distance_km} km away
                              </span>
                            )}
                          </div>

                          <div className="priest-meta-row">
                            <div className="priest-meta-item">
                              <span>📅</span>
                              <strong>Date:</strong> {slot.date} ({slot.time_start} - {slot.time_end})
                            </div>
                            <div className="priest-meta-item">
                              <span>⛪</span>
                              <strong>Base:</strong> {slot.residence_name || slot.diocese_province}
                            </div>
                            <div className="priest-meta-item">
                              <span>🗣️</span>
                              <strong>Languages:</strong> {slot.languages.join(', ')}
                            </div>
                          </div>

                          {/* Verbal Confirmation Handshake Actions */}
                          {!isOwnSlot && user.is_verified === 1 && (
                            <div className="priest-actions">
                              {/* Direct Phone Call (tel:) */}
                              <a href={`tel:${slot.priest_mobile}`} className="btn btn-call btn-sm">
                                📞 Call Priest
                              </a>

                              {/* Direct WhatsApp (wa.me:) */}
                              <a
                                href={getWhatsAppLink(slot.priest_mobile, callMsg)}
                                target="_blank"
                                rel="noreferrer"
                                className="wa-btn"
                              >
                                💬 WhatsApp
                              </a>

                              {/* 1-Tap Verbal Confirmation Button */}
                              <button
                                className="btn confirm-booking-btn btn-sm"
                                onClick={() => {
                                  setShowDirectConfirmModal(slot);
                                  setConfirmDate(`${slot.date}T08:00`);
                                }}
                              >
                                🤝 Verbal Agreement Reached? Confirm Booking
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* --- MODE 2: BROADCAST PARISH REQUESTS --- */}
            {activeMode === 'broadcast' && (
              <div>
                <div className="dashboard-header">
                  <div className="dashboard-title">
                    <h2>Ministry Requests</h2>
                    <p>Parishes & Convents needing a priest. Tap to review details or opt-in to celebrate.</p>
                  </div>
                  {user.is_verified === 1 && (
                    <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
                      ➕ Post Ministry Request
                    </button>
                  )}
                </div>

                <div className="roster-grid">
                  {bookings.filter(b => b.status === 'pending').length === 0 ? (
                    <div className="no-data" style={{ gridColumn: '1 / -1' }}>
                      <div className="no-data-icon">📖</div>
                      <p>No open ministry requests right now.</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Parishes and Convents can tap <strong>"➕ Post Ministry Request"</strong> to request a priest for Mass or Recollections.
                      </p>
                    </div>
                  ) : (

                    bookings.filter(b => b.status === 'pending').map((b) => {
                      const { date, time } = formatDateTime(b.datetime);
                      const isOwn = b.requester_id === user.id;

                      return (
                        <div className="priest-card" key={b.id}>
                          <div className="priest-header">
                            <div>
                              <div className="priest-name">{date}</div>
                              <div style={{ color: 'var(--accent-gold)', fontSize: '0.85rem' }}>⏰ {time}</div>
                            </div>
                            {b.distance_km !== null && (
                              <span className="distance-badge">📍 {b.distance_km} km away</span>
                            )}
                          </div>

                          <div className="priest-meta-row">
                            <div className="priest-meta-item">
                              <span>✨</span>
                              <strong>Service:</strong> <span style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>{b.service_type || 'Holy Mass'}</span>
                            </div>
                            <div className="priest-meta-item">
                              <span>⛪</span>
                              <strong>Venue:</strong> {b.location}
                            </div>
                            <div className="priest-meta-item">
                              <span>🗣️</span>
                              <strong>Language:</strong> {b.language}
                            </div>
                            <div className="priest-meta-item">
                              <span>👤</span>
                              <strong>Requested By:</strong> {b.requester_name.startsWith('Sr.') || b.requester_name.startsWith('Fr.') ? b.requester_name : (b.requester_clergy_type === 'convent' ? `Sr. ${b.requester_name}` : `Fr. ${b.requester_name}`)} ({b.requester_order || b.requester_diocese})
                            </div>
                          </div>

                          {!isOwn && user.is_verified === 1 && (
                            <div className="request-actions-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9' }}>
                              {/* 1. Phone Call */}
                              <a
                                href={`tel:${b.requester_mobile}`}
                                className="btn btn-call btn-sm"
                                style={{ padding: '0.55rem 0.4rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                title="Call Parish or Convent directly"
                              >
                                📞 Call
                              </a>

                              {/* 2. WhatsApp */}
                              <a
                                href={getWhatsAppLink(b.requester_mobile, `Praised be Jesus Christ! I saw your ministry request for ${b.service_type || 'Holy Mass'} at ${b.location} on ${date} (${time}) on BookaPriest.`)}
                                target="_blank"
                                rel="noreferrer"
                                className="wa-btn"
                                style={{ padding: '0.55rem 0.4rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                title="Send WhatsApp Message"
                              >
                                💬 WhatsApp
                              </a>

                              {/* 3. Opt-In Slot */}
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleAcceptBooking(b.id)}
                                style={{ padding: '0.55rem 0.4rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                title="Accept and lock this liturgical service"
                              >
                                ✍️ Opt-In
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* --- ADMIN QUEUE TAB --- */}
        {activeMode === 'admin' && user.is_admin === 1 && (
          <div>
            <div className="dashboard-header">
              <div className="dashboard-title">
                <h2>Admin Manual Verification Queue</h2>
                <p>Verify raw priest and religious order credentials before unlocking app features</p>
              </div>
            </div>

            <div className="admin-queue">
              {pendingUsers.length === 0 ? (
                <div className="no-data">
                  <div className="no-data-icon">👥</div>
                  <p>All registered priests have been verified. No pending reviews in queue.</p>
                </div>
              ) : (
                pendingUsers.map((u) => (
                  <div className="admin-card" key={u.id}>
                    <div className="admin-info">
                      <div className="admin-priest-name">Fr. {u.name}</div>
                      <div className="admin-priest-meta">
                        <span>📱 {u.mobile}</span>
                        <span>⛪ {u.clergy_type === 'religious' ? u.religious_order : u.diocese_province}</span>
                        <span>📍 {u.residence_name || 'No residence set'} ({u.residence_address})</span>
                        <span>🏍️ {u.transport_mode} | Max: {u.max_travel_km} km</span>
                      </div>
                    </div>
                    <div>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleVerifyUser(u.id, true)}
                      >
                        ✓ Approve Priest
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL 1: GO AVAILABLE (Roster Supply) --- */}
      {showAvailabilityModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">🟢 Set Your Availability</h3>
              <button className="modal-close" onClick={() => setShowAvailabilityModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSetAvailability}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">AVAILABLE CELEBRATION DATE</label>
                  <input
                    type="date"
                    className="form-input"
                    value={availDate}
                    onChange={(e) => setAvailDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">START TIME</label>
                    <input
                      type="time"
                      className="form-input"
                      value={availStart}
                      onChange={(e) => setAvailStart(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">END TIME</label>
                    <input
                      type="time"
                      className="form-input"
                      value={availEnd}
                      onChange={(e) => setAvailEnd(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">LANGUAGES YOU CAN CELEBRATE IN</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {LANGUAGES.map(lang => (
                      <span
                        key={lang}
                        className={`card-tag ${availLanguages.includes(lang) ? 'accepted' : 'pending'}`}
                        style={{ cursor: 'pointer', padding: '0.35rem 0.6rem' }}
                        onClick={() => {
                          if (availLanguages.includes(lang)) {
                            setAvailLanguages(availLanguages.filter(l => l !== lang));
                          } else {
                            setAvailLanguages([...availLanguages, lang]);
                          }
                        }}
                      >
                        {lang} {availLanguages.includes(lang) ? '✓' : '+'}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAvailabilityModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={formSubmitting}>Save Availability</button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CONFIRM VERBAL BOOKING --- */}
      {showDirectConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">🤝 Lock Booking with Fr. {showDirectConfirmModal.priest_name}</h3>
              <button className="modal-close" onClick={() => setShowDirectConfirmModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleConfirmDirectBooking}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Confirming this locks the slot, creates the booking record, and removes Fr. {showDirectConfirmModal.priest_name} from the public roster for this date.
                </p>
                <div className="form-group">
                  <label className="form-label">SERVICE TYPE REQUIRED</label>
                  <select
                    className="form-input"
                    value={confirmServiceType}
                    onChange={(e) => setConfirmServiceType(e.target.value)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    {SERVICE_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">PARISH / CONVENT / VENUE LOCATION</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Cluny Convent / St. Anthony's Church"
                    value={confirmLocation}
                    onChange={(e) => setConfirmLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">DATE & TIME</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={confirmDate}
                    onChange={(e) => setConfirmDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LITURGICAL LANGUAGE</label>
                  <select
                    className="form-input"
                    value={confirmLanguage}
                    onChange={(e) => setConfirmLanguage(e.target.value)}
                    style={{ background: '#FFFFFF', color: '#0F172A' }}
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDirectConfirmModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formSubmitting}>Confirm & Lock Slot</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: POST BROADCAST MASS REQUEST --- */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">📢 Post Request for Priest</h3>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateBooking}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">LITURGICAL SERVICE TYPE</label>
                  <select
                    className="form-input"
                    value={bookingServiceType}
                    onChange={(e) => setBookingServiceType(e.target.value)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    {SERVICE_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">PARISH / CONVENT / VENUE LOCATION</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. St. Charles Convent / Infant Jesus Church"
                    value={bookingLocation}
                    onChange={(e) => setBookingLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CELEBRATION DATE & TIME</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={bookingDatetime}
                    onChange={(e) => setBookingDatetime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LITURGICAL LANGUAGE</label>
                  <select
                    className="form-input"
                    value={bookingLanguage}
                    onChange={(e) => setBookingLanguage(e.target.value)}
                    style={{ background: '#FFFFFF', color: '#0F172A' }}
                  >
                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowRequestModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formSubmitting}>Broadcast Request</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
