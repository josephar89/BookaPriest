import React, { useState, useEffect } from 'react';

export default function App() {
  // Authentication & User State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Login Form States (Phone-First)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States (Diocesan & Religious Clergy)
  const [regTitle, setRegTitle] = useState(''); // mandatory choice: 'Fr.', 'Br.', 'Sr.'
  const [regName, setRegName] = useState('');
  const [regCongregationAbbr, setRegCongregationAbbr] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regClergyType, setRegClergyType] = useState('religious'); // 'religious' or 'diocesan'
  const [regOrder, setRegOrder] = useState('');
  const [regDiocese, setRegDiocese] = useState('');
  const [regResidenceName, setRegResidenceName] = useState('');
  const [regResidenceAddress, setRegResidenceAddress] = useState('');
  const [regPincode, setRegPincode] = useState('');
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
  const [requestsTab, setRequestsTab] = useState('open'); // 'open' (open to opt-in) vs 'review' (priests opted in, awaiting requester to lock) vs 'accepted' (locked/confirmed)
  const [priestRolePerspective, setPriestRolePerspective] = useState('celebrate'); // 'celebrate' (Serve: ministry needs & offers) vs 'request' (Supply: needs Father posted)
  const [priestFilterRadius, setPriestFilterRadius] = useState(5); // 5 km default, up to 100 or 'all' km
  const [priestSortBy, setPriestSortBy] = useState('date_asc'); // 'date_asc', 'distance_asc', 'recent_posted', 'date_desc'
  const [priestFilterService, setPriestFilterService] = useState('all'); // 'all', 'mass', 'recollection', 'feast', etc.
  const [priestFilterLanguage, setPriestFilterLanguage] = useState('all'); // 'all', 'Tamil', 'English', etc.
  const [showPriestFilterDrawer, setShowPriestFilterDrawer] = useState(false);
  const [myUnavailableSlots, setMyUnavailableSlots] = useState([]);
  const [calMonthOffset, setCalMonthOffset] = useState(0); // 0 = current month, 1 = next month, etc.

  // Modals & Feedback
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showDirectConfirmModal, setShowDirectConfirmModal] = useState(null); // selected priest object
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false); // Notifications & Timeline modal
  const [showCalendarModal, setShowCalendarModal] = useState(false); // Monthly Booking Calendar Modal
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(null); // Selected date string 'YYYY-MM-DD'
  const [showTitlePickerModal, setShowTitlePickerModal] = useState(false);
  const [showPhoneInfoTip, setShowPhoneInfoTip] = useState(false);
  const [showPrivacyPage, setShowPrivacyPage] = useState(false);
  const [showAdminOnboardModal, setShowAdminOnboardModal] = useState(false);
  const [adminOnboardSuccess, setAdminOnboardSuccess] = useState(null); // stores { user, initialPassword, waLink }
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Edit Profile Form States
  const [editTitle, setEditTitle] = useState('Fr.');
  const [editName, setEditName] = useState('');
  const [editCongregationAbbr, setEditCongregationAbbr] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editClergyType, setEditClergyType] = useState('religious');
  const [editOrder, setEditOrder] = useState('');
  const [editDiocese, setEditDiocese] = useState('');
  const [editResidenceName, setEditResidenceName] = useState('');
  const [editResidenceAddress, setEditResidenceAddress] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editLatitude, setEditLatitude] = useState(null);
  const [editLongitude, setEditLongitude] = useState(null);
  const [editMaxTravelKm, setEditMaxTravelKm] = useState(25);
  const [editTransportMode, setEditTransportMode] = useState('own_bike');
  const [editProfilePhoto, setEditProfilePhoto] = useState(null);
  const [regProfilePhoto, setRegProfilePhoto] = useState(null);

  // Direct Admin Onboarding Form States
  const [onboardTitle, setOnboardTitle] = useState('Sr.');
  const [onboardName, setOnboardName] = useState('');
  const [onboardCongregationAbbr, setOnboardCongregationAbbr] = useState('');
  const [onboardMobile, setOnboardMobile] = useState('');
  const [onboardOrder, setOnboardOrder] = useState('');
  const [onboardDiocese, setOnboardDiocese] = useState('');
  const [onboardClergyType, setOnboardClergyType] = useState('convent');
  const [onboardResidenceName, setOnboardResidenceName] = useState('');
  const [onboardAddress, setOnboardAddress] = useState('');
  const [onboardPincode, setOnboardPincode] = useState('');
  const [onboardPassword, setOnboardPassword] = useState('Jesus@123');

  // Helper to extract abbreviation from congregation string like "Salesians of Don Bosco (SDB)" -> "SDB"
  const extractAbbr = (str) => {
    if (!str) return '';
    const match = str.match(/\(([^)]+)\)/);
    return match ? match[1].trim() : '';
  };

  // Helper to extract 10 digits and auto-format as "XXXXX XXXXX" for readable Indian mobile numbers
  const formatMobileDisplay = (raw) => {
    if (!raw) return '';
    // Strip non-digits
    let digits = raw.replace(/\D/g, '');
    // If it starts with 91 and has > 10 digits, strip leading 91
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length > 10 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    // Limit to 10 digits
    digits = digits.slice(0, 10);
    // Format with middle space if > 5 digits
    if (digits.length > 5) {
      return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return digits;
  };

  // Helper to get canonical +919876543210
  const getCanonicalMobile = (raw) => {
    if (!raw) return '';
    let digits = raw.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length > 10 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    return digits ? `+91${digits}` : '';
  };

  // Helper to build canonical ecclesiastical display name
  const formatEcclesiasticalName = (personOrTitle, rawName, rawAbbr) => {
    let t, n, abbr;
    if (typeof personOrTitle === 'object' && personOrTitle !== null) {
      const p = personOrTitle;
      t = p.title || (p.clergy_type === 'convent' || p.clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.');
      n = p.name || '';
      abbr = p.congregation_abbr || '';
    } else {
      t = personOrTitle || 'Fr.';
      n = rawName || '';
      abbr = rawAbbr || '';
    }
    let cleanName = n.replace(/^(Rev\.\s*|Fr\.\s*|Br\.\s*|Sr\.\s*)+/i, '').trim();
    if (abbr) {
      const escapedAbbr = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      cleanName = cleanName.replace(new RegExp(`\\s+${escapedAbbr}$`, 'i'), '').trim();
      return `${t} ${cleanName} ${abbr}`.trim();
    }
    return `${t} ${cleanName}`.trim();
  };

  // Client-side lightweight image compressor to Base64 (max 320x320 px, ~25KB)
  const compressImage = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // New Mass Request Form Fields
  const [bookingLocation, setBookingLocation] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingEndDate, setBookingEndDate] = useState('');
  const [bookingTimeStart, setBookingTimeStart] = useState('06:30');
  const [bookingTimeEnd, setBookingTimeEnd] = useState('07:30');
  const [bookingLanguage, setBookingLanguage] = useState('Tamil');
  const [bookingHonorarium, setBookingHonorarium] = useState('');
  const [bookingServiceType, setBookingServiceType] = useState('Holy Mass (Parish / Convent)');
  const [bookingServiceCategory, setBookingServiceCategory] = useState('core'); // 'core' vs 'special'
  const [bookingCustomServiceType, setBookingCustomServiceType] = useState('');
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
  const [confirmServiceType, setConfirmServiceType] = useState('Holy Mass (Parish / Convent)');
  const [confirmServiceCategory, setConfirmServiceCategory] = useState('core');
  const [confirmCustomServiceType, setConfirmCustomServiceType] = useState('');

  const CORE_SERVICES = [
    'Holy Mass (Parish / Convent)',
    'Substation Mass',
    'Concelebration (Feasts & Events)',
    'Marriage Mass',
    'Funeral / Requiem Mass',
    'Confession Ministry',
    'Monthly Recollection Talk',
    'Annual Retreat Preacher'
  ];

  const SPECIAL_SERVICES = [
    'House Blessing',
    'Easter Blessing',
    'Christmas Carols',
    'Communion to Sick',
    'Others'
  ];

  const SERVICE_TYPES = [...CORE_SERVICES, ...SPECIAL_SERVICES];

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

  const BROTHERS_CONGREGATIONS = [
    'Order of Friars Minor Capuchin (OFM Cap)',
    'Montfort Brothers of St. Gabriel (SG)',
    'Christian Brothers (CFC)',
    'Franciscan Brothers of the Blessed Sacrament (OSF)',
    'Salesians of Don Bosco (SDB)',
    'Society of Jesus / Jesuit Brother (SJ)',
    'Society of the Divine Word (SVD)',
    'Other Religious Brothers Congregation'
  ];

  const SISTERS_CONGREGATIONS = [
    'Congregation of the Immaculate Conception (CIC)',
    'Franciscan Missionaries of Mary (FMM)',
    'Sisters of St. Joseph of the Apparition (SJA)',
    'Sisters of St. Joseph of Cluny (SJC)',
    'Sisters of St. Anne of Tiruchirappalli (SAT)',
    'Sisters of St. Anne of Bangalore (SAB)',
    'Sisters of St. Joseph of Tarbes (SJT)',
    'Sisters of the Cross of Chavanod (SCC)',
    'Salesian Missionaries of Mary Immaculate (SMMI)',
    'Missionaries of Charity (MC)',
    'Franciscan Sisters of St. Aloysius Gonzaga (FSAG)',
    'Servites of Mary (OSM)',
    'Other Sisters Congregation'
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
        // Default landing tab based on ecclesiastical role:
        // - Diocesan priest: 'my_requests' (My Posts)
        // - Religious priest: 'open' (Ministry Requests)
        // - Sisters & Brothers: 'open' (Ministry Needs)
        if (parsed.title === 'Fr.' && parsed.clergy_type === 'diocesan') {
          setRequestsTab('my_requests');
        } else {
          setRequestsTab('open');
        }
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
  const handleDetectGPS = (target = 'reg') => {
    if (!navigator.geolocation) {
      showFeedback('error', 'GPS Location is not supported on this device/browser.');
      return;
    }
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        if (target === 'edit') {
          setEditLatitude(lat);
          setEditLongitude(lon);
        } else {
          setRegLatitude(lat);
          setRegLongitude(lon);
        }

        // Reverse-geocode coordinates into readable address
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' }
          });
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const addr = geoData.address || {};
            // Construct clean locality: suburb/neighbourhood, city/town, pincode
            const localityParts = [
              addr.suburb || addr.neighbourhood || addr.residential || addr.road || '',
              addr.city || addr.town || addr.village || addr.city_district || addr.county || '',
              addr.state ? addr.state : '',
              addr.postcode ? `- ${addr.postcode}` : ''
            ].filter(Boolean);

            const readableAddress = localityParts.length > 0 ? localityParts.join(', ').replace(', -', ' -') : (geoData.display_name || '');
            if (readableAddress) {
              if (target === 'edit') {
                setEditResidenceAddress(readableAddress);
              } else {
                setRegResidenceAddress(readableAddress);
              }
            }

            // Auto-populate 6-digit postal PIN code
            if (addr.postcode) {
              const cleanPin = String(addr.postcode).replace(/\D/g, '').slice(0, 6);
              if (cleanPin.length === 6) {
                if (target === 'edit') {
                  setEditPincode(cleanPin);
                } else {
                  setRegPincode(cleanPin);
                }
              }
            }
          }
        } catch (geoErr) {
          console.warn('Reverse geocode lookup skipped:', geoErr);
        }

        setGpsDetecting(false);
        showFeedback('success', '📍 GPS Location and Locality captured!');
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
        if (data.user.title === 'Fr.' && data.user.clergy_type === 'diocesan') {
          setRequestsTab('my_requests');
        } else {
          setRequestsTab('open');
        }
        showFeedback('success', `Welcome back, ${data.user.title || ''} ${data.user.name}!`);
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
    if (!regTitle) {
      showFeedback('error', 'Please choose your clerical status (Fr., Br., or Sr.).');
      return;
    }
    if (!regName.trim()) {
      showFeedback('error', 'Name is required.');
      return;
    }
    if (regTitle === 'Fr.') {
      if (regClergyType === 'diocesan' && !regDiocese.trim()) {
        showFeedback('error', 'Please enter your Diocese / Archdiocese.');
        return;
      }
      if (regClergyType === 'religious' && !regOrder.trim()) {
        showFeedback('error', 'Please enter your Religious Congregation Name.');
        return;
      }
    } else {
      // Br. or Sr.
      if (!regOrder.trim()) {
        showFeedback('error', 'Please enter your Congregation Name.');
        return;
      }
    }
    if (!regMobile || regMobile.replace(/\D/g, '').length < 10) {
      showFeedback('error', 'Valid 10-digit WhatsApp Mobile number is required.');
      return;
    }
    const cleanPin = regPincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      showFeedback('error', 'A valid 6-digit Postal PIN Code is required for parish/convent proximity.');
      return;
    }
    if (!regPassword) {
      showFeedback('error', 'Password is required.');
      return;
    }
    setFormSubmitting(true);
    try {
      // Ensure pin code is incorporated into canonical address
      const fullAddressWithPin = regResidenceAddress.includes(cleanPin)
        ? regResidenceAddress
        : (regResidenceAddress ? `${regResidenceAddress} - ${cleanPin}` : `PIN: ${cleanPin}`);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: regTitle,
          name: regName.trim(),
          congregation_abbr: (regTitle === 'Fr.' && regClergyType === 'diocesan') ? '' : regCongregationAbbr.trim(),
          mobile: getCanonicalMobile(regMobile),
          email: regEmail,
          password: regPassword,
          clergy_type: regTitle === 'Fr.' ? regClergyType : (regTitle === 'Br.' ? 'religious' : 'convent'),
          religious_order: (regTitle === 'Fr.' && regClergyType === 'diocesan') ? null : regOrder,
          diocese_province: (regTitle === 'Fr.' && regClergyType === 'diocesan') ? regDiocese : '',
          residence_name: regResidenceName,
          residence_address: fullAddressWithPin,
          pincode: cleanPin,
          latitude: regLatitude,
          longitude: regLongitude,
          max_travel_km: regTitle === 'Fr.' ? regMaxTravelKm : 25,
          transport_mode: regTransportMode,
          profile_photo: regProfilePhoto
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

  // Open Profile Edit Modal populated with current user values
  const openProfileModal = () => {
    if (!user) return;
    const initialTitle = user.title || (user.name?.startsWith('Br.') ? 'Br.' : (user.clergy_type === 'convent' || user.clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.'));
    setEditTitle(initialTitle);
    // Clean raw name in input box so user edits clean given name
    const rawClean = (user.name || '').replace(/^(Rev\.\s*|Fr\.\s*|Br\.\s*|Sr\.\s*)+/i, '');
    const abbr = user.congregation_abbr || '';
    const cleanNoAbbr = abbr ? rawClean.replace(new RegExp(`\\s+${abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), '').trim() : rawClean.trim();
    setEditName(cleanNoAbbr);
    setEditCongregationAbbr(abbr);
    setEditMobile(user.mobile || '');
    setEditEmail(user.email || '');
    setEditClergyType(user.clergy_type || 'diocesan');
    setEditOrder(user.religious_order || '');
    setEditDiocese(user.diocese_province || '');
    setEditResidenceName(user.residence_name || '');
    setEditResidenceAddress(user.residence_address || '');
    const foundPin = (user.residence_address || '').match(/\b\d{6}\b/);
    setEditPincode(user.pincode || (foundPin ? foundPin[0] : ''));
    setEditLatitude(user.latitude || null);
    setEditLongitude(user.longitude || null);
    setEditMaxTravelKm(user.max_travel_km || 25);
    setEditTransportMode(user.transport_mode || 'own_bike');
    setEditProfilePhoto(user.profile_photo || null);
    setShowProfileModal(true);
  };

  // Save Modified Profile to Backend and Turso
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName || !editMobile) {
      showFeedback('error', 'Name and mobile number are required.');
      return;
    }
    const cleanEditPin = editPincode.replace(/\D/g, '');
    if (cleanEditPin && cleanEditPin.length !== 6) {
      showFeedback('error', 'Postal PIN code must be exactly 6 digits.');
      return;
    }
    setFormSubmitting(true);
    try {
      const fullAddressWithPin = cleanEditPin && !editResidenceAddress.includes(cleanEditPin)
        ? (editResidenceAddress ? `${editResidenceAddress} - ${cleanEditPin}` : `PIN: ${cleanEditPin}`)
        : editResidenceAddress;

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          title: editTitle,
          name: editName.trim(),
          congregation_abbr: (editTitle === 'Fr.' && editClergyType === 'diocesan') ? '' : editCongregationAbbr.trim(),
          mobile: getCanonicalMobile(editMobile),
          email: editEmail,
          clergy_type: editTitle === 'Fr.' ? editClergyType : (editTitle === 'Br.' ? 'religious' : 'convent'),
          religious_order: (editTitle === 'Fr.' && editClergyType === 'diocesan') ? null : editOrder,
          diocese_province: (editTitle === 'Fr.' && editClergyType === 'diocesan') ? editDiocese : '',
          residence_name: editResidenceName,
          residence_address: fullAddressWithPin,
          pincode: cleanEditPin || null,
          latitude: editLatitude,
          longitude: editLongitude,
          max_travel_km: editTitle === 'Fr.' ? editMaxTravelKm : 25,
          transport_mode: editTransportMode,
          profile_photo: editProfilePhoto
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('bookapriest_user', JSON.stringify(data.user));
        setShowProfileModal(false);
        showFeedback('success', 'Profile and photograph successfully updated!');
        loadDashboardData(data.user);
      } else {
        showFeedback('error', data.error || 'Failed to update profile.');
      }
    } catch (err) {
      showFeedback('error', 'Network error updating profile.');
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
    const resolvedConfirmService = confirmServiceType === 'Others'
      ? (confirmCustomServiceType.trim() || 'Other Ministry')
      : confirmServiceType;

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
          service_type: resolvedConfirmService,
          notes: 'Verbal booking confirmed via phone call'
        })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', `${resolvedConfirmService} with Fr. ${showDirectConfirmModal.priest_name} confirmed & locked!`);
        setShowDirectConfirmModal(null);
        setConfirmCustomServiceType('');
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

    const resolvedBookingService = bookingServiceType === 'Others'
      ? (bookingCustomServiceType.trim() || 'Other Ministry')
      : bookingServiceType;

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
          service_type: resolvedBookingService,
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
        showFeedback('success', 'Your willingness to celebrate has been shared with the parish/convent!');
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to respond to ministry need.');
      }
    } catch (err) {
      showFeedback('error', 'Failed to communicate with server.');
    }
  };

  // Priest withdraws tentative offer before confirmation
  const handleWithdrawOffer = async (bookingId) => {
    try {
      const res = await fetch('/api/bookings/withdraw-offer', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookingId })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Your offer to celebrate has been safely withdrawn.');
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to withdraw offer.');
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
        showFeedback('success', `Fr. ${priestName} has been selected! Contact details and WhatsApp are now available.`);
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

  // Admin Direct Onboard Sister / Priest Handler
  const handleAdminOnboardUser = async (e) => {
    e.preventDefault();
    if (!onboardName.trim()) {
      showFeedback('error', 'Name is required.');
      return;
    }
    const cleanMob = onboardMobile.replace(/\D/g, '');
    if (cleanMob.length < 10) {
      showFeedback('error', 'Valid 10-digit WhatsApp Mobile number is required.');
      return;
    }
    setFormSubmitting(true);
    try {
      const cleanPin = onboardPincode.replace(/\D/g, '');
      const fullAddress = cleanPin && !onboardAddress.includes(cleanPin)
        ? (onboardAddress ? `${onboardAddress} - ${cleanPin}` : `PIN: ${cleanPin}`)
        : onboardAddress;

      const res = await fetch('/api/admin/onboard-user', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: onboardTitle,
          name: onboardName.trim(),
          congregation_abbr: (onboardTitle === 'Fr.' && onboardClergyType === 'diocesan') ? '' : onboardCongregationAbbr.trim(),
          mobile: `+91${cleanMob.slice(-10)}`,
          email: '',
          password: onboardPassword || 'Jesus@123',
          clergy_type: onboardTitle === 'Sr.' ? 'convent' : (onboardTitle === 'Br.' ? 'religious' : onboardClergyType),
          religious_order: (onboardTitle === 'Fr.' && onboardClergyType === 'diocesan') ? null : onboardOrder,
          diocese_province: (onboardTitle === 'Fr.' && onboardClergyType === 'diocesan') ? onboardDiocese : '',
          residence_name: onboardResidenceName,
          residence_address: fullAddress,
          pincode: cleanPin
        })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
        const waMsg = `Praise be Jesus, ${data.user.title} ${data.user.name}! Your BookaPriest account is created and verified.\n\n🌐 Portal: https://bookapriest.in\n📱 Login Mobile: ${data.user.mobile}\n🔑 Password: ${data.initialPassword}\n\nYou can now log in to view and receive Mass requests.`;
        const waLink = `https://wa.me/${data.user.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMsg)}`;
        setAdminOnboardSuccess({
          user: data.user,
          initialPassword: data.initialPassword,
          waLink
        });
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to onboard user.');
      }
    } catch (err) {
      showFeedback('error', 'Network error during onboarding.');
    } finally {
      setFormSubmitting(false);
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

  // Helper to determine celebration urgency (Today / Tomorrow / In N days)
  const getCelebrationUrgency = (isoString) => {
    if (!isoString) return null;
    const celebrationDate = new Date(isoString);
    if (isNaN(celebrationDate.getTime())) return null;

    const now = new Date();
    // Midnight normalized dates
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfCelebration = new Date(celebrationDate.getFullYear(), celebrationDate.getMonth(), celebrationDate.getDate());

    const diffDays = Math.round((startOfCelebration - startOfToday) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Check if happening right now or later today
      const diffHours = (celebrationDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours < -2) {
        return { type: 'today_completed', label: 'Today (Concluded)', badgeClass: 'urgency-completed', isPulsing: false };
      } else if (diffHours <= 1.5 && diffHours >= -1) {
        return { type: 'today_imminent', label: 'Happening Now / Soon', badgeClass: 'urgency-imminent', isPulsing: true };
      }
      return { type: 'today', label: 'Today', badgeClass: 'urgency-today', isPulsing: true };
    } else if (diffDays === 1) {
      return { type: 'tomorrow', label: 'Tomorrow', badgeClass: 'urgency-tomorrow', isPulsing: false };
    } else if (diffDays >= 2 && diffDays <= 3) {
      return { type: 'upcoming', label: `In ${diffDays} days`, badgeClass: 'urgency-upcoming', isPulsing: false };
    }
    return null;
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

  // --- Dedicated Privacy & Forum Accountability Page ---
  if (showPrivacyPage) {
    return (
      <div className="auth-page" style={{ padding: '2rem 1rem', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div className="glass-card" style={{ maxWidth: '680px', width: '100%', padding: '2rem 1.8rem', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)' }}>
          {/* Header & Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setShowPrivacyPage(false)}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            >
              ← Back to Registration
            </button>
            <span style={{ fontSize: '0.74rem', background: '#FEF08A', color: '#854D0E', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
              Official Policy
            </span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#FEFCE8', border: '2px solid var(--accent-gold)', marginBottom: '0.75rem', color: 'var(--accent-gold)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: 700, margin: '0 0 0.4rem 0', fontFamily: 'Outfit' }}>
              Privacy & Canonical Authenticity Declaration
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
              BookaPriest Liturgical Coordination Platform
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', fontSize: '0.88rem', color: '#334155', lineHeight: '1.65' }}>
            {/* Section 1: Administrator & Accountability */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem 1.2rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#0F172A', margin: '0 0 0.5rem 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>👤</span> Platform Administration & Ownership
              </h3>
              <p style={{ margin: '0 0 0.6rem 0' }}>
                This portal is created, scrutinized, and maintained under Catholic religious administration to foster transparent and dignified sacramental coordination across India.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', marginTop: '0.5rem', background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Maintained By</span>
                  <strong style={{ color: '#0F172A' }}>[Your Name / Ecclesiastical Forum]</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Official Website</span>
                  <a href="https://bookapriest.in" target="_blank" rel="noreferrer" style={{ color: '#0284C7', fontWeight: 600, textDecoration: 'none' }}>
                    www.bookapriest.in ↗
                  </a>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Contact & Oversight</span>
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>support@bookapriest.in</span>
                </div>
              </div>
            </div>

            {/* Section 2: Strict Privacy Guarantee */}
            <div>
              <h3 style={{ fontSize: '0.95rem', color: '#0F172A', margin: '0 0 0.4rem 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🔒</span> 100% Confidentiality & Data Protection
              </h3>
              <p style={{ margin: 0 }}>
                Your personal telephone number, clerical identity, and convent/residence address are never sold, commercialized, or made publicly crawlable on the open web. Contact details are strictly restricted to verified parishioners and fellow religious only upon confirmation of a liturgical engagement.
              </p>
            </div>

            {/* Section 3: Canonical Vetting */}
            <div>
              <h3 style={{ fontSize: '0.95rem', color: '#0F172A', margin: '0 0 0.4rem 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⛪</span> Canonical Vetting & Authenticity
              </h3>
              <p style={{ margin: 0 }}>
                Every profile registered as a Priest (Fr.), Sister (Sr.), or Brother (Br.) is cross-checked against diocesan directories or religious congregational registries to preserve sacred liturgical trust and protect communities from unauthorized ministry.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setShowPrivacyPage(false)}
              className="btn btn-primary"
              style={{ padding: '0.7rem 2rem', fontWeight: 600 }}
            >
              Back to Registration
            </button>
          </div>
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
                <label className="form-label">WhatsApp Mobile or Email</label>
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
                <label className="form-label">Password</label>
                <div className="input-action-group">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    tabIndex="-1"
                    title={showLoginPassword ? "Hide password" : "Show password"}
                    style={{ padding: '0.4rem', color: '#64748B' }}
                  >
                    {showLoginPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
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
                New User?{' '}
                <span className="auth-link" onClick={() => setAuthMode('register')}>
                  Create an Account Here
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} autoComplete="off">
              {/* Ecclesiastical Trust & Canonical Security Notice */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #FEFCE8 100%)',
                  border: '1px solid #FEF08A',
                  borderLeft: '4px solid var(--accent-gold)',
                  borderRadius: '8px',
                  padding: '0.75rem 0.9rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}
              >
                <div style={{ color: 'var(--accent-gold)', marginTop: '2px', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>
                        Privacy & Authenticity Guarantee
                      </span>
                      <span style={{ fontSize: '0.65rem', background: '#FEF08A', color: '#854D0E', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Verified Catholic Forum
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPrivacyPage(true)}
                      title="Read privacy policy & website credentials"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0284C7',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: '#E0F2FE',
                          color: '#0369A1',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}
                      >
                        i
                      </span>
                      <span>Details & Policy →</span>
                    </button>
                  </div>
                  Managed exclusively by and for Catholic clergy & religious. Your personal details are <strong>100% confidential</strong> and never shared publicly.
                </div>
              </div>

              {/* Direct 1-Click Clerical Status Selector */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Select Your Clerical Status *</span>
                  {regTitle && (
                    <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                      ✓ Selected: {regTitle === 'Fr.' ? 'Priest' : regTitle === 'Sr.' ? 'Sister' : 'Brother'}
                    </span>
                  )}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {/* 1. PRIEST (Fr.) */}
                  <button
                    type="button"
                    onClick={() => {
                      setRegTitle('Fr.');
                      if (regClergyType === 'convent') setRegClergyType('religious');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '0.75rem 0.4rem',
                      borderRadius: '10px',
                      border: regTitle === 'Fr.' ? '2px solid var(--accent-gold)' : '1.5px solid #E2E8F0',
                      background: regTitle === 'Fr.' ? '#FEFCE8' : '#FFFFFF',
                      color: regTitle === 'Fr.' ? '#854D0E' : '#334155',
                      boxShadow: regTitle === 'Fr.' ? '0 4px 12px rgba(202, 138, 4, 0.15)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 18 C18 24 30 24 30 18" />
                      <path d="M18 16.5 C16 16.5 16 19 18 19.5" />
                      <path d="M30 16.5 C32 16.5 32 19 30 19.5" />
                      <path d="M18 16 C16.5 13 18 8 24 8 C30 8 31.5 13 30 16" />
                      <path d="M18 12.5 C20 13.5 22 13 24 12 C26 13 28 13.5 30 12.5" />
                      <path d="M20 23.5 L19.5 26.5 C19.5 28 28.5 28 28.5 26.5 L28 23.5" />
                      <rect x="22.2" y="24" width="3.6" height="3" rx="0.5" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M19.5 26.5 C15 27 10 30 10 37" />
                      <path d="M28.5 26.5 C33 27 38 30 38 37" />
                      <line x1="24" y1="27.5" x2="24" y2="37" />
                    </svg>
                    <span style={{ fontSize: '0.8rem', fontWeight: regTitle === 'Fr.' ? 700 : 600 }}>
                      Fr. (Priest)
                    </span>
                  </button>

                  {/* 2. SISTER (Sr.) */}
                  <button
                    type="button"
                    onClick={() => {
                      setRegTitle('Sr.');
                      setRegClergyType('convent');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '0.75rem 0.4rem',
                      borderRadius: '10px',
                      border: regTitle === 'Sr.' ? '2px solid var(--accent-gold)' : '1.5px solid #E2E8F0',
                      background: regTitle === 'Sr.' ? '#FEFCE8' : '#FFFFFF',
                      color: regTitle === 'Sr.' ? '#854D0E' : '#334155',
                      boxShadow: regTitle === 'Sr.' ? '0 4px 12px rgba(202, 138, 4, 0.15)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="24" cy="22.5" rx="4.8" ry="6" />
                      <path d="M19.2 18 C21 16.8 27 16.8 28.8 18" />
                      <path d="M17.5 19 C18 14 20.5 13 24 13 C27.5 13 30 14 30.5 19" />
                      <path d="M24 7.5 C16.5 7.5 14 13 14 23 C14 30 10 37 10 40 L16 38 C16.5 35 17.5 31 18.5 29" />
                      <path d="M24 7.5 C31.5 7.5 34 13 34 23 C34 30 38 37 38 40 L32 38 C31.5 35 30.5 31 29.5 29" />
                      <path d="M19 28 C21 31.5 27 31.5 29 28" />
                      <path d="M18.5 34 C21.5 36.5 26.5 36.5 29.5 34" />
                    </svg>
                    <span style={{ fontSize: '0.8rem', fontWeight: regTitle === 'Sr.' ? 700 : 600 }}>
                      Sr. (Sister)
                    </span>
                  </button>

                  {/* 3. BROTHER (Br.) */}
                  <button
                    type="button"
                    onClick={() => {
                      setRegTitle('Br.');
                      setRegClergyType('religious');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '0.75rem 0.4rem',
                      borderRadius: '10px',
                      border: regTitle === 'Br.' ? '2px solid var(--accent-gold)' : '1.5px solid #E2E8F0',
                      background: regTitle === 'Br.' ? '#FEFCE8' : '#FFFFFF',
                      color: regTitle === 'Br.' ? '#854D0E' : '#334155',
                      boxShadow: regTitle === 'Br.' ? '0 4px 12px rgba(202, 138, 4, 0.15)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="24" cy="22" rx="4.8" ry="5.8" />
                      <path d="M20 18.5 C21.5 17.5 26.5 17.5 28 18.5" />
                      <path d="M24 8 C16 8 15 15 15 23 C15 26 16.5 28 19 29.5" />
                      <path d="M24 8 C32 8 33 15 33 23 C33 26 31.5 28 29 29.5" />
                      <path d="M19 29.5 C21 31 27 31 29 29.5" />
                      <path d="M18 31 C15 32 10 34 10 39" />
                      <path d="M30 31 C33 32 38 34 38 39" />
                      <path d="M14 36 C18 38 30 38 34 36" />
                    </svg>
                    <span style={{ fontSize: '0.8rem', fontWeight: regTitle === 'Br.' ? 700 : 600 }}>
                      Br. (Brother)
                    </span>
                  </button>
                </div>
              </div>

              {/* Name Input with Live Automatic Name Preview & Clickable Prefix */}
              <div className="form-group">
                <label className="form-label">
                  <span>Name *</span>
                </label>
                <div className="input-prefix-group" style={{ cursor: 'text' }}>
                  <span
                    className="input-prefix-badge"
                    onClick={() => setShowTitlePickerModal(true)}
                    title="Tap to change title (Fr. / Sr. / Br.)"
                    style={{ cursor: 'pointer', paddingRight: '0.45rem', userSelect: 'none', color: regTitle ? '#0F172A' : '#94A3B8', fontWeight: 700 }}
                  >
                    {regTitle || 'Select Title'} <span style={{ fontSize: '0.72rem', color: '#64748B', marginLeft: '1px' }}>▾</span>
                  </span>
                  <input
                    type="text"
                    className="form-input-inline"
                    placeholder={regTitle ? "Enter your name..." : "Choose title above or type your name..."}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
                {regTitle && regName.trim() && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#166534', background: '#F0FDF4', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>✨</span>
                    <span>
                      Display Name Preview: <strong>{formatEcclesiasticalName(regTitle, regName, (regTitle === 'Fr.' && regClergyType === 'diocesan') ? '' : regCongregationAbbr)}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* BRANCH 1: PRIEST (Fr.) - Diocesan or Religious */}
              {regTitle === 'Fr.' && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Priest Affiliation *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {/* Diocesan Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setRegClergyType('diocesan');
                        setRegCongregationAbbr('');
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '10px',
                        border: regClergyType === 'diocesan' ? '2px solid var(--accent-gold)' : '1.5px solid #E2E8F0',
                        background: regClergyType === 'diocesan' ? '#FEFCE8' : '#FFFFFF',
                        color: regClergyType === 'diocesan' ? '#854D0E' : '#334155',
                        boxShadow: regClergyType === 'diocesan' ? '0 4px 12px rgba(202, 138, 4, 0.12)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', marginBottom: '3px' }}>
                        <span style={{ fontSize: '1.05rem' }}>🏛️</span>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: regClergyType === 'diocesan' ? '#854D0E' : '#0F172A' }}>
                          Diocesan Priest
                        </span>
                        {regClergyType === 'diocesan' && (
                          <span style={{ marginLeft: 'auto', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 800 }}>✓</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: '1.3' }}>
                        Affiliated to a Diocese / Archdiocese
                      </span>
                    </button>

                    {/* Religious Option */}
                    <button
                      type="button"
                      onClick={() => setRegClergyType('religious')}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '10px',
                        border: regClergyType === 'religious' ? '2px solid var(--accent-gold)' : '1.5px solid #E2E8F0',
                        background: regClergyType === 'religious' ? '#FEFCE8' : '#FFFFFF',
                        color: regClergyType === 'religious' ? '#854D0E' : '#334155',
                        boxShadow: regClergyType === 'religious' ? '0 4px 12px rgba(202, 138, 4, 0.12)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', marginBottom: '3px' }}>
                        <span style={{ fontSize: '1.05rem' }}>⛪</span>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: regClergyType === 'religious' ? '#854D0E' : '#0F172A' }}>
                          Religious Priest
                        </span>
                        {regClergyType === 'religious' && (
                          <span style={{ marginLeft: 'auto', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 800 }}>✓</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: '1.3' }}>
                        Congregation / Order (e.g. SJ, SDB, OFM)
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* BRANCH 1A: Fr. Diocesan -> Diocese */}
              {regTitle === 'Fr.' && regClergyType === 'diocesan' && (
                <div className="form-group">
                  <label className="form-label">Diocese / Archdiocese</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Archdiocese of Bangalore, Archdiocese of Madras-Mylapore"
                    value={regDiocese}
                    onChange={(e) => setRegDiocese(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* BRANCH 1B: Fr. Religious -> Congregation + Suffix Abbreviation */}
              {regTitle === 'Fr.' && regClergyType === 'religious' && (
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Congregation Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Order of Friars Minor Capuchin"
                      value={regOrder}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegOrder(val);
                        const autoAbbr = extractAbbr(val);
                        if (autoAbbr) setRegCongregationAbbr(autoAbbr);
                      }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Abbreviation (Suffix)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. OFM Cap, SJ, SDB"
                      value={regCongregationAbbr}
                      onChange={(e) => setRegCongregationAbbr(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '0.25rem', lineHeight: '1.3' }}>
                      e.g. OFM Cap, SJ, SDB (appears after your name)
                    </span>
                  </div>
                </div>
              )}

              {/* BRANCH 2: BROTHER (Br.) -> Religious Congregation + Abbreviation */}
              {regTitle === 'Br.' && (
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Congregation Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Order of Friars Minor Capuchin, Montfort Brothers"
                      value={regOrder}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegOrder(val);
                        const autoAbbr = extractAbbr(val);
                        if (autoAbbr) setRegCongregationAbbr(autoAbbr);
                      }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Abbreviation (Suffix)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. OFM Cap, SG, CFC"
                      value={regCongregationAbbr}
                      onChange={(e) => setRegCongregationAbbr(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '0.25rem', lineHeight: '1.3' }}>
                      e.g. OFM Cap, SG, CFC (appears after your name)
                    </span>
                  </div>
                </div>
              )}

              {/* BRANCH 3: SISTER (Sr.) -> Congregation + Abbreviation */}
              {regTitle === 'Sr.' && (
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Congregation / Order Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Congregation of the Immaculate Conception, Franciscan Sisters"
                      value={regOrder}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegOrder(val);
                        const autoAbbr = extractAbbr(val);
                        if (autoAbbr) setRegCongregationAbbr(autoAbbr);
                      }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Letters after Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. CIC, FMM, SJC"
                      value={regCongregationAbbr}
                      onChange={(e) => setRegCongregationAbbr(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginTop: '0.25rem', lineHeight: '1.3' }}>
                      e.g. Sr. Maria, <strong>CIC</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Contact Information Group */}
              <div className="form-row">
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>WhatsApp Mobile *</span>
                    <button
                      type="button"
                      onClick={() => setShowPhoneInfoTip(!showPhoneInfoTip)}
                      title="Why WhatsApp Mobile?"
                      style={{
                        background: '#E2E8F0',
                        color: '#475569',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        lineHeight: 1
                      }}
                    >
                      i
                    </button>
                  </label>
                  {showPhoneInfoTip && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '1.9rem',
                        left: '0',
                        zIndex: 50,
                        background: '#0F172A',
                        color: '#FFFFFF',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        lineHeight: '1.4',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.25)',
                        maxWidth: '260px'
                      }}
                    >
                      <span>Used for verification of authenticity and primary contact of the booked priest.</span>
                      <div
                        onClick={() => setShowPhoneInfoTip(false)}
                        style={{ color: 'var(--accent-gold)', marginTop: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.7rem', textAlign: 'right' }}
                      >
                        Got it ✕
                      </div>
                    </div>
                  )}
                  <div className="input-prefix-group">
                    <span className="input-prefix-badge" style={{ color: '#475569', fontWeight: 700 }}>+91</span>
                    <input
                      type="tel"
                      className="form-input-inline"
                      placeholder="98765 43210"
                      value={formatMobileDisplay(regMobile)}
                      onChange={(e) => setRegMobile(e.target.value)}
                      maxLength={11}
                      required
                    />
                  </div>
                  <div style={{ marginTop: '0.35rem', fontSize: '0.76rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: '1.35' }}>
                    <span style={{ fontSize: '0.85rem' }}>💡</span>
                    <span><strong>No OTP required!</strong> Used for your Mass booking alerts on WhatsApp.</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email (optional)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder={regTitle === 'Sr.' ? 'sister@gmail.com' : regTitle === 'Br.' ? 'brother@gmail.com' : 'father@gmail.com'}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Grouped Convent / Residence Location Section */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.05rem' }}>
                    {regTitle === 'Sr.' ? '🕊️' : (regTitle === 'Fr.' && regClergyType === 'diocesan' ? '🏛️' : '⛪')}
                  </span>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                    {regTitle === 'Sr.'
                      ? 'Convent Location & Community Details'
                      : (regTitle === 'Fr.' && regClergyType === 'diocesan'
                          ? 'Church / Parish Location'
                          : 'Residence / Community Location')}
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">
                    {regTitle === 'Sr.'
                      ? 'Convent Name (optional)'
                      : (regTitle === 'Fr.' && regClergyType === 'diocesan'
                          ? 'Parish / Church Name (optional)'
                          : 'Residence / Community Name (optional)')}
                  </label>
                  <input
                    type="text"
                    id="reg_community_residence_name"
                    name="community_residence_name_field"
                    className="form-input"
                    autoComplete="none"
                    placeholder={
                      regTitle === 'Sr.'
                        ? 'e.g. Child Jesus Convent, St. Joseph’s Convent'
                        : (regTitle === 'Fr.' && regClergyType === 'diocesan'
                            ? 'e.g. Holy Family Church, St. Mary’s Basilica'
                            : 'e.g. Gnanalaya Capuchin Ashram, Don Bosco Bhavan')
                    }
                    value={regResidenceName}
                    onChange={(e) => setRegResidenceName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">
                    <span>
                      {regTitle === 'Sr.'
                        ? 'Convent Street Address / Area'
                        : (regTitle === 'Fr.' && regClergyType === 'diocesan'
                            ? 'Church Street Address / Area'
                            : 'Community Street Address / Locality')}
                    </span>
                  </label>
                  <div className="input-action-group">
                    <input
                      type="text"
                      id="reg_residence_address"
                      name="locality_residence_address"
                      className="form-input"
                      placeholder="e.g. TC Palya Main Road, K.R. Puram"
                      value={regResidenceAddress}
                      onChange={(e) => setRegResidenceAddress(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleDetectGPS('reg')}
                      disabled={gpsDetecting}
                      title={regLatitude ? "GPS coordinates captured. Tap to update." : "Click to automatically detect current GPS location"}
                      style={{
                        background: regLatitude ? '#F0FDF4' : '#FFFFFF',
                        border: `1.5px solid ${regLatitude ? '#86EFAC' : '#CBD5E1'}`,
                        color: regLatitude ? '#15803D' : '#475569',
                        borderRadius: '8px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {gpsDetecting ? (
                        <>
                          <span style={{ fontSize: '0.85rem', animation: 'spin 1s linear infinite' }}>⏳</span>
                          <span>Locating...</span>
                        </>
                      ) : regLatitude ? (
                        <>
                          <span style={{ fontSize: '0.82rem', color: '#16A34A' }}>✓</span>
                          <span>GPS Pin Saved</span>
                        </>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>Pin Location</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mandatory Postal PIN Code */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Postal PIN Code *</span>
                    {regPincode.replace(/\D/g, '').length === 6 ? (
                      <span style={{ color: '#16A34A', fontSize: '0.74rem', fontWeight: 600 }}>
                        ✓ Valid 6-Digit PIN Code
                      </span>
                    ) : (
                      <span style={{ color: '#64748B', fontSize: '0.72rem' }}>
                        Required for Mass proximity matching
                      </span>
                    )}
                  </label>
                  <div className="input-prefix-group">
                    <span className="input-prefix-badge" style={{ color: '#475569', fontWeight: 700, fontSize: '0.8rem' }}>
                      PIN
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      className="form-input-inline"
                      placeholder="e.g. 560036, 600004, 682001"
                      value={regPincode}
                      onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Optional Profile Photo Card */}
              <div className="form-group" style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '10px', padding: '0.85rem 1rem', marginTop: '0.2rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: regProfilePhoto ? 'transparent' : '#E2E8F0',
                        border: '2px solid #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      {regProfilePhoto ? (
                        <img src={regProfilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.25rem' }}>📸</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                        Clerical Photo <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 400 }}>(optional)</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                        {regProfilePhoto ? '✓ Photo attached' : 'You can also add or change this anytime later'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="reg-photo-upload"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.4rem 0.75rem',
                        background: regProfilePhoto ? '#FEFCE8' : '#FFFFFF',
                        border: `1px solid ${regProfilePhoto ? '#CA8A04' : '#CBD5E1'}`,
                        color: regProfilePhoto ? '#854D0E' : '#334155',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {regProfilePhoto ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    <input
                      id="reg-photo-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          compressImage(e.target.files[0], (base64) => setRegProfilePhoto(base64));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="input-action-group">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="reg_account_password"
                    name="user_secret_password"
                    autoComplete="new-password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    tabIndex="-1"
                    title={showRegPassword ? "Hide password" : "Show password"}
                    style={{ padding: '0.4rem', color: '#64748B' }}
                  >
                    {showRegPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Live Password Strength / Requirement Indicator */}
                <div style={{ marginTop: '0.4rem', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: regPassword.length >= 6 ? '#DCFCE7' : '#F1F5F9',
                      color: regPassword.length >= 6 ? '#16A34A' : '#94A3B8',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {regPassword.length >= 6 ? '✓' : '•'}
                  </span>
                  <span
                    style={{
                      color: regPassword.length >= 6 ? '#16A34A' : '#64748B',
                      fontWeight: regPassword.length >= 6 ? 600 : 500,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {regPassword.length >= 6
                      ? 'Password length meets canonical security requirement (6+ chars)'
                      : 'Must be at least 6 characters'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)'
                }}
                disabled={formSubmitting}
              >
                {formSubmitting ? (
                  <>
                    <span style={{ fontSize: '1rem', animation: 'spin 1s linear infinite' }}>⏳</span>
                    <span>Registering Clergy Profile...</span>
                  </>
                ) : (
                  <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Complete Clergy Registration</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.72rem', color: '#64748B' }}>
                🔒 Information is private & verified under canonical forum standards
              </div>

              {/* WhatsApp Registration Assistance Card for Non-Tech Clergy & Sisters */}
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  marginTop: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#25D366',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '1.2rem',
                      flexShrink: 0
                    }}
                  >
                    💬
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', lineHeight: 1.2 }}>
                      Need Help Registering?
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#15803D', marginTop: '2px' }}>
                      Message our support team directly on WhatsApp
                    </div>
                  </div>
                </div>
                <a
                  href="https://wa.me/919444000000?text=Praise%20be%20Jesus!%20I%20am%20registering%20on%20BookaPriest%20and%20would%20like%20assistance%20completing%20my%20details."
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#25D366',
                    color: '#FFFFFF',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  WhatsApp Us ↗
                </a>
              </div>

              <div className="auth-footer" style={{ marginTop: '1rem' }}>
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
          <button
            type="button"
            className="user-profile-btn"
            onClick={openProfileModal}
            title="Click to view & edit your profile details"
          >
            <div className="avatar-badge">
              {user.profile_photo ? (
                <img src={user.profile_photo} alt={user.name} />
              ) : (
                <span>{user.title || (user.clergy_type === 'convent' ? 'Sr.' : 'Fr.')}</span>
              )}
            </div>
            <div className="user-tag" style={{ textAlign: 'left' }}>
              <span className="user-name">
                {formatEcclesiasticalName(user)} ✏️
              </span>
              <span className="user-status" style={{ justifyContent: 'flex-start' }}>
                <span className={`status-dot ${user.is_verified === 1 ? 'verified' : 'pending'}`}></span>
                {user.is_verified === 1 ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </button>

          {/* Monthly Booking Calendar Quick Access Button */}
          <div className="header-notif-wrapper">
            <button
              type="button"
              className="header-notif-btn"
              onClick={() => {
                const todayStr = new Date().toISOString().split('T')[0];
                setCalendarSelectedDate(todayStr);
                setCalMonthOffset(0);
                setShowCalendarModal(true);
              }}
              title="Monthly Ministry & Booking Calendar"
              aria-label="View monthly booking calendar"
              style={{
                borderColor: showCalendarModal ? '#2563EB' : '#E2E8F0',
                background: showCalendarModal ? '#EFF6FF' : '#FFFFFF',
                color: showCalendarModal ? '#1D4ED8' : '#334155'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {(() => {
                // Count confirmed bookings for this priest/user in the current or upcoming schedule
                const confirmedCount = bookings.filter(b => (b.status === 'accepted' || b.status === 'completed') && (b.responder_id === user.id || b.requester_id === user.id)).length;
                return confirmedCount > 0 ? (
                  <span className="header-notif-badge" style={{ background: '#2563EB', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.35)' }}>
                    {confirmedCount}
                  </span>
                ) : null;
              })()}
            </button>
          </div>

          {/* Facebook-Style Notification Bell & Floating Dropdown Overlay */}
          <div className="header-notif-wrapper">
            <button
              type="button"
              className="header-notif-btn"
              onClick={() => setShowNotificationsModal(!showNotificationsModal)}
              title="Notifications & Ministry History Timeline"
              aria-label="View notifications and history"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {(() => {
                const count = bookings.filter(b => {
                  if (b.status === 'accepted' && (b.responder_id === user.id || b.requester_id === user.id)) return true;
                  if (b.requester_id === user.id && (b.applicants || []).length > 0) return true;
                  return false;
                }).length;
                return count > 0 ? <span className="header-notif-badge">{count}</span> : null;
              })()}
            </button>

            {/* FLOATING OVERLAY DROPDOWN */}
            {showNotificationsModal && (
              <>
                <div className="notif-dropdown-backdrop" onClick={() => setShowNotificationsModal(false)}></div>
                <div className="notif-dropdown-overlay" onClick={(e) => e.stopPropagation()}>
                  <div className="notif-dropdown-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#0F172A', fontWeight: 800 }}>Activity & Notifications</h4>
                        <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Live ministry requests, offers & confirmations</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotificationsModal(false)}
                      style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#94A3B8', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="notif-dropdown-body">
                    {(() => {
                      const events = [];

                      bookings.forEach((b) => {
                        const { date, time } = formatDateTime(b.datetime, b.datetime_end);
                        const isRequester = b.requester_id === user.id;
                        const isResponder = b.responder_id === user.id;

                        // 1. Booking Created / Posted Event
                        if (b.created_at) {
                          events.push({
                            id: `created-${b.id}`,
                            timestamp: new Date(b.created_at),
                            type: 'posted',
                            icon: (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                              </svg>
                            ),
                            iconBg: isRequester ? '#EFF6FF' : '#FEF3C7',
                            title: isRequester ? 'You posted a ministry request' : `New request from ${formatEcclesiasticalName(b.requester_title || 'Sr.', b.requester_name, b.requester_congregation_abbr)}`,
                            subtitle: `${b.service_type || 'Holy Mass'} • ${b.location || 'Parish Chapel'} (${b.language || 'English'})`,
                            targetDate: `${date} • ⏰ ${time}`,
                            badge: 'Posted',
                            badgeColor: '#475569',
                            badgeBg: '#F1F5F9'
                          });
                        }

                        // 2. Priest Availability Offers Events
                        (b.applicants || []).forEach((app) => {
                          const isMe = app.priest_id === user.id;
                          const applicantName = formatEcclesiasticalName(app.priest_title || 'Fr.', app.priest_name, app.congregation_abbr);
                          events.push({
                            id: `offer-${b.id}-${app.priest_id}`,
                            timestamp: new Date(app.offered_at || b.created_at),
                            type: 'offer',
                            icon: (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                            ),
                            iconBg: '#FEF3C7',
                            title: isMe ? 'You marked availability to celebrate' : `${applicantName} offered to celebrate`,
                            subtitle: `For ${b.service_type || 'Holy Mass'} at ${b.location || 'Parish'}`,
                            targetDate: `${date} • ⏰ ${time}`,
                            badge: 'Marked as available',
                            badgeColor: '#92400E',
                            badgeBg: '#FEF3C7'
                          });
                        });

                        // 3. Confirmation Event
                        if (b.status === 'accepted' || b.status === 'completed') {
                          const celebrantName = formatEcclesiasticalName(b.responder_title || 'Fr.', b.responder_name, b.responder_congregation_abbr);
                          const requesterName = formatEcclesiasticalName(b.requester_title || 'Sr.', b.requester_name, b.requester_congregation_abbr);
                          events.push({
                            id: `confirmed-${b.id}`,
                            timestamp: new Date(b.confirmed_at || b.created_at),
                            type: 'confirmed',
                            icon: (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ),
                            iconBg: '#DCFCE7',
                            title: isResponder
                              ? `Celebration confirmed with ${requesterName}!`
                              : isRequester
                              ? `You confirmed ${celebrantName} as Celebrant`
                              : `Celebration locked: ${celebrantName}`,
                            subtitle: `${b.service_type || 'Holy Mass'} at ${b.location || 'Parish'}`,
                            targetDate: `${date} • ⏰ ${time}`,
                            badge: 'Confirmed',
                            badgeColor: '#166534',
                            badgeBg: '#DCFCE7'
                          });
                        }
                      });

                      events.sort((a, b) => b.timestamp - a.timestamp);

                      if (events.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
                            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.4rem' }}>📭</span>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>No activity records yet.</p>
                            <span style={{ fontSize: '0.76rem' }}>When ministry requests are posted or confirmed, your history will appear here.</span>
                          </div>
                        );
                      }

                      const formatTimecode = (d) => {
                        if (!d || isNaN(d.getTime())) return '';
                        return d.toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });
                      };

                      return (
                        <div>
                          {events.map((evt) => (
                            <div className="notif-timeline-item" key={evt.id}>
                              <div className="notif-icon-circle" style={{ background: evt.iconBg }}>
                                <span>{evt.icon}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.2rem' }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', lineHeight: '1.3' }}>
                                    {evt.title}
                                  </div>
                                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px', background: evt.badgeBg, color: evt.badgeColor, whiteSpace: 'nowrap' }}>
                                    {evt.badge}
                                  </span>
                                </div>

                                <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.25rem' }}>
                                  {evt.subtitle}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.3rem' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600 }}>
                                    📅 {evt.targetDate}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }} title={evt.timestamp.toISOString()}>
                                    ⏱️ {formatTimecode(evt.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="notif-dropdown-footer">
                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                      Showing latest updates in chronological order
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleSignOut}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
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
            {/* ========================================================================= */}
            {/* PRIEST DASHBOARD (Fr.) - CELEBRANT-FIRST WORKFLOW                         */}
            {/* ========================================================================= */}
            {user.title === 'Fr.' || (!user.title && user.clergy_type !== 'convent') ? (
              <div>
                {/* 1. CLEAN 4-TAB PRIEST DASHBOARD (SINGLE SLEEK TAB BAR) */}
                {(() => {
                  const openNeeds = bookings.filter(b => {
                    if (b.status !== 'pending' || b.requester_id === user.id) return false;
                    if (priestFilterRadius === 'all') return true;
                    if (b.distance_km === null) return true;
                    return b.distance_km <= priestFilterRadius;
                  });
                  const myScheduled = bookings.filter(b => (b.status === 'accepted' || b.status === 'completed') && (b.responder_id === user.id || b.requester_id === user.id));
                  const myApplications = bookings.filter(b => b.status === 'pending' && (b.applicants || []).some(a => a.priest_id === user.id));
                  const myOwnRequests = bookings.filter(b => b.requester_id === user.id);

                  return (
                    <div>
                      {/* SINGLE STREAMLINED 4-TAB SEGMENTED CONTROL WITH MODERN APP ICONS */}
                      <div className="priest-dash-tabs">
                        <div
                          className={`priest-dash-tab ${requestsTab === 'open' ? 'active' : ''}`}
                          onClick={() => setRequestsTab('open')}
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                          </svg>
                          <span>Ministry Requests</span>
                          <span className={`priest-dash-tab-badge ${openNeeds.length > 0 ? 'badge-danger' : ''}`}>{openNeeds.length}</span>
                        </div>
                        <div
                          className={`priest-dash-tab ${requestsTab === 'review' ? 'active' : ''}`}
                          onClick={() => setRequestsTab('review')}
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>Awaiting</span>
                          <span className="priest-dash-tab-badge">{myApplications.length}</span>
                        </div>
                        <div
                          className={`priest-dash-tab ${requestsTab === 'accepted' ? 'active' : ''}`}
                          onClick={() => setRequestsTab('accepted')}
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.4 1.4" />
                            <path d="m18 10 1.3-1.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L14 6" />
                            <path d="m2 14 6 6" />
                            <path d="M7 9 2 14" />
                            <path d="M14 6 8.7 11.3a1 1 0 0 0 0 1.4l2.6 2.6" />
                          </svg>
                          <span>Confirmed</span>
                          <span className="priest-dash-tab-badge" style={{ background: '#DCFCE7', color: '#166534' }}>{myScheduled.length}</span>
                        </div>
                        <div
                          className={`priest-dash-tab ${requestsTab === 'my_requests' ? 'active' : ''}`}
                          onClick={() => setRequestsTab('my_requests')}
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                          <span>My Posts</span>
                          <span className="priest-dash-tab-badge" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{myOwnRequests.length}</span>
                        </div>
                      </div>

                      {/* TOP ACTION BAR: STREAMLINED COMPACT CONTROLS */}
                      {requestsTab === 'open' ? (
                        <div className="feed-controls-card" style={{ padding: '0.75rem 1rem' }}>
                          {/* Primary Quick Row: Distance Pills + More Filters Toggle */}
                          <div className="feed-controls-row" style={{ alignItems: 'center' }}>
                            <div className="distance-slider-container">
                              <span className="feed-control-label" style={{ fontSize: '0.74rem', letterSpacing: '0.04em', margin: 0 }}>
                                Travel Distance:
                              </span>
                              <div className="distance-slider-track">
                                <input
                                  type="range"
                                  min="5"
                                  max="105"
                                  step="5"
                                  value={priestFilterRadius === 'all' ? 105 : priestFilterRadius}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val > 100) {
                                      setPriestFilterRadius('all');
                                    } else {
                                      setPriestFilterRadius(val);
                                    }
                                  }}
                                  className="distance-range-slider"
                                  title={priestFilterRadius === 'all' ? 'All Diocese' : `Within ${priestFilterRadius} km`}
                                />
                              </div>
                              <span className="distance-slider-badge">
                                {priestFilterRadius === 'all' ? 'All Diocese' : `≤ ${priestFilterRadius} km`}
                              </span>
                            </div>

                            {/* Secondary Action: More Filters toggle & Active indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginLeft: 'auto' }}>
                              <button
                                type="button"
                                className={`feed-filter-toggle-btn ${showPriestFilterDrawer ? 'active' : ''}`}
                                onClick={() => setShowPriestFilterDrawer(!showPriestFilterDrawer)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '0.3rem 0.7rem',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  borderRadius: '6px',
                                  border: (priestFilterService !== 'all' || priestFilterLanguage !== 'all' || priestSortBy !== 'date_asc') ? '1px solid #D97706' : '1px solid #CBD5E1',
                                  background: (priestFilterService !== 'all' || priestFilterLanguage !== 'all' || priestSortBy !== 'date_asc') ? '#FEF3C7' : '#FFFFFF',
                                  color: (priestFilterService !== 'all' || priestFilterLanguage !== 'all' || priestSortBy !== 'date_asc') ? '#92400E' : '#475569',
                                  cursor: 'pointer'
                                }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="4" y1="21" x2="4" y2="14" />
                                  <line x1="4" y1="10" x2="4" y2="3" />
                                  <line x1="12" y1="21" x2="12" y2="12" />
                                  <line x1="12" y1="8" x2="12" y2="3" />
                                  <line x1="20" y1="21" x2="20" y2="16" />
                                  <line x1="20" y1="12" x2="20" y2="3" />
                                  <line x1="1" y1="14" x2="7" y2="14" />
                                  <line x1="9" y1="8" x2="15" y2="8" />
                                  <line x1="17" y1="16" x2="23" y2="16" />
                                </svg>
                                <span>Filters & Sort</span>
                                {(priestFilterService !== 'all' || priestFilterLanguage !== 'all' || priestSortBy !== 'date_asc') && (
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D97706' }}></span>
                                )}
                                <span style={{ fontSize: '0.68rem', color: '#64748B' }}>{showPriestFilterDrawer ? '▲' : '▼'}</span>
                              </button>

                              {/* Reset Button (only shown when any filter is active) */}
                              {(priestFilterRadius !== 5 || priestSortBy !== 'date_asc' || priestFilterService !== 'all' || priestFilterLanguage !== 'all') && (
                                <button
                                  type="button"
                                  className="feed-reset-btn"
                                  onClick={() => {
                                    setPriestFilterRadius(5);
                                    setPriestSortBy('date_asc');
                                    setPriestFilterService('all');
                                    setPriestFilterLanguage('all');
                                  }}
                                  title="Reset all filters to default"
                                  style={{ padding: '0.24rem 0.5rem', fontSize: '0.74rem' }}
                                >
                                  <span>↺ Reset</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expandable Secondary Filter Panel */}
                          {showPriestFilterDrawer && (
                            <div className="feed-filters-row" style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid #F1F5F9' }}>
                              {/* Sort By */}
                              <div className="feed-filter-item">
                                <label className="feed-filter-label" htmlFor="feed-sort-select">
                                  Sort By
                                </label>
                                <select
                                  id="feed-sort-select"
                                  className="feed-select"
                                  value={priestSortBy}
                                  onChange={(e) => setPriestSortBy(e.target.value)}
                                >
                                  <option value="date_asc">Date of Need (Earliest)</option>
                                  <option value="distance_asc">Distance (Nearest first)</option>
                                  <option value="recent_posted">Recently Posted</option>
                                  <option value="date_desc">Date of Need (Furthest)</option>
                                </select>
                              </div>

                              {/* Sacrament / Service Filter */}
                              <div className="feed-filter-item">
                                <label className="feed-filter-label" htmlFor="feed-service-select">
                                  Sacrament / Ministry
                                </label>
                                <select
                                  id="feed-service-select"
                                  className="feed-select"
                                  value={priestFilterService}
                                  onChange={(e) => setPriestFilterService(e.target.value)}
                                >
                                  <option value="all">All Sacraments & Services (Default)</option>
                                  <optgroup label="Core Masses & Sacraments">
                                    <option value="mass">Holy Mass (Parish / Convent)</option>
                                    <option value="substation">Substation Mass</option>
                                    <option value="concelebration">Concelebration (Feasts & Events)</option>
                                    <option value="marriage">Marriage Mass</option>
                                    <option value="funeral">Funeral / Requiem Mass</option>
                                    <option value="confession">Confession Ministry</option>
                                    <option value="recollection">Monthly Recollection Talk</option>
                                    <option value="retreat">Annual Retreat Preacher</option>
                                  </optgroup>
                                  <optgroup label="Special Events & Blessings">
                                    <option value="house_blessing">House Blessing</option>
                                    <option value="easter">Easter Blessing</option>
                                    <option value="carols">Christmas Carols</option>
                                    <option value="sick">Communion to Sick</option>
                                    <option value="others">Others</option>
                                  </optgroup>
                                </select>
                              </div>

                              {/* Liturgical Language Filter */}
                              <div className="feed-filter-item">
                                <label className="feed-filter-label" htmlFor="feed-language-select">
                                  Liturgical Language
                                </label>
                                <select
                                  id="feed-language-select"
                                  className="feed-select"
                                  value={priestFilterLanguage}
                                  onChange={(e) => setPriestFilterLanguage(e.target.value)}
                                >
                                  <option value="all">All Languages</option>
                                  {LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : requestsTab === 'my_requests' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.15rem' }}>
                          <span style={{ fontSize: '0.84rem', color: '#64748B' }}>
                            Needs posted for your parish or community:
                          </span>
                          {user.is_verified === 1 && (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => setShowRequestModal(true)}
                              style={{
                                padding: '0.5rem 1.15rem',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                borderRadius: '9999px'
                              }}
                            >
                              <span>➕</span>
                              <span>Post a Ministry Request</span>
                            </button>
                          )}
                        </div>
                      ) : <div style={{ marginBottom: '0.5rem' }} />}
                    </div>
                  );
                })()}

                {/* 3. PRIEST CARDS FEED */}
                <div className="roster-grid">
                  {(() => {
                    let displayBookings = [];
                    if (requestsTab === 'open') {
                      displayBookings = bookings.filter(b => {
                        if (b.status !== 'pending' || b.requester_id === user.id) return false;
                        // Radius filter
                        if (priestFilterRadius !== 'all') {
                          if (b.distance_km !== null && b.distance_km > priestFilterRadius) return false;
                        }
                        // Sacrament / Service filter
                        if (priestFilterService !== 'all') {
                          const s = (b.service_type || '').toLowerCase();
                          const f = priestFilterService.toLowerCase();
                          let match = false;
                          if (f === 'substation') match = s.includes('substation');
                          else if (f === 'concelebration') match = s.includes('concelebration');
                          else if (f === 'marriage') match = s.includes('marriage') || s.includes('matrimony') || s.includes('wedding');
                          else if (f === 'funeral') match = s.includes('funeral') || s.includes('requiem') || s.includes('burial');
                          else if (f === 'festival') match = s.includes('festival') || s.includes('feast') || s.includes('jubilee');
                          else if (f === 'confession') match = s.includes('confession') || s.includes('penitential');
                          else if (f === 'recollection') match = s.includes('recollection');
                          else if (f === 'carols') match = s.includes('carol') || s.includes('christmas');
                          else if (f === 'easter') match = s.includes('easter');
                          else if (f === 'house_blessing') match = s.includes('house blessing') || s.includes('home blessing');
                          else if (f === 'sick') match = s.includes('sick') || s.includes('communion to') || s.includes('viaticum') || s.includes('anointing');
                          else if (f === 'retreat') match = s.includes('retreat');
                          else if (f === 'mass') match = s.includes('holy mass') || (s.includes('mass') && !s.includes('substation') && !s.includes('marriage') && !s.includes('funeral') && !s.includes('festival'));
                          else if (f === 'others') {
                            const knownKeys = ['substation', 'concelebration', 'marriage', 'matrimony', 'funeral', 'requiem', 'festival', 'feast', 'confession', 'recollection', 'carol', 'easter', 'house blessing', 'sick', 'retreat', 'holy mass'];
                            match = s.includes('other') || !knownKeys.some(k => s.includes(k));
                          } else match = s.includes(f);
                          if (!match) return false;
                        }
                        // Language filter
                        if (priestFilterLanguage !== 'all') {
                          const l = (b.language || '').toLowerCase();
                          if (!l.includes(priestFilterLanguage.toLowerCase())) return false;
                        }
                        return true;
                      });
                    } else if (requestsTab === 'accepted') {
                      displayBookings = bookings.filter(b => (b.status === 'accepted' || b.status === 'completed') && (b.responder_id === user.id || b.requester_id === user.id));
                    } else if (requestsTab === 'review') {
                      // requests where Father offered to celebrate
                      displayBookings = bookings.filter(b => b.status === 'pending' && (b.applicants || []).some(a => a.priest_id === user.id));
                    } else {
                      // 'my_requests' tab: all requests created by this Father
                      displayBookings = bookings.filter(b => b.requester_id === user.id);
                    }

                    // Sorting logic across items
                    displayBookings.sort((a, b) => {
                      if (priestSortBy === 'distance_asc') {
                        const distA = a.distance_km != null ? a.distance_km : 99999;
                        const distB = b.distance_km != null ? b.distance_km : 99999;
                        if (distA !== distB) return distA - distB;
                        return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
                      } else if (priestSortBy === 'recent_posted') {
                        const timeA = a.created_at ? new Date(a.created_at).getTime() : (a.id || 0);
                        const timeB = b.created_at ? new Date(b.created_at).getTime() : (b.id || 0);
                        return timeB - timeA;
                      } else if (priestSortBy === 'date_desc') {
                        const timeA = a.datetime ? new Date(a.datetime).getTime() : 0;
                        const timeB = b.datetime ? new Date(b.datetime).getTime() : 0;
                        return timeB - timeA;
                      } else {
                        // Default: 'date_asc' (Earliest need date first)
                        const timeA = a.datetime ? new Date(a.datetime).getTime() : 0;
                        const timeB = b.datetime ? new Date(b.datetime).getTime() : 0;
                        return timeA - timeB;
                      }
                    });

                    const isFiltered = priestFilterRadius !== 5 || priestFilterService !== 'all' || priestFilterLanguage !== 'all' || priestSortBy !== 'date_asc';

                    if (displayBookings.length === 0) {
                      return (
                        <div className="no-data" style={{ gridColumn: '1 / -1', padding: '2.5rem 1rem' }}>
                          <div className="no-data-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.65rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                              {requestsTab === 'open' ? (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                </svg>
                              ) : requestsTab === 'accepted' ? (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.4 1.4" />
                                  <path d="m18 10 1.3-1.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L14 6" />
                                  <path d="m2 14 6 6" />
                                  <path d="M7 9 2 14" />
                                  <path d="M14 6 8.7 11.3a1 1 0 0 0 0 1.4l2.6 2.6" />
                                </svg>
                              ) : requestsTab === 'my_requests' ? (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                              ) : (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <h4 style={{ color: '#0F172A', marginBottom: '0.35rem' }}>
                            {requestsTab === 'open'
                              ? isFiltered
                                ? 'No Requests Match Your Filters'
                                : `No Open Needs Found within ${priestFilterRadius === 'all' ? 'the Diocese' : `${priestFilterRadius} km`}`
                              : requestsTab === 'accepted'
                              ? 'No Confirmed Celebrations Yet'
                              : requestsTab === 'my_requests'
                              ? 'No Ministry Requests Posted Yet'
                              : 'No Pending Responses'}
                          </h4>
                          <p style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '440px', margin: '0 auto', marginBottom: '1rem' }}>
                            {requestsTab === 'open'
                              ? isFiltered
                                ? 'Try adjusting your distance slider, sacrament filter, or liturgical language to see more needs.'
                                : priestFilterRadius !== 'all'
                                ? `There are no requests within ${priestFilterRadius} km right now. Expand your travel distance to discover needs in nearby parishes.`
                                : 'All parishes and convents in the diocese are currently covered. Check back soon for new requests.'
                              : requestsTab === 'accepted'
                              ? 'When your availability offer is selected by a Sister or a parish, your confirmed celebration will appear here with WhatsApp, direct call, and Google Maps directions.'
                              : requestsTab === 'my_requests'
                              ? 'Need supply assistance for your parish during annual retreat, provincial chapter, or leave? Post a request to broadcast to available priests.'
                              : 'Ministry needs where you marked your availability will stay listed here until confirmed by the Requester.'}
                          </p>

                          {/* ACTIONABLE 1-TAP ENGAGEMENT SHORTCUTS */}
                          {requestsTab === 'open' && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {priestFilterRadius !== 25 && priestFilterRadius !== 'all' && (
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setPriestFilterRadius(25)}
                                  style={{ borderRadius: '9999px', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600, background: '#FFFFFF', borderColor: '#CBD5E1' }}
                                >
                                  Expand to 25 km
                                </button>
                              )}

                              {priestFilterRadius !== 'all' && (() => {
                                const totalDioceseNeeds = bookings.filter(b => b.status === 'pending' && b.requester_id !== user.id).length;
                                return totalDioceseNeeds > 0 ? (
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                      setPriestFilterRadius('all');
                                      setPriestFilterService('all');
                                      setPriestFilterLanguage('all');
                                    }}
                                    style={{ borderRadius: '9999px', padding: '0.45rem 1.15rem', fontSize: '0.8rem', fontWeight: 700 }}
                                  >
                                    View All Diocese ({totalDioceseNeeds} Needs) ↗
                                  </button>
                                ) : null;
                              })()}

                              {isFiltered && (
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setPriestFilterRadius(5);
                                    setPriestSortBy('date_asc');
                                    setPriestFilterService('all');
                                    setPriestFilterLanguage('all');
                                  }}
                                  style={{ borderRadius: '9999px', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}
                                >
                                  ↺ Reset All Filters
                                </button>
                              )}
                            </div>
                          )}

                          {requestsTab === 'my_requests' && user.is_verified === 1 && (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => setShowRequestModal(true)}
                              style={{ borderRadius: '9999px', padding: '0.6rem 1.25rem', fontWeight: 700 }}
                            >
                              ➕ Post a Ministry Request
                            </button>
                          )}
                        </div>
                      );
                    }

                    return displayBookings.map((b) => {
                      const { date, time } = formatDateTime(b.datetime, b.datetime_end);
                      const isMyRequest = b.requester_id === user.id;
                      const isConfirmed = b.status === 'accepted' || b.status === 'completed';
                      const urgency = isConfirmed ? getCelebrationUrgency(b.datetime) : null;
                      const isConfirmedPriest = b.responder_id === user.id;
                      const hasOffered = (b.applicants || []).some(a => a.priest_id === user.id);
                      const applicantsCount = (b.applicants || []).length;

                      return (
                        <div
                          className="priest-card"
                          key={b.id}
                          style={{
                            borderColor: isConfirmed ? '#BBF7D0' : hasOffered ? '#FDE68A' : '#E2E8F0',
                            background: isConfirmed ? '#F0FDF4' : '#FFFFFF',
                            boxShadow: isConfirmed ? '0 4px 14px rgba(22, 163, 74, 0.08)' : 'var(--shadow-sm)'
                          }}
                        >
                          {/* 1. HERO SCHEDULE STRIP: DATE, TIME & STATUS */}
                          <div className="card-schedule-strip">
                            <div className="card-schedule-datetime">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span className="card-schedule-date">{date}</span>
                                {urgency && (
                                  <span className={`urgency-pill ${urgency.badgeClass}`}>
                                    {urgency.isPulsing && <span className="urgency-pulse-dot"></span>}
                                    {urgency.label}
                                  </span>
                                )}
                              </div>
                              <span className="card-schedule-time">{time}</span>
                            </div>
                            <span
                              className={`distance-badge ${isConfirmed ? 'badge-confirmed' : ''}`}
                              style={{
                                background: isConfirmed ? '#F0FDF4' : hasOffered ? '#FEFCE8' : '#F1F5F9',
                                color: isConfirmed ? '#166534' : hasOffered ? '#854D0E' : '#0F172A',
                                borderColor: isConfirmed ? '#86EFAC' : hasOffered ? '#FDE047' : '#CBD5E1',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                padding: '0.28rem 0.7rem',
                                borderRadius: '8px'
                              }}
                            >
                              {isConfirmed
                                ? `Confirmed: ${b.service_type || 'Holy Mass'}`
                                : hasOffered
                                ? `Marked as available: ${b.service_type || 'Holy Mass'}`
                                : (b.service_type || 'Holy Mass')}
                            </span>
                          </div>

                          {/* 2. LITURGICAL MODIFIERS, LANGUAGE & DISTANCE TAGS ROW */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {(() => {
                              const s = (b.service_type || '').toLowerCase();
                              if (s.includes('substation')) {
                                return <span className="card-tag-pill card-tag-substation">Substation</span>;
                              }
                              if (s.includes('concelebration')) {
                                return <span className="card-tag-pill card-tag-concelebrant">Concelebrant</span>;
                              }
                              if (s.includes('funeral') || s.includes('requiem')) {
                                return <span className="card-tag-pill card-tag-requiem">Requiem</span>;
                              }
                              if (s.includes('marriage') || s.includes('matrimony')) {
                                return <span className="card-tag-pill card-tag-marriage">Marriage</span>;
                              }
                              return null;
                            })()}

                            <span className="card-tag-pill card-tag-language">
                              {b.language || 'English'}
                            </span>

                            {b.distance_km !== null && (
                              <span className="card-tag-pill card-tag-distance" style={{ marginLeft: 'auto' }}>
                                {b.distance_km} km away
                              </span>
                            )}
                          </div>

                          {/* 3. REQUESTER & VENUE IDENTITY ROW */}
                          <div className="card-requester-row">
                            <div className="avatar-badge" style={{ width: '36px', height: '36px', borderColor: '#CBD5E1', flexShrink: 0 }}>
                              {b.requester_photo ? (
                                <img src={b.requester_photo} alt={b.requester_name} />
                              ) : (
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                                  {b.requester_title === 'Sr.' || b.requester_clergy_type === 'convent' ? 'Sr.' : 'Fr.'}
                                </span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {formatEcclesiasticalName(b.requester_title || (b.requester_clergy_type === 'convent' ? 'Sr.' : 'Fr.'), b.requester_name, b.requester_congregation_abbr)}
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {b.location ? `${b.location}` : (b.requester_order || b.requester_diocese || 'Parish Community')}
                              </div>
                            </div>
                          </div>

                          {/* 4. PROMINENT NOTE BOX */}
                          {b.notes && (
                            <div className="card-note-box">
                              <span style={{ fontWeight: 700, marginRight: '4px' }}>Note:</span>
                              "{b.notes}"
                            </div>
                          )}

                          {/* CASE 1: CONFIRMED CELEBRATION - POST-CONFIRMATION ACTION HUB */}
                          {isConfirmed && (
                            <div style={{ background: '#F8FAFC', border: '1.5px solid #BBF7D0', borderRadius: '12px', padding: '0.9rem', marginTop: 'auto' }}>
                              {/* Header: Celebrant / Requester Confirmation Badge */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '0.65rem' }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                  </svg>
                                  <span>Confirmed with {formatEcclesiasticalName(isConfirmedPriest ? b.requester_title || 'Sr.' : b.responder_title || 'Fr.', isConfirmedPriest ? b.requester_name : b.responder_name, isConfirmedPriest ? b.requester_congregation_abbr : b.responder_congregation_abbr)}</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: '#DCFCE7', color: '#15803D' }}>
                                  Slot Locked
                                </span>
                              </div>

                              {/* 1-Tap Quick Action Grid: Call, WhatsApp, Map Navigation, Add to Calendar */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.65rem' }}>
                                <a
                                  href={`tel:${isConfirmedPriest ? b.requester_mobile : b.responder_mobile}`}
                                  className="btn btn-call btn-sm"
                                  style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.78rem', justifyContent: 'center' }}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                  <span>Call Direct</span>
                                </a>

                                <a
                                  href={getWhatsAppLink(isConfirmedPriest ? b.requester_mobile : b.responder_mobile, `Praised be Jesus Christ! Father here regarding our confirmed celebration for ${b.service_type || 'Holy Mass'} at ${b.location || 'Parish Chapel'} on ${date} (${time}).`)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="wa-btn"
                                  style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.78rem', justifyContent: 'center' }}
                                >
                                  <span>WhatsApp</span>
                                </a>

                                {b.location && (
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.location)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.78rem', justifyContent: 'center', background: '#FFFFFF', borderColor: '#CBD5E1' }}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                      <polygon points="3 11 22 2 13 21 11 13 3 11" />
                                    </svg>
                                    <span>Directions</span>
                                  </a>
                                )}

                                <a
                                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${b.service_type || 'Holy Mass'} - ${b.location || 'Parish'}`)}&dates=${(() => {
                                    const d = new Date(b.datetime);
                                    const dEnd = new Date(b.datetime_end || d.getTime() + 3600000);
                                    const fmt = dt => dt.toISOString().replace(/-|:|\.\d\d\d/g, '');
                                    return `${fmt(d)}/${fmt(dEnd)}`;
                                  })()}&details=${encodeURIComponent(`Confirmed ministry with ${formatEcclesiasticalName(isConfirmedPriest ? b.requester_title || 'Sr.' : b.responder_title || 'Fr.', isConfirmedPriest ? b.requester_name : b.responder_name, isConfirmedPriest ? b.requester_congregation_abbr : b.responder_congregation_abbr)}. Contact: ${isConfirmedPriest ? b.requester_mobile : b.responder_mobile}`)}&location=${encodeURIComponent(b.location || '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.78rem', justifyContent: 'center', background: '#FFFFFF', borderColor: '#CBD5E1' }}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                  </svg>
                                  <span>Add to Calendar</span>
                                </a>
                              </div>

                              {/* Pastoral Checklist: Next Steps Guide */}
                              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.55rem 0.75rem', fontSize: '0.74rem', color: '#475569', lineHeight: '1.45' }}>
                                <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                                  ✓ Next Steps Checklist:
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <span>1. Verify vestment/stole color & liturgy intentions via WhatsApp.</span>
                                  <span>2. Recheck transit time ({b.distance_km ? `${b.distance_km} km` : 'destination distance'}) prior to celebration.</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* CASE 2: OPEN REQUEST FROM OTHERS - 1-TAP "I AM AVAILABLE" OR "WITHDRAW" */}
                          {!isConfirmed && !isMyRequest && user.is_verified === 1 && (
                            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                              {hasOffered ? (
                                <div style={{ background: '#FFFDF5', border: '1px solid #FDE68A', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                                  <div style={{ color: '#92400E', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.35rem', textAlign: 'center' }}>
                                    ✓ Marked as available for this Mass
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#78350F', textAlign: 'center', marginBottom: '0.5rem' }}>
                                    Awaiting Requester to review and confirm.
                                  </div>
                                  <div style={{ textAlign: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleWithdrawOffer(b.id)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#DC2626',
                                        fontSize: '0.76rem',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        fontWeight: 600
                                      }}
                                    >
                                      ✕ Withdraw my availability
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-primary"
                                  onClick={() => handleOfferMinistry(b.id)}
                                  style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    fontWeight: 700,
                                    fontSize: '0.92rem',
                                    background: '#16A34A',
                                    borderColor: '#15803D'
                                  }}
                                >
                                  ✋ I Am Available to Celebrate
                                </button>
                              )}
                            </div>
                          )}

                          {/* CASE 3: MY REQUEST (FATHER'S OWN POST) - REVIEW APPLICANTS & CONFIRM */}
                          {!isConfirmed && isMyRequest && (
                            <div className="applicants-box" style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                <span>🙌 Fathers Ready to Celebrate ({applicantsCount})</span>
                                <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>Select a Father for this ministry</span>
                              </div>

                              {applicantsCount === 0 ? (
                                <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.5rem 0' }}>
                                  Awaiting available priests to respond for this ministry.
                                </p>
                              ) : (
                                (b.applicants || []).map(cand => (
                                  <div className="applicant-card" key={cand.priest_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '220px', flex: 1 }}>
                                      <div className="avatar-badge" style={{ width: '38px', height: '38px' }}>
                                        {cand.profile_photo ? (
                                          <img src={cand.profile_photo} alt={cand.priest_name} />
                                        ) : (
                                          <span style={{ fontSize: '0.78rem' }}>{cand.priest_title || 'Fr.'}</span>
                                        )}
                                      </div>
                                      <div>
                                        <div className="applicant-name" style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                                          {formatEcclesiasticalName(cand.priest_title || 'Fr.', cand.priest_name, cand.congregation_abbr)}
                                        </div>
                                        <div className="applicant-sub" style={{ fontSize: '0.76rem', color: '#64748B' }}>
                                          {cand.clergy_type === 'religious' ? cand.religious_order : cand.diocese_province}
                                          {cand.residence_name ? ` • 📍 ${cand.residence_name}` : ''}
                                          {cand.distance_km !== null ? ` (${cand.distance_km} km away)` : ''}
                                        </div>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                      {cand.priest_mobile && (
                                        <>
                                          <a
                                            href={`tel:${cand.priest_mobile}`}
                                            className="btn btn-call btn-sm"
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                                            title="Call Father"
                                          >
                                            📞 Call
                                          </a>
                                          <a
                                            href={getWhatsAppLink(cand.priest_mobile, `Praised be Jesus Christ! Father, regarding the ministry request for ${b.service_type || 'Holy Mass'} on ${date}.`)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="wa-btn"
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                                            title="WhatsApp Father"
                                          >
                                            💬
                                          </a>
                                        </>
                                      )}
                                      <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleConfirmApplicant(b.id, cand.priest_id, cand.priest_name)}
                                        style={{ padding: '0.42rem 0.85rem', fontSize: '0.82rem', fontWeight: 700, background: '#16A34A', borderColor: '#15803D' }}
                                      >
                                        ✓ Select & Confirm
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* SISTERS (Sr.) & BROTHERS (Br.) DASHBOARD - REQUESTER WORKFLOW             */
              /* ========================================================================= */
              <div>
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

                {/* 3 Sub-Tabs for Sisters/Brothers: 1. Ministry Needs, 2. Priests Responded, 3. Confirmed Celebrations */}
                {(() => {
                  const openCount = bookings.filter(b => b.status === 'pending' && (!b.applicants || b.applicants.length === 0)).length;
                  const reviewCount = bookings.filter(b => b.status === 'pending' && (b.applicants && b.applicants.length > 0)).length;
                  const confirmedCount = bookings.filter(b => b.status === 'accepted' || b.status === 'completed').length;

                  return (
                    <div className="tabs" style={{ marginBottom: '1.25rem' }}>
                      <div
                        className={`tab ${requestsTab === 'open' ? 'active' : ''}`}
                        onClick={() => setRequestsTab('open')}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 5L6 9H2v6h4l5 4V5z" />
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </svg>
                        <span>Ministry Needs ({openCount})</span>
                      </div>
                      <div
                        className={`tab ${requestsTab === 'review' ? 'active' : ''}`}
                        onClick={() => setRequestsTab('review')}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Priests Responded ({reviewCount})</span>
                      </div>
                      <div
                        className={`tab ${requestsTab === 'accepted' ? 'active' : ''}`}
                        onClick={() => setRequestsTab('accepted')}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.4 1.4" />
                          <path d="m18 10 1.3-1.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L14 6" />
                          <path d="m2 14 6 6" />
                          <path d="M7 9 2 14" />
                          <path d="M14 6 8.7 11.3a1 1 0 0 0 0 1.4l2.6 2.6" />
                        </svg>
                        <span>Confirmed ({confirmedCount})</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="roster-grid">
                  {(() => {
                    const filteredBookings = bookings.filter(b => {
                      if (requestsTab === 'open') {
                        return b.status === 'pending' && (!b.applicants || b.applicants.length === 0);
                      }
                      if (requestsTab === 'review') {
                        return b.status === 'pending' && (b.applicants && b.applicants.length > 0);
                      }
                      return b.status === 'accepted' || b.status === 'completed';
                    });

                    if (filteredBookings.length === 0) {
                      return (
                        <div className="no-data" style={{ gridColumn: '1 / -1' }}>
                          <div className="no-data-icon">
                            {requestsTab === 'open' ? '🕊️' : requestsTab === 'review' ? '🙌' : '🤝'}
                          </div>
                          <p>
                            {requestsTab === 'open'
                              ? 'No open liturgical needs waiting for celebrants.'
                              : requestsTab === 'review'
                              ? 'No pending priest responses to review at the moment.'
                              : 'No confirmed celebrations found yet.'}
                          </p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {requestsTab === 'open'
                              ? 'Parishes and Convents can click "➕ Post a Ministry Request" to share a need.'
                              : requestsTab === 'review'
                              ? 'When priests indicate their availability to celebrate, they will appear here for you to invite.'
                              : 'When a priest is selected, the celebration appears here with direct contact details.'}
                          </p>
                        </div>
                      );
                    }

                    return filteredBookings.map((b) => {
                      const { date, time } = formatDateTime(b.datetime, b.datetime_end);
                      const isMyRequest = b.requester_id === user.id;
                      const isConfirmed = b.status === 'accepted' || b.status === 'completed';
                      const urgency = isConfirmed ? getCelebrationUrgency(b.datetime) : null;
                      const applicantsCount = (b.applicants || []).length;

                      return (
                        <div className="priest-card" key={b.id} style={{ borderColor: isConfirmed ? '#BBF7D0' : applicantsCount > 0 ? '#BFDBFE' : '#E2E8F0' }}>
                          <div className="priest-header">
                            <div>
                              <div className="priest-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span>{date}</span>
                                {urgency && (
                                  <span className={`urgency-pill ${urgency.badgeClass}`}>
                                    {urgency.isPulsing && <span className="urgency-pulse-dot"></span>}
                                    {urgency.label}
                                  </span>
                                )}
                              </div>
                              <div style={{ color: 'var(--accent-gold)', fontSize: '0.85rem' }}>⏰ {time}</div>
                            </div>
                            <span
                              className={`distance-badge ${isConfirmed ? 'badge-confirmed' : ''}`}
                              style={{
                                background: isConfirmed ? '#DCFCE7' : applicantsCount > 0 ? '#EFF6FF' : '#F1F5F9',
                                color: isConfirmed ? '#15803D' : applicantsCount > 0 ? '#1D4ED8' : '#475569'
                              }}
                            >
                              {isConfirmed
                                ? '🤝 Confirmed Celebrant'
                                : applicantsCount > 0
                                ? `🙌 ${applicantsCount} Priest${applicantsCount > 1 ? 's' : ''} Ready to Serve`
                                : '🕊️ Awaiting Celebrant'}
                            </span>
                          </div>

                          <div className="priest-meta-row">
                            <div className="priest-meta-item">
                              <span>✨</span>
                              <strong>Service:</strong>
                              <span style={{ color: 'var(--accent-gold)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                                <span>{b.service_type || 'Holy Mass'}</span>
                                {(() => {
                                  const s = (b.service_type || '').toLowerCase();
                                  if (s.includes('substation')) {
                                    return <span style={{ fontSize: '0.68rem', background: '#DBEAFE', color: '#1E40AF', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>🛵 Substation</span>;
                                  }
                                  if (s.includes('concelebration')) {
                                    return <span style={{ fontSize: '0.68rem', background: '#F3E8FF', color: '#6B21A8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>🤝 Concelebrant</span>;
                                  }
                                  if (s.includes('funeral') || s.includes('requiem')) {
                                    return <span style={{ fontSize: '0.68rem', background: '#F1F5F9', color: '#334155', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>🕊️ Requiem</span>;
                                  }
                                  if (s.includes('marriage') || s.includes('matrimony')) {
                                    return <span style={{ fontSize: '0.68rem', background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>💒 Marriage</span>;
                                  }
                                  return null;
                                })()}
                              </span>
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
                              <strong>Requested By:</strong> {formatEcclesiasticalName(b.requester_title || (b.requester_clergy_type === 'convent' ? 'Sr.' : 'Fr.'), b.requester_name, b.requester_congregation_abbr)} ({b.requester_order || b.requester_diocese})
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

                          {/* CASE A: ACCEPTED / CONFIRMED TAB */}
                          {isConfirmed && (
                            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', padding: '0.9rem', marginTop: 'auto' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div className="avatar-badge" style={{ width: '40px', height: '40px', borderColor: '#166534' }}>
                                  {b.responder_photo ? (
                                    <img src={b.responder_photo} alt={b.responder_name} />
                                  ) : (
                                    <span style={{ fontSize: '0.8rem' }}>{b.responder_title || 'Fr.'}</span>
                                  )}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.92rem' }}>
                                    🤝 Confirmed Celebrant: {formatEcclesiasticalName(b.responder_title || 'Fr.', b.responder_name, b.responder_congregation_abbr)}
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: '#15803D' }}>
                                    {b.responder_order || b.responder_diocese}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.45rem' }}>
                                <a
                                  href={`tel:${isMyRequest ? b.responder_mobile : b.requester_mobile}`}
                                  className="btn btn-call btn-sm"
                                  style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.78rem', justifyContent: 'center' }}
                                >
                                  📞 Call {isMyRequest ? 'Priest' : 'Parish'}
                                </a>
                                <a
                                  href={getWhatsAppLink(isMyRequest ? b.responder_mobile : b.requester_mobile, `Praised be Jesus Christ! Regarding our confirmed celebration for ${b.service_type || 'Holy Mass'} at ${b.location} on ${date} (${time}).`)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="wa-btn"
                                  style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.78rem', justifyContent: 'center' }}
                                >
                                  💬 WhatsApp
                                </a>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                                {b.location && (
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.location)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.78rem', justifyContent: 'center', background: '#FFFFFF', borderColor: '#CBD5E1' }}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                      <polygon points="3 11 22 2 13 21 11 13 3 11" />
                                    </svg>
                                    <span>Directions</span>
                                  </a>
                                )}
                                <a
                                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${b.service_type || 'Holy Mass'} - ${b.location || 'Parish'}`)}&dates=${(() => {
                                    const d = new Date(b.datetime);
                                    const dEnd = new Date(b.datetime_end || d.getTime() + 3600000);
                                    const fmt = dt => dt.toISOString().replace(/-|:|\.\d\d\d/g, '');
                                    return `${fmt(d)}/${fmt(dEnd)}`;
                                  })()}&details=${encodeURIComponent(`Confirmed liturgy with ${formatEcclesiasticalName(b.responder_title || 'Fr.', b.responder_name, b.responder_congregation_abbr)}. Contact: ${b.responder_mobile}`)}&location=${encodeURIComponent(b.location || '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.78rem', justifyContent: 'center', background: '#FFFFFF', borderColor: '#CBD5E1' }}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                  </svg>
                                  <span>Add to Calendar</span>
                                </a>
                              </div>
                            </div>
                          )}

                          {/* CASE B: PRIESTS RESPONDED TAB - SISTER/BROTHER CAN CONFIRM CELEBRANT */}
                          {!isConfirmed && (requestsTab === 'review' || isMyRequest) && (
                            <div className="applicants-box" style={{ marginTop: 'auto' }}>
                              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span>🙌 Fathers Ready to Celebrate ({applicantsCount})</span>
                                {isMyRequest && (
                                  <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>Select a Father for this ministry</span>
                                )}
                              </div>

                              {isMyRequest && applicantsCount > 0 && (
                                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '0.45rem 0.65rem', fontSize: '0.74rem', color: '#1E40AF', lineHeight: '1.4', marginBottom: '0.55rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>💬</span>
                                  <span><strong>Direct Contact Advisory:</strong> Please chat with Father on WhatsApp or call him directly to verify timing and liturgical arrangements before confirming.</span>
                                </div>
                              )}

                              {applicantsCount === 0 ? (
                                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                                  Awaiting available priests to respond for this ministry.
                                </p>
                              ) : (
                                (b.applicants || []).map(cand => (
                                  <div className="applicant-card" key={cand.priest_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '6px', marginBottom: '0.4rem', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '200px' }}>
                                      <div className="avatar-badge" style={{ width: '36px', height: '36px' }}>
                                        {cand.profile_photo ? (
                                          <img src={cand.profile_photo} alt={cand.priest_name} />
                                        ) : (
                                          <span style={{ fontSize: '0.75rem' }}>{cand.priest_title || 'Fr.'}</span>
                                        )}
                                      </div>
                                      <div>
                                        <div className="applicant-name" style={{ fontWeight: 700, color: '#0F172A' }}>
                                          {formatEcclesiasticalName(cand.priest_title || 'Fr.', cand.priest_name, cand.congregation_abbr)}
                                        </div>
                                        <div className="applicant-sub" style={{ fontSize: '0.78rem', color: '#64748B' }}>
                                          {cand.clergy_type === 'religious' ? cand.religious_order : cand.diocese_province}
                                          {cand.residence_name ? ` • 📍 ${cand.residence_name}` : ''}
                                          {cand.distance_km !== null ? ` (${cand.distance_km} km away)` : ''}
                                        </div>
                                      </div>
                                    </div>
                                    {isMyRequest && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                        {cand.priest_mobile && (
                                          <>
                                            <a
                                              href={`tel:${cand.priest_mobile}`}
                                              className="btn btn-call btn-sm"
                                              style={{ padding: '0.35rem 0.55rem', fontSize: '0.76rem' }}
                                              title="Call Father"
                                            >
                                              📞
                                            </a>
                                            <a
                                              href={getWhatsAppLink(cand.priest_mobile, `Praised be Jesus Christ! Father, regarding the ministry request for ${b.service_type || 'Holy Mass'} at ${b.location} on ${date}.`)}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="wa-btn"
                                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                              title="Chat directly on WhatsApp before confirming"
                                            >
                                              <span>💬</span>
                                              <span>WhatsApp</span>
                                            </a>
                                          </>
                                        )}
                                        <button
                                          className="btn btn-primary btn-sm"
                                          onClick={() => handleConfirmApplicant(b.id, cand.priest_id, cand.priest_name)}
                                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', fontWeight: 700 }}
                                        >
                                          ✓ Select {cand.priest_title || 'Fr.'} {cand.priest_name.replace(/^(Rev\.\s*|Fr\.\s*|Br\.\s*|Sr\.\s*)+/i, '').split(' ')[0]}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* PLATFORM NOTICE & CANONICAL ADVISORY DISCLAIMER */}
            <div className="platform-disclaimer-card">
              <div className="disclaimer-header">
                <span className="disclaimer-icon">📜</span>
                <h4 className="disclaimer-title">Platform Notice & Canonical Advisory</h4>
              </div>
              <div className="disclaimer-content">
                <p>
                  <strong>Facilitation Forum Only:</strong> ArulApp is designed solely as a voluntary facilitation forum to help convents, parishes, and religious communities discover the liturgical availability of Catholic priests easily.
                </p>
                <p>
                  <strong>Direct Communication Required Prior to Confirmation:</strong> Requesters must always converse directly with the priest (via WhatsApp or phone call) prior to finalizing or confirming any ministry. Direct communication is essential to verify mutual agreement, exact timing, honorarium, and liturgical details.
                </p>
                <p>
                  <strong>No Guarantee or Platform Liability:</strong> ArulApp provides availability information in good faith but provides no assurance or guarantee regarding celebrant attendance, punctuality, or fulfillment, and assumes no responsibility or liability for cancellations, unforeseen absences, or travel disruptions.
                </p>
                <p>
                  <strong>Direct Bilateral Arrangements:</strong> Once contact details are obtained, all arrangements and coordination take place directly between the requesting community and the priest through WhatsApp or direct call. The platform does not arbitrate or entertain grievances or disputes arising from individual engagements.
                </p>
              </div>
            </div>
          </>
        )}

        {/* --- ADMIN QUEUE TAB --- */}
        {activeMode === 'admin' && user.is_admin === 1 && (
          <div>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="dashboard-title">
                <h2>Admin Manual Verification Queue</h2>
                <p>Verify raw priest and religious order credentials before unlocking app features</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setAdminOnboardSuccess(null);
                  setOnboardTitle('Sr.');
                  setOnboardName('');
                  setOnboardCongregationAbbr('');
                  setOnboardMobile('');
                  setOnboardOrder('');
                  setOnboardResidenceName('');
                  setOnboardAddress('');
                  setOnboardPincode('');
                  setOnboardPassword('Jesus@123');
                  setShowAdminOnboardModal(true);
                }}
                style={{
                  background: '#16A34A',
                  borderColor: '#15803D',
                  padding: '0.65rem 1.1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700
                }}
              >
                <span>➕</span>
                <span>Register Sister / Clergy Directly</span>
              </button>
            </div>

            <div className="admin-queue">
              {pendingUsers.length === 0 ? (
                <div className="no-data">
                  <div className="no-data-icon">👥</div>
                  <p>All registered clergy and religious accounts have been verified. No pending reviews in queue.</p>
                </div>
              ) : (
                pendingUsers.map((u) => (
                  <div className="admin-card" key={u.id}>
                    <div className="admin-info">
                      <div className="admin-priest-name">
                        {formatEcclesiasticalName(u.title || (u.clergy_type === 'convent' ? 'Sr.' : 'Fr.'), u.name, u.congregation_abbr)}
                      </div>
                      <div className="admin-priest-meta">
                        <span>📱 {u.mobile}</span>
                        <span>⛪ {u.clergy_type === 'religious' ? u.religious_order : (u.diocese_province || u.religious_order)}</span>
                        <span>📍 {u.residence_name || 'No residence set'} ({u.residence_address})</span>
                        <span>{u.title === 'Fr.' ? `🏍️ ${u.transport_mode} | Max: ${u.max_travel_km} km` : '🕊️ Religious Community'}</span>
                      </div>
                    </div>
                    <div>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleVerifyUser(u.id, true)}
                      >
                        ✓ Approve Account
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>



      {/* --- MODAL 2: CONFIRM VERBAL BOOKING --- */}
      {showDirectConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">🤝 Lock Booking with {formatEcclesiasticalName(showDirectConfirmModal.priest_title || 'Fr.', showDirectConfirmModal.priest_name, showDirectConfirmModal.congregation_abbr)}</h3>
              <button className="modal-close" onClick={() => setShowDirectConfirmModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleConfirmDirectBooking}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Confirming this locks the slot, creates the booking record, and removes {formatEcclesiasticalName(showDirectConfirmModal.priest_title || 'Fr.', showDirectConfirmModal.priest_name, showDirectConfirmModal.congregation_abbr)} from the public roster for this date.
                </p>
                <div className="form-group">
                  <label className="form-label">SERVICE TYPE REQUIRED</label>
                  <div className="service-category-tabs">
                    <button
                      type="button"
                      className={`service-category-tab ${confirmServiceCategory === 'core' ? 'active' : ''}`}
                      onClick={() => {
                        setConfirmServiceCategory('core');
                        if (!CORE_SERVICES.includes(confirmServiceType)) {
                          setConfirmServiceType(CORE_SERVICES[0]);
                        }
                      }}
                    >
                      ⛪ Core Masses & Sacraments
                    </button>
                    <button
                      type="button"
                      className={`service-category-tab ${confirmServiceCategory === 'special' ? 'active' : ''}`}
                      onClick={() => {
                        setConfirmServiceCategory('special');
                        if (!SPECIAL_SERVICES.includes(confirmServiceType)) {
                          setConfirmServiceType(SPECIAL_SERVICES[0]);
                        }
                      }}
                    >
                      🌟 Special Events & Blessings
                    </button>
                  </div>
                  <select
                    className="form-input"
                    value={confirmServiceType}
                    onChange={(e) => setConfirmServiceType(e.target.value)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    {(confirmServiceCategory === 'core' ? CORE_SERVICES : SPECIAL_SERVICES).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                {confirmServiceType === 'Others' && (
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#2563EB' }}>SPECIFY OTHER MINISTRY / SACRAMENT *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Novena Preaching, School Mass, Vehicle Blessing"
                      value={confirmCustomServiceType}
                      onChange={(e) => setConfirmCustomServiceType(e.target.value)}
                      required
                    />
                  </div>
                )}
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

                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.76rem', color: '#92400E', lineHeight: '1.45', marginTop: '1rem' }}>
                  ⚠️ <strong>Platform Advisory:</strong> ArulApp facilitates availability discovery only and assumes no liability for celebrant commitments. Always directly speak or chat with Father on WhatsApp prior to confirming to ensure mutual agreement on timing and logistics.
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
                  <div className="service-category-tabs">
                    <button
                      type="button"
                      className={`service-category-tab ${bookingServiceCategory === 'core' ? 'active' : ''}`}
                      onClick={() => {
                        setBookingServiceCategory('core');
                        if (!CORE_SERVICES.includes(bookingServiceType)) {
                          setBookingServiceType(CORE_SERVICES[0]);
                        }
                      }}
                    >
                      ⛪ Core Masses & Sacraments
                    </button>
                    <button
                      type="button"
                      className={`service-category-tab ${bookingServiceCategory === 'special' ? 'active' : ''}`}
                      onClick={() => {
                        setBookingServiceCategory('special');
                        if (!SPECIAL_SERVICES.includes(bookingServiceType)) {
                          setBookingServiceType(SPECIAL_SERVICES[0]);
                        }
                      }}
                    >
                      🌟 Special Events & Blessings
                    </button>
                  </div>
                  <select
                    className="form-input"
                    value={bookingServiceType}
                    onChange={(e) => setBookingServiceType(e.target.value)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    {(bookingServiceCategory === 'core' ? CORE_SERVICES : SPECIAL_SERVICES).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                {bookingServiceType === 'Others' && (
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#2563EB' }}>SPECIFY OTHER MINISTRY / SACRAMENT *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Novena Preaching, School Mass, Vehicle Blessing, Flag Hoisting"
                      value={bookingCustomServiceType}
                      onChange={(e) => setBookingCustomServiceType(e.target.value)}
                      required
                    />
                  </div>
                )}
                {bookingServiceType === 'Substation Mass' && (
                  <div style={{ fontSize: '0.76rem', color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '0.45rem 0.65rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    🛵 <strong>Substation Note:</strong> Please specify the substation / village chapel name and distance from main parish in Venue Location below so Father is aware of travel.
                  </div>
                )}
                {bookingServiceType === 'Concelebration (Feasts & Events)' && (
                  <div style={{ fontSize: '0.76rem', color: '#6B21A8', background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '6px', padding: '0.45rem 0.65rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    🤝 <strong>Concelebration Note:</strong> Mention vestment/stole color or feast details in Notes so visiting Father can prepare accordingly.
                  </div>
                )}
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

                <div className="form-group">
                  <label className="form-label">ADDITIONAL NOTES / SPECIAL INSTRUCTIONS</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="e.g. Substation chapel landmark, vestment color, transport arrangements, intentions, or specific details for Father..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.75rem', color: '#64748B', lineHeight: '1.45', marginTop: '1rem' }}>
                  💡 <strong>Facilitation Note:</strong> ArulApp broadcasts this need to nearby priests. Once priests respond, connect directly via WhatsApp or phone call to verify arrangements.
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

      {/* --- MODAL 4: EDIT / MODIFY USER PROFILE & PHOTO --- */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>My Profile</span>
              </h3>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="modal-body">
                {/* Profile Photo Upload & Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <div className="avatar-lg" style={{ width: '96px', height: '96px', background: '#F8FAFC', color: '#1E293B', cursor: 'pointer' }}>
                    {editProfilePhoto ? (
                      <img src={editProfilePhoto} alt="Profile" />
                    ) : (
                      <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '-0.02em', color: '#0F172A' }}>
                        {(editTitle || (editClergyType === 'convent' ? 'Sr.' : 'Fr.')).replace('.', '')}
                      </span>
                    )}
                    <label
                      className="avatar-upload-overlay"
                      htmlFor="edit-photo-upload"
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '0.28rem 0'
                      }}
                      title="Upload from device or take photo with camera"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.02em' }}>Upload</span>
                    </label>
                    <input
                      id="edit-photo-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          compressImage(e.target.files[0], (base64) => setEditProfilePhoto(base64));
                        }
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.55rem', fontWeight: 500, letterSpacing: '0.01em' }}>
                    {editProfilePhoto ? 'Change your photo' : 'Upload your clerical photo'}
                  </span>
                  {editProfilePhoto && (
                    <div style={{ marginTop: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => setEditProfilePhoto(null)}
                        style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
                </div>

                {/* Name Input with Clickable Integrated Title Prefix */}
                <div className="form-group">
                  <label className="form-label">
                    <span>NAME *</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 'normal', marginLeft: '6px' }}>
                      (Tap title badge to change Fr. / Sr. / Br.)
                    </span>
                  </label>
                  <div className="input-prefix-group" style={{ cursor: 'text' }}>
                    <span
                      className="input-prefix-badge"
                      onClick={() => {
                        // Cycle through or open title picker
                        setShowTitlePickerModal(true);
                      }}
                      title="Tap to change clerical status (Fr. / Sr. / Br.)"
                      style={{ cursor: 'pointer', paddingRight: '0.45rem', userSelect: 'none', color: '#0F172A', fontWeight: 800 }}
                    >
                      {editTitle || 'Fr.'} <span style={{ fontSize: '0.72rem', color: '#64748B', marginLeft: '1px' }}>▾</span>
                    </span>
                    <input
                      type="text"
                      className="form-input-inline"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your name..."
                      required
                    />
                  </div>
                </div>

                {/* BRANCH 1: PRIEST (Fr.) - Diocesan vs Religious */}
                {editTitle === 'Fr.' && (
                  <div className="form-group">
                    <label className="form-label">ECCLESIASTICAL ROLE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className={`btn ${editClergyType === 'diocesan' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          setEditClergyType('diocesan');
                          setEditCongregationAbbr('');
                        }}
                        style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                      >
                        🏛️ Diocesan Priest
                      </button>
                      <button
                        type="button"
                        className={`btn ${editClergyType === 'religious' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setEditClergyType('religious')}
                        style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                      >
                        ⛪ Religious Priest
                      </button>
                    </div>
                  </div>
                )}

                {/* BRANCH 1A: Fr. Diocesan -> Diocese */}
                {editTitle === 'Fr.' && editClergyType === 'diocesan' && (
                  <div className="form-group">
                    <label className="form-label">DIOCESE / ARCHDIOCESE</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editDiocese}
                      onChange={(e) => setEditDiocese(e.target.value)}
                      placeholder="e.g. Archdiocese of Bangalore, Archdiocese of Madras-Mylapore"
                    />
                  </div>
                )}

                {/* BRANCH 1B: Fr. Religious -> Congregation + Abbreviation */}
                {editTitle === 'Fr.' && editClergyType === 'religious' && (
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label className="form-label">CONGREGATION NAME</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editOrder}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditOrder(val);
                          const autoAbbr = extractAbbr(val);
                          if (autoAbbr) setEditCongregationAbbr(autoAbbr);
                        }}
                        placeholder="e.g. Order of Friars Minor Capuchin"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">ABBREV. SUFFIX</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. OFM Cap"
                        value={editCongregationAbbr}
                        onChange={(e) => setEditCongregationAbbr(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* BRANCH 2: BROTHER (Br.) -> Congregation + Abbreviation */}
                {editTitle === 'Br.' && (
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label className="form-label">CONGREGATION NAME</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editOrder}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditOrder(val);
                          const autoAbbr = extractAbbr(val);
                          if (autoAbbr) setEditCongregationAbbr(autoAbbr);
                        }}
                        placeholder="e.g. Order of Friars Minor Capuchin, Montfort Brothers"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">ABBREV. SUFFIX</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. OFM Cap, SG"
                        value={editCongregationAbbr}
                        onChange={(e) => setEditCongregationAbbr(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* BRANCH 3: SISTER (Sr.) -> Congregation + Abbreviation */}
                {editTitle === 'Sr.' && (
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label className="form-label">CONGREGATION NAME</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editOrder}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditOrder(val);
                          const autoAbbr = extractAbbr(val);
                          if (autoAbbr) setEditCongregationAbbr(autoAbbr);
                        }}
                        placeholder="e.g. Congregation of the Immaculate Conception"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">ABBREV. SUFFIX</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. CIC, FMM"
                        value={editCongregationAbbr}
                        onChange={(e) => setEditCongregationAbbr(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Contact: Phone & Email */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">WHATSAPP MOBILE</label>
                    <div className="input-prefix-group">
                      <span className="input-prefix-badge" style={{ color: '#475569', fontWeight: 700 }}>+91</span>
                      <input
                        type="tel"
                        className="form-input-inline"
                        placeholder="98765 43210"
                        value={formatMobileDisplay(editMobile)}
                        onChange={(e) => setEditMobile(e.target.value)}
                        maxLength={11}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder={editTitle === 'Sr.' ? 'sister@gmail.com' : editTitle === 'Br.' ? 'brother@gmail.com' : 'father@gmail.com'}
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Residence Name & Locality */}
                <div className="form-group">
                  <label className="form-label">RESIDENCE / CONVENT NAME</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editResidenceName}
                    onChange={(e) => setEditResidenceName(e.target.value)}
                    placeholder="e.g. Gnanalaya, Child Jesus Convent"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>ADDRESS</span>
                    {editLatitude && (
                      <span style={{ color: '#166534', fontSize: '0.74rem', fontWeight: 600 }}>
                        ✓ GPS Pin Set
                      </span>
                    )}
                  </label>
                  <div className="input-action-group">
                    <input
                      type="text"
                      className="form-input"
                      value={editResidenceAddress}
                      onChange={(e) => setEditResidenceAddress(e.target.value)}
                      placeholder="e.g. Kilpauk, Chennai"
                    />
                    <button
                      type="button"
                      className={`input-action-btn ${editLatitude ? 'active' : ''}`}
                      onClick={() => handleDetectGPS('edit')}
                      disabled={gpsDetecting}
                      title={editLatitude ? "GPS Location Captured (Tap to update)" : "Get current GPS location"}
                      style={{ padding: '0.35rem' }}
                    >
                      {gpsDetecting ? (
                        <span style={{ fontSize: '0.9rem', animation: 'pulse 1s infinite' }}>⏳</span>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill={editLatitude ? "#DCFCE7" : "none"} stroke={editLatitude ? "#16A34A" : "#0F172A"} />
                          <circle cx="12" cy="10" r="3" stroke={editLatitude ? "#16A34A" : "#0F172A"} fill={editLatitude ? "#16A34A" : "none"} />
                          <ellipse cx="12" cy="22" rx="6" ry="1.5" stroke={editLatitude ? "#16A34A" : "#94A3B8"} strokeWidth="1.5" fill="none" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Postal PIN Code Field */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>POSTAL PIN CODE *</span>
                    {editPincode && editPincode.replace(/\D/g, '').length === 6 ? (
                      <span style={{ color: '#166534', fontSize: '0.74rem', fontWeight: 600 }}>
                        ✓ Valid 6-Digit PIN
                      </span>
                    ) : (
                      <span style={{ color: '#64748B', fontSize: '0.72rem' }}>
                        Required for ministry distance & location tracking
                      </span>
                    )}
                  </label>
                  <div className="input-prefix-group">
                    <span className="input-prefix-badge" style={{ color: '#475569', fontWeight: 700, fontSize: '0.8rem' }}>
                      PIN
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      className="form-input-inline"
                      placeholder="e.g. 560036, 600010, 682001"
                      value={editPincode}
                      onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                    />
                  </div>
                </div>

                {/* Location & Clerical Status Accuracy Advisory Note */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderLeft: '3.5px solid #2563EB', borderRadius: '8px', padding: '0.75rem 0.95rem', marginTop: '1.25rem', fontSize: '0.77rem', color: '#475569', lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1E40AF', marginBottom: '0.2rem' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>Important Profile Accuracy Notice</span>
                  </div>
                  <span>
                    Ministry suggestions, notifications, and celebration bookings are matched based on your <strong>clerical status</strong> and <strong>residence location</strong>. Please ensure this information is accurate so you receive relevant liturgical needs in your area.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setShowProfileModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? 'Saving Updates...' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ADMIN DIRECT ONBOARDING MODAL (ASSIST SISTERS & CLERGY) --- */}
      {showAdminOnboardModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-container" style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✨</span>
                <span>Direct Admin Onboarding</span>
              </h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAdminOnboardModal(false);
                  setAdminOnboardSuccess(null);
                }}
              >
                &times;
              </button>
            </div>

            {adminOnboardSuccess ? (
              <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '0.75rem' }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#0F172A', fontWeight: 800, marginBottom: '0.35rem' }}>
                  Account Created & Verified!
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#64748B', marginBottom: '1.25rem' }}>
                  <strong>{adminOnboardSuccess.user.title} {adminOnboardSuccess.user.name}</strong> is now live on BookaPriest.
                </p>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', textAlign: 'left', marginBottom: '1.25rem', fontSize: '0.84rem' }}>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <span style={{ color: '#64748B' }}>Login WhatsApp:</span>{' '}
                    <strong style={{ color: '#0F172A' }}>{adminOnboardSuccess.user.mobile}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Assigned Password:</span>{' '}
                    <strong style={{ color: '#0F172A' }}>{adminOnboardSuccess.initialPassword}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <a
                    href={adminOnboardSuccess.waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                    style={{
                      background: '#25D366',
                      color: '#FFFFFF',
                      padding: '0.85rem',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
                    }}
                  >
                    <span>💬</span>
                    <span>Send Login Details via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAdminOnboardModal(false);
                      setAdminOnboardSuccess(null);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminOnboardUser}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.78rem', color: '#1E40AF', lineHeight: '1.4' }}>
                    💡 <strong>Admin Convenience:</strong> This registers and immediately verifies the user. No queue approval required.
                  </div>

                  {/* Title Toggle: Sister / Priest / Brother */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">CLERICAL STATUS</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className={`btn ${onboardTitle === 'Sr.' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          setOnboardTitle('Sr.');
                          setOnboardClergyType('convent');
                        }}
                        style={{ fontSize: '0.82rem', padding: '0.55rem 0.4rem', fontWeight: 700 }}
                      >
                        🕊️ Sr. (Sister)
                      </button>
                      <button
                        type="button"
                        className={`btn ${onboardTitle === 'Fr.' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          setOnboardTitle('Fr.');
                          setOnboardClergyType('religious');
                        }}
                        style={{ fontSize: '0.82rem', padding: '0.55rem 0.4rem', fontWeight: 700 }}
                      >
                        ✝️ Fr. (Priest)
                      </button>
                      <button
                        type="button"
                        className={`btn ${onboardTitle === 'Br.' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          setOnboardTitle('Br.');
                          setOnboardClergyType('religious');
                        }}
                        style={{ fontSize: '0.82rem', padding: '0.55rem 0.4rem', fontWeight: 700 }}
                      >
                        🤝 Br. (Brother)
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">FULL NAME *</label>
                    <div className="input-prefix-group">
                      <span className="input-prefix-badge">{onboardTitle}</span>
                      <input
                        type="text"
                        className="form-input-inline"
                        placeholder="e.g. Maria Philomina, Antony Raj"
                        value={onboardName}
                        onChange={(e) => setOnboardName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* WhatsApp Mobile */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">WHATSAPP MOBILE NUMBER *</label>
                    <div className="input-prefix-group">
                      <span className="input-prefix-badge">+91</span>
                      <input
                        type="tel"
                        className="form-input-inline"
                        placeholder="98765 43210"
                        value={formatMobileDisplay(onboardMobile)}
                        onChange={(e) => setOnboardMobile(e.target.value)}
                        maxLength={11}
                        required
                      />
                    </div>
                  </div>

                  {/* Sister/Religious Congregation & Abbreviation */}
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                      <label className="form-label">
                        {onboardTitle === 'Sr.' ? 'CONGREGATION NAME' : 'CONGREGATION / ORDER'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={onboardTitle === 'Sr.' ? 'e.g. Sisters of St. Anne (SAT)' : 'e.g. Salesians of Don Bosco'}
                        value={onboardOrder}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOnboardOrder(val);
                          const autoAbbr = extractAbbr(val);
                          if (autoAbbr) setOnboardCongregationAbbr(autoAbbr);
                        }}
                        required={onboardTitle === 'Sr.'}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">LETTERS (SUFFIX)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. SAT, CIC, SJ"
                        value={onboardCongregationAbbr}
                        onChange={(e) => setOnboardCongregationAbbr(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Convent / Residence Name */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      {onboardTitle === 'Sr.' ? 'CONVENT NAME' : 'PARISH / RESIDENCE NAME'}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={onboardTitle === 'Sr.' ? 'e.g. St. Joseph’s Convent, Dindigul' : 'e.g. St. Anthony’s Church'}
                      value={onboardResidenceName}
                      onChange={(e) => setOnboardResidenceName(e.target.value)}
                    />
                  </div>

                  {/* Postal PIN Code & City */}
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                      <label className="form-label">STREET ADDRESS / TOWN</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. TC Palya Main Road, Bangalore"
                        value={onboardAddress}
                        onChange={(e) => setOnboardAddress(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">POSTAL PIN *</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="form-input"
                        placeholder="560036"
                        value={onboardPincode}
                        onChange={(e) => setOnboardPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                      />
                    </div>
                  </div>

                  {/* Assigned Password */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">ASSIGNED LOGIN PASSWORD</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Jesus@123"
                      value={onboardPassword}
                      onChange={(e) => setOnboardPassword(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '0.2rem' }}>
                      Default is <strong>Jesus@123</strong>. Sister can change it later.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                      onClick={() => setShowAdminOnboardModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1, background: '#16A34A', borderColor: '#15803D' }}
                      disabled={formSubmitting}
                    >
                      {formSubmitting ? 'Registering...' : '✓ Create & Verify Account'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MONTHLY BOOKING & MINISTRY CALENDAR MODAL */}
      {showCalendarModal && (
        <div className="modal-overlay" onClick={() => setShowCalendarModal(false)}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', width: '94%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800 }}>
                    Monthly Ministry Calendar
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    View scheduled celebrations, mass times & commitments at a glance
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowCalendarModal(false)}
                title="Close calendar"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: '1.25rem 1.4rem' }}>
              {(() => {
                const { monthName, days, year, month } = getCalendarDays(calMonthOffset);
                
                // Group user's confirmed bookings by YYYY-MM-DD
                const bookingsByDate = {};
                bookings.forEach((b) => {
                  if ((b.status === 'accepted' || b.status === 'completed') && (b.responder_id === user.id || b.requester_id === user.id)) {
                    if (b.datetime) {
                      const dStr = b.datetime.split('T')[0];
                      if (!bookingsByDate[dStr]) bookingsByDate[dStr] = [];
                      bookingsByDate[dStr].push(b);
                    }
                  }
                });

                // Filter selected date's bookings
                const selectedDayBookings = calendarSelectedDate ? (bookingsByDate[calendarSelectedDate] || []) : [];
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                return (
                  <div>
                    {/* Month Navigator Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', background: '#FFFFFF', padding: '0.4rem 0.5rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <button
                        type="button"
                        onClick={() => setCalMonthOffset(prev => prev - 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.75rem', fontWeight: 700 }}
                      >
                        ◀ Prev
                      </button>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', fontFamily: 'Outfit' }}>
                          {monthName}
                        </div>
                        {calMonthOffset !== 0 && (
                          <button
                            type="button"
                            onClick={() => setCalMonthOffset(0)}
                            style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                          >
                            Jump to Current Month
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setCalMonthOffset(prev => prev + 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.75rem', fontWeight: 700 }}
                      >
                        Next ▶
                      </button>
                    </div>

                    {/* Day-of-week headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px', textAlign: 'center' }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dw, idx) => (
                        <div key={dw} style={{ fontSize: '0.74rem', fontWeight: 700, color: idx === 0 ? '#DC2626' : '#64748B', padding: '4px 0' }}>
                          {dw}
                        </div>
                      ))}
                    </div>

                    {/* Month Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '1.25rem' }}>
                      {days.map((item, idx) => {
                        if (!item) {
                          return <div key={`empty-${idx}`} style={{ minHeight: '52px', background: '#F8FAFC', borderRadius: '8px', opacity: 0.4 }}></div>;
                        }

                        const dayBookings = bookingsByDate[item.dateStr] || [];
                        const isToday = item.dateStr === todayStr;
                        const isSelected = item.dateStr === calendarSelectedDate;
                        const hasBookings = dayBookings.length > 0;

                        return (
                          <button
                            key={item.dateStr}
                            type="button"
                            onClick={() => setCalendarSelectedDate(item.dateStr)}
                            style={{
                              minHeight: '56px',
                              padding: '4px',
                              borderRadius: '8px',
                              border: isSelected
                                ? '2px solid #2563EB'
                                : isToday
                                ? '2px solid #F59E0B'
                                : hasBookings
                                ? '1.5px solid #BBF7D0'
                                : '1px solid #E2E8F0',
                              background: isSelected
                                ? '#EFF6FF'
                                : hasBookings
                                ? '#F0FDF4'
                                : isToday
                                ? '#FEFCE8'
                                : '#FFFFFF',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: isToday || isSelected || hasBookings ? 800 : 600,
                                color: isToday ? '#B45309' : isSelected ? '#1D4ED8' : '#0F172A'
                              }}
                            >
                              {item.day}
                            </span>

                            {/* Booking dot markers */}
                            {hasBookings && (
                              <div style={{ display: 'flex', gap: '3px', marginTop: '3px', alignItems: 'center' }}>
                                <span
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#16A34A'
                                  }}
                                  title={`${dayBookings.length} celebration(s)`}
                                />
                                {dayBookings.length > 1 && (
                                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#166534' }}>
                                    {dayBookings.length}
                                  </span>
                                )}
                              </div>
                            )}

                            {isToday && (
                              <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', marginTop: 'auto' }}>
                                Today
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Day Agenda View */}
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem 1.15rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem' }}>📅</span>
                          <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>
                            {calendarSelectedDate ? (() => {
                              const [y, m, d] = calendarSelectedDate.split('-');
                              const selObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                              return selObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                            })() : 'Select a date'}
                          </strong>
                          {calendarSelectedDate === todayStr && (
                            <span className="urgency-pill urgency-today" style={{ fontSize: '0.65rem' }}>
                              <span className="urgency-pulse-dot"></span> Today
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700 }}>
                          {selectedDayBookings.length} Celebration{selectedDayBookings.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      {selectedDayBookings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem', color: '#94A3B8' }}>
                          <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: '0.2rem' }}>🕊️</span>
                          <span style={{ fontSize: '0.82rem' }}>No confirmed celebrations scheduled for this date.</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {selectedDayBookings.map((b) => {
                            const { time } = formatDateTime(b.datetime, b.datetime_end);
                            const isConfirmedPriest = b.responder_id === user.id;
                            const partnerName = formatEcclesiasticalName(
                              isConfirmedPriest ? b.requester_title || 'Sr.' : b.responder_title || 'Fr.',
                              isConfirmedPriest ? b.requester_name : b.responder_name,
                              isConfirmedPriest ? b.requester_congregation_abbr : b.responder_congregation_abbr
                            );
                            const partnerMobile = isConfirmedPriest ? b.requester_mobile : b.responder_mobile;

                            return (
                              <div
                                key={b.id}
                                style={{
                                  background: '#FFFFFF',
                                  border: '1px solid #BBF7D0',
                                  borderLeft: '4px solid #16A34A',
                                  borderRadius: '8px',
                                  padding: '0.75rem 0.9rem',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  flexWrap: 'wrap'
                                }}
                              >
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.2rem' }}>
                                    <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>
                                      {b.service_type || 'Holy Mass'}
                                    </strong>
                                    <span style={{ fontSize: '0.72rem', color: '#166534', background: '#DCFCE7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                      Confirmed
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#0284C7', fontWeight: 700, marginBottom: '0.2rem' }}>
                                    ⏰ {time}
                                  </div>
                                  <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                                    📍 {b.location || 'Parish Chapel'} • With {partnerName}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  {partnerMobile && (
                                    <a
                                      href={`tel:${partnerMobile}`}
                                      className="btn btn-call btn-sm"
                                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.74rem', fontWeight: 700 }}
                                    >
                                      📞 Call
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowCalendarModal(false);
                                      setRequestsTab('accepted');
                                    }}
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.74rem', fontWeight: 700 }}
                                  >
                                    View Card ↗
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      {/* --- INSTANT CLERICAL STATUS SELECTION LAYER PROMPT --- */}
      {showTitlePickerModal && (
        <div
          className="modal-overlay"
          style={{ zIndex: 99999 }}
          onClick={() => setShowTitlePickerModal(false)}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '440px',
              padding: '2rem 1.75rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '2px solid var(--papal-gold)',
              background: '#FFFFFF',
              position: 'relative'
            }}
          >
            {/* Top-Right Dismissal Button */}
            <button
              type="button"
              onClick={() => setShowTitlePickerModal(false)}
              title="Close"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                color: '#64748B',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ✕
            </button>

            {/* Catholic Church Header Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F8FAFC', border: '1.5px solid var(--papal-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  {/* Cross at Steeple */}
                  <line x1="12" y1="2" x2="12" y2="6" stroke="var(--papal-gold)" strokeWidth="2" />
                  <line x1="10" y1="3.5" x2="14" y2="3.5" stroke="var(--papal-gold)" strokeWidth="2" />
                  {/* Steeple roof */}
                  <path d="M12 6 L7 11 L17 11 Z" fill="#E2E8F0" />
                  {/* Church Body */}
                  <rect x="6" y="11" width="12" height="11" rx="1" />
                  {/* Arched Doorway */}
                  <path d="M10 22 V16 C10 14.9 10.9 14 12 14 C13.1 14 14 14.9 14 16 V22" fill="#0F172A" />
                </svg>
              </div>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
              Choose Your Clerical Status
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.4', marginBottom: '1.25rem' }}>
              Select your title to continue.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {/* 1. PRIEST (Fr.): Traced from Reference - Priest with Hair, Ears, Face, Roman Collar, and Cassock */}
              <button
                type="button"
                className={`clerical-status-btn ${(showProfileModal ? editTitle : regTitle) === 'Fr.' ? 'selected' : ''}`}
                onClick={() => {
                  setRegTitle('Fr.');
                  setEditTitle('Fr.');
                  if (regClergyType === 'convent') setRegClergyType('religious');
                  if (editClergyType === 'convent') setEditClergyType('religious');
                  setShowTitlePickerModal(false);
                }}
              >
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 18 C18 24 30 24 30 18" />
                  <path d="M18 16.5 C16 16.5 16 19 18 19.5" />
                  <path d="M30 16.5 C32 16.5 32 19 30 19.5" />
                  <path d="M18 16 C16.5 13 18 8 24 8 C30 8 31.5 13 30 16" />
                  <path d="M18 12.5 C20 13.5 22 13 24 12 C26 13 28 13.5 30 12.5" />
                  <path d="M20 23.5 L19.5 26.5 C19.5 28 28.5 28 28.5 26.5 L28 23.5" />
                  <rect x="22.2" y="24" width="3.6" height="3" rx="0.5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M19.5 26.5 C15 27 10 30 10 37" />
                  <path d="M28.5 26.5 C33 27 38 30 38 37" />
                  <line x1="24" y1="27.5" x2="24" y2="37" />
                </svg>
                <span>Fr. (Priest)</span>
              </button>

              {/* 2. SISTER (Sr.): Traced from Reference - Traditional Habit with Veil framing face & flowing wimple */}
              <button
                type="button"
                className={`clerical-status-btn ${(showProfileModal ? editTitle : regTitle) === 'Sr.' ? 'selected' : ''}`}
                onClick={() => {
                  setRegTitle('Sr.');
                  setEditTitle('Sr.');
                  setRegClergyType('convent');
                  setEditClergyType('convent');
                  setShowTitlePickerModal(false);
                }}
              >
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="24" cy="22.5" rx="4.8" ry="6" />
                  <path d="M19.2 18 C21 16.8 27 16.8 28.8 18" />
                  <path d="M17.5 19 C18 14 20.5 13 24 13 C27.5 13 30 14 30.5 19" />
                  <path d="M24 7.5 C16.5 7.5 14 13 14 23 C14 30 10 37 10 40 L16 38 C16.5 35 17.5 31 18.5 29" />
                  <path d="M24 7.5 C31.5 7.5 34 13 34 23 C34 30 38 37 38 40 L32 38 C31.5 35 30.5 31 29.5 29" />
                  <path d="M19 28 C21 31.5 27 31.5 29 28" />
                  <path d="M18.5 34 C21.5 36.5 26.5 36.5 29.5 34" />
                </svg>
                <span>Sr. (Sister)</span>
              </button>

              {/* 3. BROTHER (Br.): Traced from Reference - Monk/Friar with Hooded Cowl & Scapular */}
              <button
                type="button"
                className={`clerical-status-btn ${(showProfileModal ? editTitle : regTitle) === 'Br.' ? 'selected' : ''}`}
                onClick={() => {
                  setRegTitle('Br.');
                  setEditTitle('Br.');
                  setRegClergyType('religious');
                  setEditClergyType('religious');
                  setShowTitlePickerModal(false);
                }}
              >
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="24" cy="22" rx="4.8" ry="5.8" />
                  <path d="M20 18.5 C21.5 17.5 26.5 17.5 28 18.5" />
                  <path d="M24 8 C16 8 15 15 15 23 C15 26 16.5 28 19 29.5" />
                  <path d="M24 8 C32 8 33 15 33 23 C33 26 31.5 28 29 29.5" />
                  <path d="M19 29.5 C21 31 27 31 29 29.5" />
                  <path d="M18 31 C15 32 10 34 10 39" />
                  <path d="M30 31 C33 32 38 34 38 39" />
                  <path d="M14 36 C18 38 30 38 34 36" />
                </svg>
                <span>Br. (Brother)</span>
              </button>
            </div>

            <button
              type="button"
              className="btn btn-link"
              onClick={() => setShowTitlePickerModal(false)}
              style={{ fontSize: '0.82rem', color: '#94A3B8', textDecoration: 'none', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
