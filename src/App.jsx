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
  // 'broadcast': Do you need to book a priest?
  // 'roster': Are you available for ministry outside?
  // 'admin': Diocesan admin verification queue
  const [activeMode, setActiveMode] = useState('broadcast');
  const [rosterDateFilter, setRosterDateFilter] = useState('');

  // Data States
  const [availablePriests, setAvailablePriests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [myStatus, setMyStatus] = useState('available');
  const [requestsTab, setRequestsTab] = useState('open'); // 'open' (requested) vs 'accepted' (confirmed with contact)
  const [myUnavailableSlots, setMyUnavailableSlots] = useState([]);
  const [calMonthOffset, setCalMonthOffset] = useState(0); // 0 = current month, 1 = next month, etc.

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
  const [bookingDate, setBookingDate] = useState('');
  const [bookingEndDate, setBookingEndDate] = useState('');
  const [bookingTimeStart, setBookingTimeStart] = useState('06:30');
  const [bookingTimeEnd, setBookingTimeEnd] = useState('07:30');
  const [bookingLanguage, setBookingLanguage] = useState('Tamil');
  const [bookingHonorarium, setBookingHonorarium] = useState('');
  const [bookingServiceType, setBookingServiceType] = useState('Holy Mass');
  const [bookingNotes, setBookingNotes] = useState('');

  // Set Availability Form Fields (Date Range & Times)
  const [availStartDate, setAvailStartDate] = useState('');
  const [availEndDate, setAvailEndDate] = useState('');
  const [availStart, setAvailStart] = useState('06:00');
  const [availEnd, setAvailEnd] = useState('22:00');

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

  // 15-minute interval options for single scroll & select (e.g. 06:00 AM, 06:15 AM)
  const TIME_SLOTS_15MIN = (() => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour24 = String(h).padStart(2, '0');
        const minStr = String(m).padStart(2, '0');
        const period = h < 12 ? 'AM' : 'PM';
        let displayHour = h % 12;
        if (displayHour === 0) displayHour = 12;
        const displayLabel = `${displayHour}:${minStr} ${period}`;
        slots.push({ value: `${hour24}:${minStr}`, label: displayLabel });
      }
    }
    return slots;
  })();

  // Helper to generate Google Calendar month grid
  const getCalendarDays = (monthOffset = 0) => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = target.getFullYear();
    const month = target.getMonth();
    const monthName = target.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Leading empty days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Month days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, dateStr });
    }
    return { monthName, days, year, month };
  };

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

      // 4. Fetch Priest's Own Status & Future Unavailability
      if (u.is_verified === 1 && u.clergy_type !== 'convent') {
        const resStatus = await fetch('/api/availability/my-status', { headers: getHeaders(u) });
        if (resStatus.ok) {
          const statusData = await resStatus.json();
          setMyStatus(statusData.status);
        }

        const resUnavail = await fetch('/api/availability/my-unavailability', { headers: getHeaders(u) });
        if (resUnavail.ok) {
          setMyUnavailableSlots(await resUnavail.json());
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

  // Set Unavailable Dates Handler (Date Range & Time)
  const handleSetUnavailableDates = async (e) => {
    e.preventDefault();
    if (!availStartDate) {
      showFeedback('error', 'Please choose the start date you will be unavailable.');
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/availability/unavailable', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          startDate: availStartDate,
          endDate: availEndDate || availStartDate,
          startTime: availStart,
          endTime: availEnd
        })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', `Marked as Unavailable from ${availStartDate}${availEndDate && availEndDate !== availStartDate ? ` to ${availEndDate}` : ''}.`);
        setShowAvailabilityModal(false);
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to update unavailable dates.');
      }
    } catch (err) {
      showFeedback('error', 'Failed to communicate with server.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Remove an unavailable date block
  const handleClearUnavailableDate = async (dateStr) => {
    try {
      const res = await fetch(`/api/availability/unavailable/${dateStr}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showFeedback('success', `Unavailability removed for ${dateStr}. You are now available!`);
        loadDashboardData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to clear unavailable date.');
    }
  };

  // 1-Tap Toggle Status Handler (Always Available by Default)
  const handleToggleStatus = async () => {
    try {
      const res = await fetch('/api/availability/toggle-status', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
        if (data.status) {
          setMyStatus(data.status);
        }
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to update status.');
      }
    } catch (err) {
      showFeedback('error', 'Failed to update status. Please ensure server is running.');
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
    if (!bookingLocation || !bookingDate || !bookingLanguage) {
      showFeedback('error', 'Venue location, date, and liturgical language are required.');
      return;
    }

    // Combine selected date and time for start and end
    const toDate = bookingEndDate || bookingDate;
    const formattedDatetime = `${bookingDate}T${bookingTimeStart}:00`;
    const formattedDatetimeEnd = `${toDate}T${bookingTimeEnd}:00`;

    setFormSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          location: bookingLocation,
          datetime: formattedDatetime,
          datetime_end: formattedDatetimeEnd,
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
        setBookingDate('');
        setBookingEndDate('');
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

  // Available Priest Offers Ministry for an open request (request stays open)
  const handleOfferMinistry = async (bookingId) => {
    try {
      const res = await fetch('/api/bookings/offer', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookingId })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Your offer to take up this ministry has been sent! The parish/convent will review and confirm.');
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to offer ministry.');
      }
    } catch (err) {
      showFeedback('error', 'Failed to communicate with server.');
    }
  };

  // Requester Confirms a specific priest from the applicant list (Locks ticket, reveals contacts)
  const handleConfirmApplicant = async (bookingId, priestId, priestName) => {
    try {
      const res = await fetch('/api/bookings/confirm-applicant', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookingId, priestId })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', `Fr. ${priestName} is confirmed! Contact details and WhatsApp have been unlocked.`);
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to confirm priest.');
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

  const formatDateTime = (isoString, isoEndString = null) => {
    const d = new Date(isoString);
    let date = d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    let time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (isoEndString) {
      const dEnd = new Date(isoEndString);
      const timeEnd = dEnd.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
      time = `${time} – ${timeEnd}`;
      const endDate = dEnd.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
      if (endDate !== date) {
        date = `${date} → ${endDate}`;
      }
    }
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
            {/* CARD 1: DO YOU WANT TO FIND A PRIEST? */}
            <div className="quick-status-card" style={{ marginBottom: '1.25rem', background: '#F8FAFC', borderColor: '#E2E8F0' }}>
              <div className="quick-status-info">
                <h4>📖 Do You Want to Find a Priest?</h4>
                <p>
                  Need a priest for Holy Mass, Recollection, or Retreat? Post a ministry request to broadcast to available priests.
                </p>
              </div>
              <div>
                {user.is_verified === 1 && (
                  <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
                    ➕ Post a Ministry Request
                  </button>
                )}
              </div>
            </div>

            {/* CARD 2: ARE YOU AVAILABLE FOR MINISTRY OUTSIDE? */}
            {user.is_verified === 1 && user.clergy_type !== 'convent' && (() => {
              const isAvailable = myStatus === 'available';

              return (
                <div className="quick-status-card" style={{ marginBottom: '1.75rem' }}>
                  <div className="quick-status-info">
                    <h4>🕊️ Are You Available for Ministry Outside?</h4>
                    <p>
                      {user.residence_name ? `📍 ${user.residence_name}` : 'Residence not set'} • Travel radius: {user.max_travel_km} km • Status: <strong>{isAvailable ? '🟢 Available' : '🔴 Busy (Default)'}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Switch-like Toggle Control: Available / Busy */}
                    <div 
                      className="status-switch-container"
                      onClick={handleToggleStatus}
                      role="button"
                      tabIndex={0}
                      title="Click to switch your status between Available and Busy"
                    >
                      <span className={`status-switch-option ${isAvailable ? 'active-available' : ''}`}>
                        🟢 Available
                      </span>
                      <span className={`status-switch-option ${!isAvailable ? 'active-busy' : ''}`}>
                        🔴 Busy
                      </span>
                    </div>

                    {/* Set Future Unavailability button */}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowAvailabilityModal(true)}
                      title="Set upcoming dates when you will be away or busy"
                      style={{ borderColor: '#CBD5E1', color: '#334155', fontWeight: 600 }}
                    >
                      🗓️ Set Your Future Unavailability
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* CARD 3: RELEVANT MINISTRY REQUESTS WITH TWO TABS (REQUESTED VS ACCEPTED) */}
            <div style={{ marginTop: '0.5rem' }}>
              <div className="dashboard-header" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
                <div className="dashboard-title">
                  <h2>Relevant Ministry Requests</h2>
                  <p>Browse open liturgical needs or view confirmed celebrations to contact the priest/parish.</p>
                </div>
              </div>

              {/* Sub-Tabs: Requested vs Accepted */}
              <div className="tabs" style={{ marginBottom: '1.25rem' }}>
                <div
                  className={`tab ${requestsTab === 'open' ? 'active' : ''}`}
                  onClick={() => setRequestsTab('open')}
                >
                  ⏳ Open Requests ({bookings.filter(b => b.status === 'pending').length})
                </div>
                <div
                  className={`tab ${requestsTab === 'accepted' ? 'active' : ''}`}
                  onClick={() => setRequestsTab('accepted')}
                >
                  🤝 Confirmed & Accepted ({bookings.filter(b => b.status === 'accepted' || b.status === 'completed').length})
                </div>
              </div>

              <div className="roster-grid">
                {(() => {
                  const filteredBookings = bookings.filter(b => {
                    if (requestsTab === 'open') return b.status === 'pending';
                    return b.status === 'accepted' || b.status === 'completed';
                  });

                  if (filteredBookings.length === 0) {
                    return (
                      <div className="no-data" style={{ gridColumn: '1 / -1' }}>
                        <div className="no-data-icon">{requestsTab === 'open' ? '📖' : '🤝'}</div>
                        <p>
                          {requestsTab === 'open'
                            ? 'No open ministry requests waiting for a priest.'
                            : 'No confirmed celebrations found yet.'}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {requestsTab === 'open'
                            ? 'Parishes and Convents can click "➕ Post a Ministry Request" to broadcast a need.'
                            : 'When a parish chooses and confirms a priest, it will appear here with direct contact details.'}
                        </p>
                      </div>
                    );
                  }

                  return filteredBookings.map((b) => {
                    const { date, time } = formatDateTime(b.datetime, b.datetime_end);
                    const isMyRequest = b.requester_id === user.id;
                    const isConfirmed = b.status === 'accepted' || b.status === 'completed';
                    const isConfirmedPriest = b.responder_id === user.id;
                    const hasOffered = (b.applicants || []).some(a => a.priest_id === user.id);

                    return (
                      <div className="priest-card" key={b.id} style={{ borderColor: isConfirmed ? '#BBF7D0' : '#E2E8F0' }}>
                        <div className="priest-header">
                          <div>
                            <div className="priest-name">{date}</div>
                            <div style={{ color: 'var(--accent-gold)', fontSize: '0.85rem' }}>⏰ {time}</div>
                          </div>
                          <span
                            className={`distance-badge ${isConfirmed ? 'badge-confirmed' : ''}`}
                            style={{ background: isConfirmed ? '#DCFCE7' : '#EFF6FF', color: isConfirmed ? '#15803D' : '#1D4ED8' }}
                          >
                            {isConfirmed ? '🔒 Confirmed & Locked' : '⏳ Open Request'}
                          </span>
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
                          {b.distance_km !== null && (
                            <div className="priest-meta-item">
                              <span>📍</span>
                              <strong>Distance:</strong> {b.distance_km} km away
                            </div>
                          )}
                          {b.notes && (
                            <div className="priest-meta-item" style={{ gridColumn: '1 / -1', fontStyle: 'italic', color: '#64748B' }}>
                              <span>📝</span>
                              <strong>Note:</strong> {b.notes}
                            </div>
                          )}
                        </div>

                        {/* CASE A: ACCEPTED TAB - DISPLAY CONTACT OPTIONS */}
                        {isConfirmed && (
                          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', padding: '0.9rem', marginTop: 'auto' }}>
                            <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                              🤝 Confirmed Celebrant: Fr. {b.responder_name}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#15803D', marginBottom: '0.75rem' }}>
                              {b.responder_order || b.responder_diocese}
                            </div>

                            {/* Contact buttons visible to confirmed celebrant and requester */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <a
                                href={`tel:${isMyRequest ? b.responder_mobile : b.requester_mobile}`}
                                className="btn btn-call btn-sm"
                              >
                                📞 Call {isMyRequest ? 'Priest' : 'Parish'}
                              </a>
                              <a
                                href={getWhatsAppLink(isMyRequest ? b.responder_mobile : b.requester_mobile, `Praised be Jesus Christ! Regarding our confirmed booking for ${b.service_type || 'Holy Mass'} at ${b.location} on ${date} (${time}).`)}
                                target="_blank"
                                rel="noreferrer"
                                className="wa-btn"
                              >
                                💬 WhatsApp
                              </a>
                            </div>
                          </div>
                        )}

                        {/* CASE B: OPEN TAB - MY REQUEST: REVIEW CANDIDATES WHO OFFERED */}
                        {!isConfirmed && isMyRequest && (
                          <div className="applicants-box">
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>👨‍⚖️ Priests Willing to Come ({(b.applicants || []).length})</span>
                            </div>

                            {(b.applicants || []).length === 0 ? (
                              <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                                Waiting for available priests to opt-in for this ministry.
                              </p>
                            ) : (
                              (b.applicants || []).map(cand => (
                                <div className="applicant-card" key={cand.priest_id}>
                                  <div>
                                    <div className="applicant-name">Fr. {cand.priest_name}</div>
                                    <div className="applicant-sub">
                                      {cand.clergy_type === 'religious' ? cand.religious_order : cand.diocese_province}
                                      {cand.residence_name ? ` • 📍 ${cand.residence_name}` : ''}
                                      {cand.distance_km !== null ? ` (${cand.distance_km} km away)` : ''}
                                    </div>
                                  </div>
                                  <button
                                    className="btn-confirm-priest"
                                    onClick={() => handleConfirmApplicant(b.id, cand.priest_id, cand.priest_name)}
                                  >
                                    ✓ Choose Fr. {cand.priest_name.split(' ')[0]}
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* CASE C: OPEN TAB - I AM A PRIEST: OPT IN / OFFER MINISTRY */}
                        {!isConfirmed && !isMyRequest && user.is_verified === 1 && user.clergy_type !== 'convent' && (
                          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                            {hasOffered ? (
                              <div style={{ background: '#FEF9C3', color: '#854D0E', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', fontWeight: 600, textAlign: 'center' }}>
                                ✓ You have opted-in for this ministry. Awaiting parish/convent selection.
                              </div>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleOfferMinistry(b.id)}
                                style={{ width: '100%', padding: '0.65rem' }}
                              >
                                ✍️ Opt-In to Celebrate this Ministry
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
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

      {/* --- MODAL 1: SET UNAVAILABLE DATES --- */}
      {showAvailabilityModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">🗓️ Unavailable Dates</h3>
              <button className="modal-close" onClick={() => setShowAvailabilityModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSetUnavailableDates}>
              <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                  Click on the calendar to select a <strong>Start Date</strong> and <strong>End Date</strong> range, or enter below. Click any blocked date to remove it.
                </p>

                {/* --- GOOGLE CALENDAR MONTH VIEW --- */}
                {(() => {
                  const { monthName, days } = getCalendarDays(calMonthOffset);
                  const todayStr = new Date().toISOString().split('T')[0];
                  const blockedDates = new Set(myUnavailableSlots.map(s => s.date));

                  const handleDayClick = (dateStr) => {
                    if (!dateStr) return;
                    if (blockedDates.has(dateStr)) {
                      handleClearUnavailableDate(dateStr);
                      return;
                    }
                    if (!availStartDate || (availStartDate && availEndDate)) {
                      setAvailStartDate(dateStr);
                      setAvailEndDate('');
                    } else if (availStartDate && !availEndDate) {
                      if (dateStr < availStartDate) {
                        setAvailEndDate(availStartDate);
                        setAvailStartDate(dateStr);
                      } else {
                        setAvailEndDate(dateStr);
                      }
                    }
                  };

                  return (
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      {/* Month Navigation */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.85rem' }}
                          onClick={() => setCalMonthOffset(prev => prev - 1)}
                        >
                          ◀ Prev
                        </button>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.98rem' }}>
                          📅 {monthName}
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.85rem' }}
                          onClick={() => setCalMonthOffset(prev => prev + 1)}
                        >
                          Next ▶
                        </button>
                      </div>

                      {/* Day of Week Header */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 700, fontSize: '0.72rem', color: '#64748B', marginBottom: '0.35rem' }}>
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(dw => (
                          <div key={dw} style={{ padding: '0.2rem' }}>{dw}</div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                        {days.map((item, idx) => {
                          if (!item) return <div key={`empty-${idx}`} style={{ minHeight: '38px' }} />;
                          const { day, dateStr } = item;
                          const isPast = dateStr < todayStr;
                          const isBlocked = blockedDates.has(dateStr);
                          const isStart = dateStr === availStartDate;
                          const isEnd = dateStr === availEndDate;
                          const inRange = availStartDate && availEndDate && dateStr >= availStartDate && dateStr <= availEndDate;

                          let bg = '#F8FAFC';
                          let color = '#1E293B';
                          let border = '1px solid #E2E8F0';
                          let fontWeight = 500;

                          if (isBlocked) {
                            bg = '#FEE2E2';
                            color = '#991B1B';
                            border = '1px solid #F87171';
                            fontWeight = 700;
                          } else if (isStart || isEnd) {
                            bg = '#1E3A8A';
                            color = '#FFFFFF';
                            border = '1px solid #1E3A8A';
                            fontWeight = 800;
                          } else if (inRange) {
                            bg = '#DBEAFE';
                            color = '#1E3A8A';
                            border = '1px solid #93C5FD';
                          }

                          return (
                            <button
                              type="button"
                              key={dateStr}
                              onClick={() => handleDayClick(dateStr)}
                              disabled={isPast}
                              title={isBlocked ? 'Blocked (Click to unblock)' : dateStr}
                              style={{
                                background: bg,
                                color: isPast ? '#CBD5E1' : color,
                                border,
                                borderRadius: '6px',
                                minHeight: '38px',
                                padding: '0.2rem',
                                cursor: isPast ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>{day}</span>
                              {isBlocked && (
                                <span style={{ fontSize: '0.62rem', color: '#DC2626', lineHeight: 1 }}>Busy ✕</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.6rem', fontSize: '0.72rem', color: '#64748B', justifyContent: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ width: 10, height: 10, background: '#1E3A8A', borderRadius: 2 }} /> Selected
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ width: 10, height: 10, background: '#DBEAFE', borderRadius: 2 }} /> In Range
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ width: 10, height: 10, background: '#FEE2E2', border: '1px solid #F87171', borderRadius: 2 }} /> Unavailable / Busy
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* --- RANGE DATE SELECTION (NO TIMING NEEDED) --- */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  {/* FROM DATE */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E3A8A', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>🛫</span> FROM DATE
                    </div>
                    <input
                      type="date"
                      className="form-input"
                      value={availStartDate}
                      onChange={(e) => {
                        setAvailStartDate(e.target.value);
                        if (!availEndDate) setAvailEndDate(e.target.value);
                      }}
                      required
                      style={{ background: '#FFFFFF', padding: '0.55rem', fontSize: '0.92rem' }}
                    />
                  </div>

                  {/* TO DATE */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E3A8A', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>🛬</span> TO DATE
                    </div>
                    <input
                      type="date"
                      className="form-input"
                      value={availEndDate || availStartDate}
                      min={availStartDate}
                      onChange={(e) => setAvailEndDate(e.target.value)}
                      style={{ background: '#FFFFFF', padding: '0.55rem', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAvailabilityModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formSubmitting || !availStartDate}>
                    {formSubmitting ? 'Saving...' : 'Mark as Unavailable'}
                  </button>
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
                  <label className="form-label">CHOOSE CELEBRATION DATE</label>
                  <input
                    type="date"
                    className="form-input"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    style={{ background: '#FFFFFF' }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">FROM TIME</label>
                    <select
                      className="form-input"
                      value={bookingTimeStart}
                      onChange={(e) => setBookingTimeStart(e.target.value)}
                      style={{ background: '#FFFFFF', color: '#0F172A', fontWeight: 600, fontSize: '0.95rem' }}
                    >
                      {TIME_SLOTS_15MIN.map(slot => (
                        <option key={`start-${slot.value}`} value={slot.value}>{slot.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">TO TIME</label>
                    <select
                      className="form-input"
                      value={bookingTimeEnd}
                      onChange={(e) => setBookingTimeEnd(e.target.value)}
                      style={{ background: '#FFFFFF', color: '#0F172A', fontWeight: 600, fontSize: '0.95rem' }}
                    >
                      {TIME_SLOTS_15MIN.map(slot => (
                        <option key={`end-${slot.value}`} value={slot.value}>{slot.label}</option>
                      ))}
                    </select>
                  </div>
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
