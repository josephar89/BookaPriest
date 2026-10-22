import BookAPriestLogo from './components/BookAPriestLogo';
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
  const [usePasswordLogin, setUsePasswordLogin] = useState(false); // Default to WhatsApp 1-Tap Login

  // WhatsApp Route 3 Instant Verification States
  const [waAuthModal, setWaAuthModal] = useState(null); // { code, waLink, mobile, isExistingUser, messageText, mode }
  const [waAuthPolling, setWaAuthPolling] = useState(false);
  const [waVerifiedSuccess, setWaVerifiedSuccess] = useState(false);
  const [regWaVerifiedCode, setRegWaVerifiedCode] = useState(null); // stores code when phone verified for new registration
  const [resetPasswordModal, setResetPasswordModal] = useState(null); // { code, mobile, newPassword }

  // Register Form States (Diocesan & Religious Clergy)
  const [regTitle, setRegTitle] = useState(''); // mandatory choice: 'Fr.' or 'Sr.'
  const [regName, setRegName] = useState('');
  const [regCongregationAbbr, setRegCongregationAbbr] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDob, setRegDob] = useState(''); // mandatory Date of Birth: YYYY-MM-DD
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
  const [regAgreed, setRegAgreed] = useState(false);

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
  const [requestsTab, setRequestsTab] = useState('open'); // 'open' (Explore) vs 'my_requests' vs 'accepted' (Confirmed) vs 'history'
  const [confirmedRoleFilter, setConfirmedRoleFilter] = useState('all'); // 'all', 'serving' (I am celebrant/minister), 'request' (I posted the request)
  const [historyRoleFilter, setHistoryRoleFilter] = useState('all'); // 'all', 'serving' (celebrated by me), 'request' (requested by me)
  const [priestFilterRadius, setPriestFilterRadius] = useState(25); // 25 km default, up to 100 or 'all' km
  const [priestSortBy, setPriestSortBy] = useState('smart_match'); // 'smart_match' (intelligent explore score), 'date_asc', 'distance_asc', 'recent_posted', 'date_desc'
  const [priestSortOrder, setPriestSortOrder] = useState('asc'); // 'asc' (normal) vs 'desc' (reversed)
  const [priestFilterService, setPriestFilterService] = useState('all'); // 'all', 'mass', 'recollection', 'feast', etc.
  const [priestFilterLanguage, setPriestFilterLanguage] = useState('all'); // 'all', 'Tamil', 'English', etc.
  const [showPriestFilterDrawer, setShowPriestFilterDrawer] = useState(false);
  const [myUnavailableSlots, setMyUnavailableSlots] = useState([]);
  const [calMonthOffset, setCalMonthOffset] = useState(0); // 0 = current month, 1 = next month, etc.

  // Modals & Feedback
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null); // booking object when editing an existing post
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showDirectConfirmModal, setShowDirectConfirmModal] = useState(null); // selected priest object
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false); // Favorite Ministers Modal
  const [showNotificationsModal, setShowNotificationsModal] = useState(false); // Notifications & Timeline modal
  const [showCalendarModal, setShowCalendarModal] = useState(false); // Monthly Booking Calendar Modal
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(null); // Selected date string 'YYYY-MM-DD'
  const [viewMinisterModal, setViewMinisterModal] = useState(null); // Detailed view for applicant priest / sister
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
  const [editDob, setEditDob] = useState(''); // mandatory Date of Birth: YYYY-MM-DD
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
  const [editTransportModes, setEditTransportModes] = useState(['own_bike']);
  const [editLiturgicalLanguages, setEditLiturgicalLanguages] = useState(['English', 'Tamil']);
  const [editProfilePhoto, setEditProfilePhoto] = useState(null);
  const [editAboutMe, setEditAboutMe] = useState('');
  const [editYoutube, setEditYoutube] = useState('');
  const [editFacebook, setEditFacebook] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [showEditSocialLinks, setShowEditSocialLinks] = useState(false);
  const [regProfilePhoto, setRegProfilePhoto] = useState(null);

  // Photo Crop & Zoom Modal States
  const [cropperModal, setCropperModal] = useState(null); // { rawImage, target: 'edit' | 'reg' }
  const [cropZoom, setCropZoom] = useState(1); // 1 to 3x
  const [cropPan, setCropPan] = useState({ x: 0, y: 0 }); // offset in px
  const [cropDragging, setCropDragging] = useState(false);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });

  // Direct Admin Onboarding Form States
  const [onboardTitle, setOnboardTitle] = useState('Sr.');
  const [onboardName, setOnboardName] = useState('');
  const [onboardCongregationAbbr, setOnboardCongregationAbbr] = useState('');
  const [onboardMobile, setOnboardMobile] = useState('');
  const [onboardDob, setOnboardDob] = useState('');
  const [onboardOrder, setOnboardOrder] = useState('');
  const [onboardDiocese, setOnboardDiocese] = useState('');
  const [onboardClergyType, setOnboardClergyType] = useState('convent');
  const [onboardResidenceName, setOnboardResidenceName] = useState('');
  const [onboardAddress, setOnboardAddress] = useState('');
  const [onboardPincode, setOnboardPincode] = useState('');
  const [onboardPassword, setOnboardPassword] = useState('Jesus@123');

  // Available travel / transport options ministers can select
  const TRANSPORT_OPTIONS = [
    { id: 'flight', label: 'Flight', icon: '✈️' },
    { id: 'train', label: 'Train', icon: '🚆' },
    { id: 'bus', label: 'Bus', icon: '🚌' },
    { id: 'taxi', label: 'Taxi', icon: '🚕' },
    { id: 'auto', label: 'Auto', icon: '🛺' },
    { id: 'bike_taxi', label: 'Bike Taxi', icon: '🛵' },
    { id: 'own_bike', label: 'Own bike', icon: '🏍️' },
    { id: 'own_car', label: 'Own car', icon: '🚗' },
    { id: 'pickup', label: 'Need to arrange a pick up', icon: '🤝' }
  ];

  // Helper to extract abbreviation from congregation string like "Salesians of Don Bosco (SDB)" -> "SDB"
  const extractAbbr = (str) => {
    if (!str) return '';
    const match = str.match(/\(([^)]+)\)/);
    return match ? match[1].trim() : '';
  };

  // Helper to render standard Male / Female generic silhouette icon when no photo is uploaded
  const renderDefaultAvatar = (title, clergyType, size = 38) => {
    const isFemale = title === 'Sr.' || clergyType === 'convent' || clergyType === 'convent_sister';
    if (isFemale) {
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Sister Avatar">
          <circle cx="24" cy="24" r="24" fill="#FCE7F3" />
          <circle cx="24" cy="17" r="7.5" fill="#DB2777" />
          <path d="M11 39c0-7.18 5.82-13 13-13s13 5.82 13 13" fill="#BE185D" />
          {/* Sister Veil contour */}
          <path d="M16.5 12c0-4.5 3.5-7 7.5-7s7.5 2.5 7.5 7c0 4-1.5 9-2.5 11h-10c-1-2-2.5-7-2.5-11z" fill="#9D174D" opacity="0.85" />
          <circle cx="24" cy="16.5" r="5" fill="#FDF2F8" />
        </svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Priest Avatar">
        <circle cx="24" cy="24" r="24" fill="#E2E8F0" />
        <circle cx="24" cy="17" r="7.5" fill="#334155" />
        <path d="M11 39c0-7.18 5.82-13 13-13s13 5.82 13 13" fill="#1E293B" />
        {/* Roman Clerical Collar notch */}
        <rect x="22" y="26" width="4" height="3" rx="0.5" fill="#FFFFFF" />
      </svg>
    );
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

  // Helper to calculate age from YYYY-MM-DD date of birth
  const calculateAge = (dob) => {
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

  // Generate cropped and zoomed square avatar (320x320 px)
  const handleApplyCroppedImage = () => {
    if (!cropperModal || !cropperModal.rawImage) return;
    const img = new Image();
    img.onload = () => {
      const outputCanvas = document.createElement('canvas');
      const size = 320;
      outputCanvas.width = size;
      outputCanvas.height = size;
      const ctx = outputCanvas.getContext('2d');

      // The preview container is 240x240 px circle
      const previewSize = 240;
      const baseScale = Math.max(previewSize / img.width, previewSize / img.height);
      const totalScale = baseScale * cropZoom;
      const drawnW = img.width * totalScale;
      const drawnH = img.height * totalScale;

      // Position relative to preview center, then scaled to 320x320 output
      const scaleToOutput = size / previewSize;
      const centerX = previewSize / 2 + cropPan.x;
      const centerY = previewSize / 2 + cropPan.y;

      const destX = (centerX - drawnW / 2) * scaleToOutput;
      const destY = (centerY - drawnH / 2) * scaleToOutput;
      const destW = drawnW * scaleToOutput;
      const destH = drawnH * scaleToOutput;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, destX, destY, destW, destH);

      const croppedBase64 = outputCanvas.toDataURL('image/jpeg', 0.88);
      if (cropperModal.target === 'edit') {
        setEditProfilePhoto(croppedBase64);
      } else if (cropperModal.target === 'reg') {
        setRegProfilePhoto(croppedBase64);
      }
      setCropperModal(null);
    };
    img.src = cropperModal.rawImage;
  };

  // New Mass Request Form Fields
  const [bookingLocation, setBookingLocation] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingEndDate, setBookingEndDate] = useState('');
  const [bookingTimeStart, setBookingTimeStart] = useState('06:30');
  const [bookingTimeEnd, setBookingTimeEnd] = useState('07:30');
  const [bookingLanguage, setBookingLanguage] = useState('Tamil');
  const [bookingHonorarium, setBookingHonorarium] = useState('');
  const [bookingServiceType, setBookingServiceType] = useState('Holy Mass');
  const [bookingServiceCategory, setBookingServiceCategory] = useState('sacraments'); // 'sacraments', 'paraliturgy', 'pastoral'
  const [bookingCustomServiceType, setBookingCustomServiceType] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLatitude, setBookingLatitude] = useState(null);
  const [bookingLongitude, setBookingLongitude] = useState(null);

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
  const [confirmServiceCategory, setConfirmServiceCategory] = useState('sacraments');
  const [confirmCustomServiceType, setConfirmCustomServiceType] = useState('');

  // Category A: Mass & Sacraments
  const MASS_SACRAMENTS = [
    'Holy Mass',
    'Concelebration',
    'Marriage Mass',
    'Funeral / Requiem Mass',
    'Confession Ministry',
    'Anointing of the Sick',
    'Others'
  ];

  // Category B: Paraliturgy & Blessings
  const PARALITURGY_BLESSINGS = [
    'Adoration Service',
    'Charismatic Prayer Service',
    'House Blessing',
    'Monthly Recollection Talk',
    'Retreat for Religious',
    'Retreat for Lay Faithful',
    'Others'
  ];

  // Category C: Pastoral Ministries (Sisters can also receive & volunteer for these)
  const PASTORAL_MINISTRIES = [
    'Catechism',
    'Altar Decoration',
    'BCC / Anbiam Animation',
    'House Visit',
    'Communion to Sick',
    'Choir Animation',
    'Others'
  ];

  const SERVICE_TYPES = Array.from(new Set([...MASS_SACRAMENTS, ...PARALITURGY_BLESSINGS, ...PASTORAL_MINISTRIES]));

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
        // If user is admin, directly open the Admin Dashboard
        if (parsed.is_admin === 1) {
          setActiveMode('admin');
        } else {
          setActiveMode('broadcast');
        }

        // Default landing tab:
        // Sisters and Diocesan Priests: start on 'my_requests'
        // Religious Priests: start on 'open' (Explore)
        const isRequesterFirst = (parsed.title === 'Sr.' || parsed.clergy_type === 'convent' || parsed.clergy_type === 'convent_sister') ||
                                 (parsed.title === 'Fr.' && parsed.clergy_type === 'diocesan');
        if (isRequesterFirst) {
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

      // 3. Fetch Admin Queue & Admin Suite Data if Admin
      if (u.is_admin === 1) {
        const resPending = await fetch('/api/users/pending', { headers: getHeaders(u) });
        if (resPending.ok) {
          setPendingUsers(await resPending.json());
        }
        fetchAdminData();
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
        } else if (target === 'booking') {
          setBookingLatitude(lat);
          setBookingLongitude(lon);
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
              addr.amenity || addr.building || addr.suburb || addr.neighbourhood || addr.residential || addr.road || '',
              addr.city || addr.town || addr.village || addr.city_district || addr.county || '',
              addr.state ? addr.state : '',
              addr.postcode ? `- ${addr.postcode}` : ''
            ].filter(Boolean);

            const readableAddress = localityParts.length > 0 ? localityParts.join(', ').replace(', -', ' -') : (geoData.display_name || '');
            if (readableAddress) {
              if (target === 'edit') {
                setEditResidenceAddress(readableAddress);
              } else if (target === 'booking') {
                setBookingLocation(readableAddress);
              } else {
                setRegResidenceAddress(readableAddress);
              }
            }

            // Extract PIN code from postcode or address or full display_name
            let detectedPin = '';
            if (addr.postcode) {
              const matched = String(addr.postcode).match(/\b\d{6}\b/);
              if (matched) detectedPin = matched[0];
            }
            if (!detectedPin && geoData.display_name) {
              const matched = geoData.display_name.match(/\b\d{6}\b/);
              if (matched) detectedPin = matched[0];
            }

            // Fallback: query Nominatim with zoom 14 if postcode wasn't returned at zoom 18
            if (!detectedPin) {
              try {
                const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`, {
                  headers: { 'Accept-Language': 'en' }
                });
                if (fallbackRes.ok) {
                  const fallbackData = await fallbackRes.json();
                  const fbPostcode = fallbackData.address?.postcode;
                  if (fbPostcode) {
                    const matched = String(fbPostcode).match(/\b\d{6}\b/);
                    if (matched) detectedPin = matched[0];
                  }
                  if (!detectedPin && fallbackData.display_name) {
                    const matched = fallbackData.display_name.match(/\b\d{6}\b/);
                    if (matched) detectedPin = matched[0];
                  }
                }
              } catch (e) {
                // Ignore fallback error
              }
            }

            // Automatically fill the Postal PIN code field
            if (detectedPin && detectedPin.length === 6) {
              if (target === 'edit') {
                setEditPincode(detectedPin);
              } else {
                setRegPincode(detectedPin);
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

  // --- WhatsApp Route 3 Instant Authentication Handlers ---
  const handleRequestWhatsAppAuth = async (mobileToVerify, mode = 'login') => {
    if (!mobileToVerify || mobileToVerify.replace(/\D/g, '').length < 10) {
      showFeedback('error', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/auth/wa-request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobileToVerify })
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback('error', data.error || 'Failed to initialize WhatsApp verification.');
        return;
      }

      setWaAuthModal({
        ...data,
        mode // 'login' or 'register'
      });
      setWaAuthPolling(true);

      // Immediately trigger WhatsApp OS intent so Android prompts the app chooser (Dual WhatsApp / Business / Default)
      const helplineClean = (data.helpline || '33759857131').replace(/\D/g, '');
      const encodedMsg = encodeURIComponent(data.messageText || `Praise be Jesus! Verify my BookaPriest account: #${data.code}`);
      const waIntentUrl = `whatsapp://send?phone=${helplineClean}&text=${encodedMsg}`;

      // Open WhatsApp directly via hidden trigger
      const link = document.createElement('a');
      link.href = waIntentUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
      }, 500);
    } catch (err) {
      showFeedback('error', 'Network error requesting WhatsApp verification.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Poll for WhatsApp verification confirmation while modal is open
  useEffect(() => {
    let timer = null;
    if (waAuthModal && waAuthPolling) {
      timer = setInterval(async () => {
        try {
          const res = await fetch(`/api/auth/wa-check-status/${waAuthModal.code}`);
          const data = await res.json();
          if (data && data.verified) {
            clearInterval(timer);
            setWaAuthPolling(false);
            setWaVerifiedSuccess(true);

            if (waAuthModal.mode === 'reset_password') {
              // WhatsApp verified for password reset! Open Set New Password dialog
              setTimeout(() => {
                setResetPasswordModal({ code: waAuthModal.code, mobile: data.mobile, newPassword: '' });
                setWaAuthModal(null);
                setWaVerifiedSuccess(false);
                showFeedback('success', '✓ WhatsApp identity verified! You can now choose a new password.');
              }, 1200);
            } else if (waAuthModal.mode === 'login' && data.user) {
              // Direct Instant Login
              setTimeout(() => {
                localStorage.setItem('bookapriest_user', JSON.stringify(data.user));
                setUser(data.user);
                if (data.user.is_admin === 1) {
                  setActiveMode('admin');
                } else {
                  setActiveMode('broadcast');
                  const isRequesterFirst = (data.user.title === 'Sr.' || data.user.clergy_type === 'convent' || data.user.clergy_type === 'convent_sister') ||
                                           (data.user.title === 'Fr.' && data.user.clergy_type === 'diocesan');
                  setRequestsTab(isRequesterFirst ? 'my_requests' : 'open');
                }
                setWaAuthModal(null);
                setWaVerifiedSuccess(false);
                showFeedback('success', `✓ Verified via WhatsApp! Welcome, ${data.user.title || ''} ${data.user.name}.`);
                loadDashboardData(data.user);
              }, 1200);
            } else if (waAuthModal.mode === 'register' || !data.isExistingUser) {
              // Registered phone verified! Proceed to filling details
              setTimeout(() => {
                setRegWaVerifiedCode(waAuthModal.code);
                setRegMobile(data.mobile);
                setAuthMode('register');
                setWaAuthModal(null);
                setWaVerifiedSuccess(false);
                if (data.hasMismatch) {
                  showFeedback('success', `✓ WhatsApp verified using ${data.mobile}! Please complete your clerical profile details.`);
                } else {
                  showFeedback('success', '✓ WhatsApp number verified! Please complete your clerical profile details.');
                }
              }, 1200);
            }
          }
        } catch (e) {
          // Keep polling
        }
      }, 1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [waAuthModal, waAuthPolling]);

  // Simulate/Test WhatsApp message reception directly
  const handleSimulateWhatsAppConfirm = async (code) => {
    try {
      const res = await fetch('/api/auth/wa-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', '✓ WhatsApp simulated message received!');
      } else {
        showFeedback('error', data.error || 'Failed to simulate confirmation.');
      }
    } catch (e) {
      showFeedback('error', 'Error simulating confirmation.');
    }
  };

  // Submit password reset with verified WhatsApp code
  const handleResetPasswordWa = async (e) => {
    e.preventDefault();
    if (!resetPasswordModal || !resetPasswordModal.newPassword) {
      showFeedback('error', 'Please enter a new password.');
      return;
    }
    if (resetPasswordModal.newPassword.length < 6) {
      showFeedback('error', 'Password must be at least 6 characters.');
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: resetPasswordModal.code,
          newPassword: resetPasswordModal.newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showFeedback('error', data.error || 'Failed to reset password.');
      } else {
        showFeedback('success', '✓ Password reset successfully! Please sign in with your new password.');
        setLoginIdentifier(resetPasswordModal.mobile || '');
        setLoginPassword(resetPasswordModal.newPassword);
        setUsePasswordLogin(true);
        setResetPasswordModal(null);
      }
    } catch (err) {
      showFeedback('error', 'Network error resetting password.');
    } finally {
      setFormSubmitting(false);
    }
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
        const isRequesterFirst = (data.user.title === 'Sr.' || data.user.clergy_type === 'convent' || data.user.clergy_type === 'convent_sister') ||
                                 (data.user.title === 'Fr.' && data.user.clergy_type === 'diocesan');
        if (isRequesterFirst) {
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
      showFeedback('error', 'Please choose your clerical status (Fr. or Sr.).');
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
      // Sr. (Sister)
      if (!regOrder.trim()) {
        showFeedback('error', 'Please enter your Congregation Name.');
        return;
      }
    }
    if (!regMobile || regMobile.replace(/\D/g, '').length < 10) {
      showFeedback('error', 'Valid 10-digit WhatsApp Mobile number is required.');
      return;
    }
    if (!regWaVerifiedCode) {
      showFeedback('error', 'Please verify your WhatsApp mobile number first before submitting registration.');
      handleRequestWhatsAppAuth(regMobile, 'register');
      return;
    }
    const cleanPin = regPincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      showFeedback('error', 'A valid 6-digit Postal PIN Code is required for parish/convent proximity.');
      return;
    }
    if (!regDob) {
      showFeedback('error', 'Date of Birth is required.');
      return;
    }
    const regAge = calculateAge(regDob);
    if (regAge === null || regAge < 18 || regAge > 110) {
      showFeedback('error', 'Please provide a valid Date of Birth (must be at least 18 years of age).');
      return;
    }
    if (!regPassword) {
      showFeedback('error', 'Password is required.');
      return;
    }
    if (!regAgreed) {
      showFeedback('error', 'Please confirm that you have read and agreed to the Privacy & Authenticity policy.');
      return;
    }
    setFormSubmitting(true);
    try {
      // Ensure pin code is incorporated into canonical address
      const fullAddressWithPin = regResidenceAddress.includes(cleanPin)
        ? regResidenceAddress
        : (regResidenceAddress ? `${regResidenceAddress} - ${cleanPin}` : `PIN: ${cleanPin}`);

      const targetEndpoint = regWaVerifiedCode ? '/api/auth/register-wa-verified' : '/api/auth/register';

      const res = await fetch(targetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: regWaVerifiedCode,
          title: regTitle,
          name: regName.trim(),
          congregation_abbr: (regTitle === 'Fr.' && regClergyType === 'diocesan') ? '' : regCongregationAbbr.trim(),
          mobile: getCanonicalMobile(regMobile),
          email: regEmail,
          dob: regDob,
          password: regPassword || 'wa_verified_login',
          clergy_type: regTitle === 'Fr.' ? regClergyType : 'convent',
          religious_order: (regTitle === 'Fr.' && regClergyType === 'diocesan') ? null : regOrder,
          diocese_province: (regTitle === 'Fr.' && regClergyType === 'diocesan') ? regDiocese : '',
          residence_name: regResidenceName,
          residence_address: fullAddressWithPin,
          pincode: cleanPin,
          latitude: regLatitude,
          longitude: regLongitude,
          max_travel_km: regTitle === 'Fr.' ? regMaxTravelKm : 25,
          transport_mode: regTransportMode,
          profile_photo: null
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
    const initialTitle = user.title || (user.clergy_type === 'convent' || user.clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.');
    setEditTitle(initialTitle);
    // Clean raw name in input box so user edits clean given name
    const rawClean = (user.name || '').replace(/^(Rev\.\s*|Fr\.\s*|Sr\.\s*)+/i, '');
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
    const existingModes = Array.isArray(user.transport_modes)
      ? user.transport_modes
      : (typeof user.transport_modes === 'string'
          ? (() => { try { return JSON.parse(user.transport_modes); } catch(e) { return [user.transport_mode || 'own_bike']; } })()
          : [user.transport_mode || 'own_bike']);
    setEditTransportModes(existingModes.length > 0 ? existingModes : ['own_bike']);
    const existingLangs = Array.isArray(user.liturgical_languages) && user.liturgical_languages.length > 0
      ? user.liturgical_languages
      : (typeof user.liturgical_languages === 'string'
          ? (() => { try { return JSON.parse(user.liturgical_languages); } catch(e) { return ['English', 'Tamil']; } })()
          : ['English', 'Tamil']);
    setEditLiturgicalLanguages(existingLangs);
    setEditProfilePhoto(user.profile_photo || null);
    setEditDob(user.dob || '');
    setEditAboutMe(user.about_me || '');
    const soc = typeof user.social_links === 'string'
      ? (() => { try { return JSON.parse(user.social_links); } catch(e) { return {}; } })()
      : (user.social_links || {});
    setEditYoutube(soc.youtube || '');
    setEditFacebook(soc.facebook || '');
    setEditInstagram(soc.instagram || '');
    setEditWebsite(soc.website || '');
    setShowEditSocialLinks(Boolean(soc.youtube || soc.facebook || soc.instagram || soc.website));
    setShowProfileModal(true);
  };

  // Save Modified Profile to Backend and Turso
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName || !editMobile) {
      showFeedback('error', 'Name and mobile number are required.');
      return;
    }
    if (!editDob) {
      showFeedback('error', 'Date of Birth is required.');
      return;
    }
    const computedAge = calculateAge(editDob);
    if (computedAge === null || computedAge < 18 || computedAge > 110) {
      showFeedback('error', 'Please provide a valid Date of Birth (must be at least 18 years of age).');
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
          dob: editDob,
          clergy_type: editTitle === 'Fr.' ? editClergyType : 'convent',
          religious_order: (editTitle === 'Fr.' && editClergyType === 'diocesan') ? null : editOrder,
          diocese_province: (editTitle === 'Fr.' && editClergyType === 'diocesan') ? editDiocese : '',
          residence_name: editResidenceName,
          residence_address: fullAddressWithPin,
          pincode: cleanEditPin || null,
          latitude: editLatitude,
          longitude: editLongitude,
          max_travel_km: editTitle === 'Fr.' ? editMaxTravelKm : 25,
          transport_mode: editTransportModes.length > 0 ? editTransportModes[0] : editTransportMode,
          transport_modes: editTransportModes,
          liturgical_languages: editLiturgicalLanguages,
          profile_photo: editProfilePhoto,
          about_me: editAboutMe.trim(),
          social_links: {
            youtube: editYoutube.trim(),
            facebook: editFacebook.trim(),
            instagram: editInstagram.trim(),
            website: editWebsite.trim()
          }
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

  // Open Request Modal in Edit Mode pre-filled with existing booking details
  const openEditBookingModal = (booking) => {
    setEditingBooking(booking);
    setBookingLocation(booking.location || '');
    setBookingLatitude(booking.latitude || null);
    setBookingLongitude(booking.longitude || null);
    
    // Parse start datetime
    if (booking.datetime) {
      const parts = booking.datetime.split('T');
      setBookingDate(parts[0] || '');
      if (parts[1]) {
        setBookingTimeStart(parts[1].slice(0, 5));
      }
    }

    // Parse end datetime
    if (booking.datetime_end) {
      const parts = booking.datetime_end.split('T');
      setBookingEndDate(parts[0] !== booking.datetime.split('T')[0] ? parts[0] : '');
      if (parts[1]) {
        setBookingTimeEnd(parts[1].slice(0, 5));
      }
    } else {
      setBookingEndDate('');
    }

    // Match service type or set to Others
    const rawService = booking.service_type || 'Holy Mass';
    const allPresets = [...MASS_SACRAMENTS, ...PARALITURGY_BLESSINGS, ...PASTORAL_MINISTRIES];
    if (allPresets.includes(rawService)) {
      setBookingServiceType(rawService);
      setBookingCustomServiceType('');
    } else {
      setBookingServiceType('Others');
      setBookingCustomServiceType(rawService);
    }

    setBookingLanguage(booking.language || 'English');
    setBookingHonorarium(booking.honorarium || '');
    setBookingNotes(booking.notes || '');
    setShowRequestModal(true);
  };

  // Create or Update Broadcast Ministry Request
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
      const isEditing = Boolean(editingBooking);
      const url = isEditing ? `/api/bookings/${editingBooking.id}` : '/api/bookings';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          location: bookingLocation,
          latitude: bookingLatitude,
          longitude: bookingLongitude,
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
        showFeedback('success', isEditing ? (data.message || 'Ministry request successfully updated!') : 'Ministry request broadcasted successfully!');
        setShowRequestModal(false);
        setEditingBooking(null);
        setBookingLocation('');
        setBookingLatitude(null);
        setBookingLongitude(null);
        setBookingDate('');
        setBookingEndDate('');
        loadDashboardData();
      } else {
        showFeedback('error', data.error || (isEditing ? 'Failed to update request.' : 'Failed to post slot.'));
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

  // Toggle favorite minister
  const handleToggleFavorite = async (ministerId, ministerName) => {
    try {
      const res = await fetch('/api/users/favorites/toggle', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ministerId })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.isFavorite ? `⭐ ${ministerName || 'Minister'} marked as favorite!` : `Removed ${ministerName || 'Minister'} from favorites.`);
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('bookapriest_user', JSON.stringify(data.user));
        }
      } else {
        showFeedback('error', data.error || 'Failed to update favorite.');
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
        fetchAdminData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to update verification status.');
    }
  };

  // --- Super-Admin Dashboard State & Handlers ---
  const [adminTab, setAdminTab] = useState('directory'); // 'directory', 'bookings', 'verification', 'database'
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminDbSnapshot, setAdminDbSnapshot] = useState(null);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminUserRoleFilter, setAdminUserRoleFilter] = useState('all'); // 'all', 'priest', 'sister', 'admin'
  const [adminBookingSearch, setAdminBookingSearch] = useState('');
  const [adminBookingStatusFilter, setAdminBookingStatusFilter] = useState('all'); // 'all', 'pending', 'accepted', 'completed'
  const [adminSelectedDbTable, setAdminSelectedDbTable] = useState('users'); // 'users', 'bookings', 'availability_slots'
  const [adminEditingUser, setAdminEditingUser] = useState(null); // user object to edit
  const [adminEditingBooking, setAdminEditingBooking] = useState(null); // booking object to edit/override
  const [adminEditingRawRecord, setAdminEditingRawRecord] = useState(null); // { table, id, rawJson }
  const [adminPasswordResetModal, setAdminPasswordResetModal] = useState(null); // { user, newPass }
  const [adminLoading, setAdminLoading] = useState(false);

  const fetchAdminData = async () => {
    if (!user || user.is_admin !== 1) return;
    setAdminLoading(true);
    try {
      const [resUsers, resBookings, resDb] = await Promise.all([
        fetch('/api/admin/users', { headers: getHeaders() }),
        fetch('/api/admin/bookings', { headers: getHeaders() }),
        fetch('/api/admin/database/snapshot', { headers: getHeaders() })
      ]);
      if (resUsers.ok) setAdminUsers(await resUsers.json());
      if (resBookings.ok) setAdminBookings(await resBookings.json());
      if (resDb.ok) setAdminDbSnapshot(await resDb.json());
    } catch (e) {
      console.error('Failed fetching admin data:', e);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminResetPassword = async (userId, newPass) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ newPassword: newPass || 'Jesus@123' })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
        setAdminPasswordResetModal(null);
        fetchAdminData();
      } else {
        showFeedback('error', data.error || 'Failed to reset password.');
      }
    } catch (e) {
      showFeedback('error', 'Error resetting password.');
    }
  };

  const handleAdminToggleRole = async (userId, field, currentVal) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-role`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ field, value: !currentVal })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
        fetchAdminData();
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to toggle role.');
      }
    } catch (e) {
      showFeedback('error', 'Error toggling role.');
    }
  };

  const handleAdminDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete ${name}? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
        fetchAdminData();
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to delete user.');
      }
    } catch (e) {
      showFeedback('error', 'Error deleting user.');
    }
  };

  const handleAdminSaveUser = async (e) => {
    e.preventDefault();
    if (!adminEditingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${adminEditingUser.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(adminEditingUser)
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'User profile updated successfully.');
        setAdminEditingUser(null);
        fetchAdminData();
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to update user.');
      }
    } catch (e) {
      showFeedback('error', 'Error updating user.');
    }
  };

  const handleAdminSaveBooking = async (e) => {
    e.preventDefault();
    if (!adminEditingBooking) return;
    try {
      const res = await fetch(`/api/admin/bookings/${adminEditingBooking.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(adminEditingBooking)
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Booking updated successfully.');
        setAdminEditingBooking(null);
        fetchAdminData();
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to update booking.');
      }
    } catch (e) {
      showFeedback('error', 'Error updating booking.');
    }
  };

  const handleAdminDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to permanently delete this booking request?')) return;
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message);
        fetchAdminData();
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to delete booking.');
      }
    } catch (e) {
      showFeedback('error', 'Error deleting booking.');
    }
  };

  const handleAdminSaveRawRecord = async (e) => {
    e.preventDefault();
    if (!adminEditingRawRecord) return;
    try {
      let parsedUpdates;
      try {
        parsedUpdates = JSON.parse(adminEditingRawRecord.rawJson);
      } catch (jsonErr) {
        showFeedback('error', 'Invalid JSON syntax. Please check formatting.');
        return;
      }
      const res = await fetch('/api/admin/database/record', {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          table: adminEditingRawRecord.table,
          id: adminEditingRawRecord.id,
          updates: parsedUpdates
        })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Database record updated successfully.');
        setAdminEditingRawRecord(null);
        fetchAdminData();
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'Failed to update record.');
      }
    } catch (e) {
      showFeedback('error', 'Error saving database record.');
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
          clergy_type: onboardTitle === 'Sr.' ? 'convent' : onboardClergyType,
          religious_order: (onboardTitle === 'Fr.' && onboardClergyType === 'diocesan') ? null : onboardOrder,
          diocese_province: (onboardTitle === 'Fr.' && onboardClergyType === 'diocesan') ? onboardDiocese : '',
          residence_name: onboardResidenceName,
          residence_address: fullAddress,
          pincode: cleanPin,
          dob: onboardDob || null
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
    const timeStart = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

    // If no explicit end time is set, assume default 1-hour celebration duration
    const dEnd = isoEndString ? new Date(isoEndString) : new Date(d.getTime() + 60 * 60 * 1000);
    const timeEnd = dEnd.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    const time = `${timeStart} to ${timeEnd}`;

    if (isoEndString) {
      const endDate = dEnd.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
      if (endDate !== date) {
        date = `${date} → ${endDate}`;
      }
    }
    return { date, time, timeStart, timeEnd };
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
    if (!mobileNumber) return '#';
    let cleaned = mobileNumber.replace(/[^0-9]/g, '');
    if (cleaned.length === 10) cleaned = `91${cleaned}`;
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(messageText)}`;
  };

  // Helper to build pre-filled fraternal WhatsApp message
  const buildWhatsAppCelebrationMessage = (b, isConfirmedCelebration = true, candidateName = null) => {
    const isMeRequester = b.requester_id === user.id;
    const myName = formatEcclesiasticalName(user?.title || (user?.clergy_type === 'convent' || user?.clergy_type === 'convent_sister' ? 'Sr.' : 'Fr.'), user?.name, user?.congregation_abbr);
    
    // Partner details
    const partnerTitle = isMeRequester ? (b.responder_title || 'Fr.') : (b.requester_title || 'Sr.');
    const partnerName = formatEcclesiasticalName(
      partnerTitle,
      isMeRequester ? (b.responder_name || candidateName) : b.requester_name,
      isMeRequester ? b.responder_congregation_abbr : b.requester_congregation_abbr
    );

    const { date, time } = formatDateTime(b.datetime, b.datetime_end);
    const serviceName = (b.service_type || 'Holy Mass').replace(/\s*\([^)]*\)/g, '').trim();
    const location = b.location || 'Parish Chapel';
    const language = b.language ? ` (${b.language})` : '';

    if (!isConfirmedCelebration) {
      // Inquiry / Offer stage message before confirmation
      return `Praise be to Lord Jesus Christ ${partnerTitle}!\n\nThis is ${myName} via Book a Priest regarding our ministry request for *${serviceName}${language}* on *${date}* at *${time}* (${location}).\n\nI would be glad to coordinate the celebration details with you.`;
    }

    // Confirmed celebration message
    if (isMeRequester) {
      return `Praise be to Lord Jesus Christ ${partnerTitle}!\n\nThis is ${myName} regarding our confirmed ministry celebration for *${serviceName}${language}*:\n\n📅 Date: ${date}\n⏰ Time: ${time}\n📍 Venue: ${location}\n\nLooking forward to welcoming you for the celebration. Please let us know if you need any travel coordination or special liturgical requirements. Thank you fraternally!`;
    } else {
      return `Praise be to Lord Jesus Christ ${partnerTitle}!\n\nThis is ${myName} regarding our confirmed ministry celebration for *${serviceName}${language}*:\n\n📅 Date: ${date}\n⏰ Time: ${time}\n📍 Venue: ${location}\n\nI look forward to celebrating with your community. Please let me know of any specific liturgical intentions or directions. God bless!`;
    }
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
              {user ? '← Back to App' : '← Back to Registration'}
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
            <h2 style={{ fontSize: '1.35rem', color: '#0F172A', fontWeight: 700, margin: '0 0 0.35rem 0', fontFamily: 'Outfit' }}>
              A Personal Note to Our Fathers &amp; Sisters
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0 }}>
              BookaPriest Liturgical &amp; Pastoral Coordination
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.9rem', color: '#334155', lineHeight: '1.7' }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.15rem 1.35rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#0F172A' }}>
                Dear {user ? formatEcclesiasticalName(user) : 'Fr. / Rev. Sister'},
              </p>
              <p style={{ margin: '0 0 0.65rem 0', fontWeight: 600, color: '#1E293B' }}>
                Praise be to Lord Jesus Christ.
              </p>
              <p style={{ margin: '0 0 0.75rem 0' }}>
                I hope you are doing well in your ministry.
              </p>
              <p style={{ margin: '0 0 0.75rem 0' }}>
                Please be informed that this is not any profit-making website or commercial venture. It is simply my personal attempt to address the everyday logistical friction in pastoral ministry through technology, helping our convents, parishes, and religious communities easily discover the liturgical availability of our priests when a spiritual need arises.
              </p>
              <p style={{ margin: 0 }}>
                To make the best use of this platform and to ensure both a smooth ministry experience and complete mutual privacy, please keep in mind the following:
              </p>
            </div>

            {/* Step 1: Security & Manual Verification */}
            <div style={{ padding: '0.9rem 1.1rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: '1.3' }}>🛡️</span>
                <div>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>
                    1. Highly Secure &amp; 100% Private (No Public Web Access)
                  </strong>
                  <span style={{ fontSize: '0.86rem', color: '#475569' }}>
                    All your personal information, clerical profile, and contact details are strictly protected and kept confidential. There is <strong>no public access</strong>, and your data is never crawled by web search engines or commercial directories. To protect the sanctity of ministry, <strong>I personally scrutinize and manually verify each user's authentic clerical and religious status</strong> before granting entry to the platform.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Facilitation vs Automated App */}
            <div style={{ padding: '0.9rem 1.1rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: '1.3' }}>🕊️</span>
                <div>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>
                    2. Facilitation Forum Only (Not an Automated Booking System)
                  </strong>
                  <span style={{ fontSize: '0.86rem', color: '#475569' }}>
                    This platform is <strong>not an automatic booking service like Uber or commercial ride-hailing apps</strong>. It is designed solely as a voluntary facilitation forum to help convents, parishes, and communities easily discover the liturgical availability of our priests in an aggregated, transparent manner. It is meant to assist, not replace, our sacred fraternity and pastoral discernment.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Direct Personal Communication */}
            <div style={{ padding: '0.9rem 1.1rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: '1.3' }}>📞</span>
                <div>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>
                    3. Direct Personal Communication Before Confirmation
                  </strong>
                  <span style={{ fontSize: '0.86rem', color: '#475569' }}>
                    Whenever an offer is made or a request is posted, requesters must always speak directly with the priest—via direct phone call or WhatsApp—prior to finalizing or locking in any celebration. A brief personal conversation is essential to verify mutual agreement, exact timing, liturgical language, and specific requirements.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 4: Bilateral Coordination */}
            <div style={{ padding: '0.9rem 1.1rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: '1.3' }}>🤝</span>
                <div>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>
                    4. Direct Bilateral Coordination
                  </strong>
                  <span style={{ fontSize: '0.86rem', color: '#475569' }}>
                    Once contact numbers are exchanged, all celebration arrangements, travel coordination, and details take place entirely between your community and the celebrant. The platform does not arbitrate or intervene in individual arrangements.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 5: Good-Faith Advisory */}
            <div style={{ padding: '0.9rem 1.1rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: '1.3' }}>🔒</span>
                <div>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>
                    5. No Commercial Guarantees or Platform Liability
                  </strong>
                  <span style={{ fontSize: '0.86rem', color: '#475569' }}>
                    Information is shared in good faith. As an informal coordination aid, the platform cannot provide legal or canonical guarantees regarding attendance or travel disruptions, and assumes no liability for unforeseen cancellations or emergencies.
                  </span>
                </div>
              </div>
            </div>

            {/* Sign-off & Fraternal Blessing with Photo & Canonical Address */}
            <div style={{ padding: '1.15rem 1.35rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                Thank you sincerely for your dedication to the Church and for your willingness to serve our communities. May the Lord continue to bless you and your sacred ministry abundantly.
              </p>
              
              <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <img
                  src="/fr_joseph.jpg"
                  alt="Fr. Joseph ArRa OFM Cap"
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2.5px solid #D97706',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <span style={{ display: 'block', color: '#64748B', fontSize: '0.82rem' }}>Yours fraternally in Christ,</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <strong style={{ color: '#0F172A', fontSize: '1rem' }}>Fr. Joseph ArRa OFM Cap</strong>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', background: '#DCFCE7', border: '1px solid #86EFAC', padding: '1px 6px', borderRadius: '9999px' }}>
                      ✓ Verified Developer &amp; Admin
                    </span>
                  </div>
                  
                  {/* Canonical Address */}
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem', lineHeight: '1.4' }}>
                    <span>⛪ Fraternité des Capucins</span><br />
                    <span>📍 32 rue Boissonade, 75014 PARIS</span>
                  </div>

                  {/* Links */}
                  <div style={{ marginTop: '0.45rem', display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                    <a href="https://josephcap.com" target="_blank" rel="noreferrer" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>
                      🌐 josephcap.com
                    </a>
                    <a href="mailto:bookapriestnow@gmail.com" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>
                      ✉️ bookapriestnow@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setShowPrivacyPage(false)}
              className="btn btn-primary"
              style={{ padding: '0.7rem 2rem', fontWeight: 600 }}
            >
              {user ? '← Back to App' : '← Back to Registration'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Login / Register Screen ---
  if (!user) {
    return (
      <div className="auth-page" style={{ flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', padding: '2rem 1rem' }}>
        <div className="glass-card auth-card">
          <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            {/* Horizontal Unified Lockup: Book [Pin] Priest */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '0.45rem',
              flexWrap: 'nowrap'
            }}>
              <span style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                fontFamily: "'Outfit', sans-serif",
                color: '#131E3C',
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}>
                Book
              </span>

              {/* The Pin Icon in place of "a" */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BookAPriestLogo size={46} />
              </div>

              <span style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                fontFamily: "'Outfit', sans-serif",
                color: '#131E3C',
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}>
                Priest
              </span>
            </div>

            {/* Tagline */}
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#131E3C',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              opacity: 0.85
            }}>
              Shepherds at your call
            </div>
          </div>

          {errorMsg && <div className="error-alert">{errorMsg}</div>}
          {successMsg && <div className="success-alert">{successMsg}</div>}

          {authMode === 'login' ? (
            <div>
              {!usePasswordLogin ? (
                /* Sleek, Minimal WhatsApp 1-Tap Login */
                <div>
                  <form onSubmit={(e) => { e.preventDefault(); handleRequestWhatsAppAuth(loginIdentifier, 'login'); }}>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Mobile Number</label>
                      <div className="input-prefix-group">
                        <span className="input-prefix-badge" style={{ color: '#475569', fontWeight: 700 }}>+91</span>
                        <input
                          type="tel"
                          className="form-input-inline"
                          placeholder="98765 43210"
                          value={formatMobileDisplay(loginIdentifier)}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          maxLength={11}
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn"
                      style={{
                        width: '100%',
                        background: '#1A2238',
                        borderColor: '#1A2238',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.98rem',
                        padding: '0.85rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 6px 18px rgba(26, 34, 56, 0.35)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      disabled={formSubmitting}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                        <line x1="9" y1="7" x2="15" y2="7" />
                        <line x1="9" y1="11" x2="15" y2="11" />
                      </svg>
                      <span>{formSubmitting ? 'Sending OTP...' : 'Log in with OTP'}</span>
                    </button>
                  </form>

                  <div style={{ margin: '1rem 0 0.5rem 0', textAlign: 'center', position: 'relative' }}>
                    <div style={{ borderTop: '1px solid #E2E8F0', position: 'absolute', top: '50%', left: 0, right: 0 }}></div>
                    <span style={{ position: 'relative', background: '#FFFFFF', padding: '0 12px', fontSize: '0.76rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                      or
                    </span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setUsePasswordLogin(true)}
                      style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: '6px' }}
                    >
                      Sign in with password
                    </button>


                  </div>
                </div>
              ) : (
                /* Fallback: Password Login (For Admin or fallback) */
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          const mob = loginIdentifier || '';
                          if (!mob || mob.replace(/\D/g, '').length < 10) {
                            showFeedback('error', 'Please enter your 10-digit WhatsApp mobile number above first.');
                            return;
                          }
                          handleRequestWhatsAppAuth(mob, 'reset_password');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
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
                            <line x1="1" y1="2" x2="23" y2="23" />
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
                    {formSubmitting ? 'Verifying...' : 'Sign In with Password'}
                  </button>

                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setUsePasswordLogin(false)}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', padding: '4px' }}
                    >
                      ← Back to OTP Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleRegister} autoComplete="off">
              {/* Section 1: Clerical Identity */}
              <div className="auth-section-divider">
                <span>1. Clerical Identity</span>
              </div>

              {/* Direct 1-Click Clerical Status Selector */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Select Your Clerical Status *</span>
                  {regTitle && (
                    <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                      ✓ Selected: {regTitle === 'Fr.' ? 'Priest (Fr.)' : 'Sister (Sr.)'}
                    </span>
                  )}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                  {/* 1. PRIEST (Fr.) - Male / Priest */}
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
                      gap: '8px',
                      padding: '0.85rem 0.5rem',
                      borderRadius: '10px',
                      border: regTitle === 'Fr.' ? '2px solid var(--accent-gold)' : '1.5px solid #E2E8F0',
                      background: regTitle === 'Fr.' ? '#FEFCE8' : '#FFFFFF',
                      color: regTitle === 'Fr.' ? '#854D0E' : '#334155',
                      boxShadow: regTitle === 'Fr.' ? '0 4px 12px rgba(202, 138, 4, 0.15)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {/* Standard Male / Priest Silhouette */}
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span style={{ fontSize: '0.86rem', fontWeight: regTitle === 'Fr.' ? 700 : 600 }}>
                      Fr. (Priest)
                    </span>
                  </button>

                  {/* 2. SISTER (Sr.) - Female / Sister */}
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
                      gap: '8px',
                      padding: '0.85rem 0.5rem',
                      borderRadius: '10px',
                      border: regTitle === 'Sr.' ? '2px solid var(--accent-gold)' : '1.5px solid #E2E8F0',
                      background: regTitle === 'Sr.' ? '#FEFCE8' : '#FFFFFF',
                      color: regTitle === 'Sr.' ? '#854D0E' : '#334155',
                      boxShadow: regTitle === 'Sr.' ? '0 4px 12px rgba(202, 138, 4, 0.15)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {/* Standard Female / Sister Silhouette */}
                      <path d="M19 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M5 21v-2a4 4 0 0 1 3-3.87" />
                      <circle cx="12" cy="7" r="4" />
                      <path d="M9 14h6a3 3 0 0 1 3 3v4H6v-4a3 3 0 0 1 3-3z" />
                    </svg>
                    <span style={{ fontSize: '0.86rem', fontWeight: regTitle === 'Sr.' ? 700 : 600 }}>
                      Sr. (Sister)
                    </span>
                  </button>
                </div>
              </div>

              {/* Name Input */}
              <div className="form-group">
                <label className="form-label">
                  <span>Name *</span>
                </label>
                {regTitle ? (
                  <div className="input-prefix-group" style={{ cursor: 'text', paddingLeft: '1rem', paddingRight: '1rem' }}>
                    <span
                      style={{
                        userSelect: 'none',
                        color: '#0F172A',
                        fontWeight: 700,
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        marginRight: '4px',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      {regTitle}
                    </span>
                    <input
                      type="text"
                      className="form-input-inline"
                      placeholder="Enter your name..."
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      style={{ paddingLeft: 0, paddingRight: 0 }}
                      required
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your name..."
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
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
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '0.85rem 0.5rem',
                        borderRadius: '10px',
                        border: regClergyType === 'diocesan' ? '2px solid var(--accent-gold)' : '1.5px solid #E2E8F0',
                        background: regClergyType === 'diocesan' ? '#FEFCE8' : '#FFFFFF',
                        color: regClergyType === 'diocesan' ? '#854D0E' : '#334155',
                        boxShadow: regClergyType === 'diocesan' ? '0 4px 12px rgba(202, 138, 4, 0.12)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>🏛️</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: regClergyType === 'diocesan' ? '#854D0E' : '#0F172A' }}>
                        Diocesan Priest
                      </span>
                      {regClergyType === 'diocesan' && (
                        <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 800 }}>✓</span>
                      )}
                    </button>

                    {/* Religious Option */}
                    <button
                      type="button"
                      onClick={() => setRegClergyType('religious')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '0.85rem 0.5rem',
                        borderRadius: '10px',
                        border: regClergyType === 'religious' ? '2px solid var(--accent-gold)' : '1.5px solid #E2E8F0',
                        background: regClergyType === 'religious' ? '#FEFCE8' : '#FFFFFF',
                        color: regClergyType === 'religious' ? '#854D0E' : '#334155',
                        boxShadow: regClergyType === 'religious' ? '0 4px 12px rgba(202, 138, 4, 0.12)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>⛪</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: regClergyType === 'religious' ? '#854D0E' : '#0F172A' }}>
                        Religious Priest
                      </span>
                      {regClergyType === 'religious' && (
                        <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 800 }}>✓</span>
                      )}
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
                    <label className="form-label">Congregation *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Capuchins, Jesuits, Salesians"
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
                    <label className="form-label">Suffix (optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="OFM Cap, SJ, SDB"
                      value={regCongregationAbbr}
                      onChange={(e) => setRegCongregationAbbr(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* BRANCH 2: SISTER (Sr.) -> Congregation + Abbreviation */}
              {regTitle === 'Sr.' && (
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Congregation *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Franciscan Sisters, CIC, FMM"
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
                    <label className="form-label">Suffix (optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="CIC, FMM, SJC"
                      value={regCongregationAbbr}
                      onChange={(e) => setRegCongregationAbbr(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Section 2: Contact & Location */}
              <div className="auth-section-divider">
                <span>2. Contact & Location</span>
              </div>

              {/* WhatsApp Mobile with Seamless Inline Verification */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>WhatsApp Mobile *</span>
                  {!regWaVerifiedCode && (
                    <span style={{ color: '#DC2626', fontSize: '0.74rem', fontWeight: 700 }}>
                      WhatsApp Verification Required!
                    </span>
                  )}
                </label>
                <div
                  className="input-prefix-group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingRight: '6px',
                    borderColor: regWaVerifiedCode ? '#22C55E' : '#E2E8F0',
                    background: regWaVerifiedCode ? '#F0FDF4' : '#FFFFFF',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span className="input-prefix-badge" style={{ color: '#475569', fontWeight: 700, paddingLeft: '12px' }}>+91</span>
                  <input
                    type="tel"
                    className="form-input-inline"
                    placeholder="98765 43210"
                    value={formatMobileDisplay(regMobile)}
                    onChange={(e) => {
                      setRegMobile(e.target.value);
                      setRegWaVerifiedCode(null);
                    }}
                    maxLength={11}
                    required
                    disabled={!!regWaVerifiedCode}
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none' }}
                  />
                  {regWaVerifiedCode ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '4px' }}>
                      <span
                        style={{
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ✓ Verified
                      </span>
                      <button
                        type="button"
                        onClick={() => setRegWaVerifiedCode(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: '2px 4px'
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRequestWhatsAppAuth(regMobile, 'register')}
                      disabled={formSubmitting || !regMobile || regMobile.replace(/\D/g, '').length < 10}
                      style={{
                        background: (regMobile && regMobile.replace(/\D/g, '').length >= 10) ? '#25D366' : '#F1F5F9',
                        color: (regMobile && regMobile.replace(/\D/g, '').length >= 10) ? '#FFFFFF' : '#94A3B8',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: (regMobile && regMobile.replace(/\D/g, '').length >= 10) ? 'pointer' : 'default',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                      title="Verify via WhatsApp"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-2.008-.472-1.681-.7-2.776-2.434-2.86-2.546-.084-.112-.682-.907-.682-1.729 0-.822.433-1.226.587-1.391.154-.165.336-.206.449-.206.112 0 .224.001.322.006.104.005.244-.04.381.29.144.35.492 1.2.535 1.288.043.088.072.191.014.306-.058.115-.088.187-.174.288-.087.102-.183.228-.261.306-.088.087-.18.182-.077.359.102.176.455.75 0.978 1.216.673.599 1.24.785 1.417.873.177.087.28.073.384-.045.105-.118.449-.523.57-.702.12-.18.241-.15.405-.089.164.061 1.042.492 1.22.582.179.089.298.134.342.208.043.075.043.434-.101.839z"/>
                      </svg>
                      Verify
                    </button>
                  )}
                </div>
              </div>

              {/* Date of Birth (Mandatory) & Live Age Badge */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>DATE OF BIRTH *</span>
                  {regDob && calculateAge(regDob) !== null && (
                    <span style={{ color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.74rem', fontWeight: 700 }}>
                      ✓ Age: {calculateAge(regDob)} years
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={regDob}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRegDob(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '0.2rem' }}>
                  Used to calculate your age for ministry compatibility and travel ease.
                </span>
              </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Address</span>
                    {regLatitude && (
                      <span style={{ color: '#166534', fontSize: '0.74rem', fontWeight: 600 }}>
                        ✓ GPS Pin Set
                      </span>
                    )}
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
                      className={`input-action-btn ${regLatitude ? 'active' : ''}`}
                      onClick={() => handleDetectGPS('reg')}
                      disabled={gpsDetecting}
                      title={regLatitude ? "GPS Location Captured (Tap to update)" : "Get current GPS location"}
                      style={{ padding: '0.35rem' }}
                    >
                      {gpsDetecting ? (
                        <span style={{ fontSize: '0.9rem', animation: 'pulse 1s infinite' }}>⏳</span>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill={regLatitude ? "#DCFCE7" : "none"} stroke={regLatitude ? "#16A34A" : "#0F172A"} />
                          <circle cx="12" cy="10" r="3" stroke={regLatitude ? "#16A34A" : "#0F172A"} fill={regLatitude ? "#16A34A" : "none"} />
                          <ellipse cx="12" cy="22" rx="6" ry="1.5" stroke={regLatitude ? "#16A34A" : "#94A3B8"} strokeWidth="1.5" fill="none" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mandatory Postal PIN Code */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Postal PIN Code *</span>
                    {regPincode.replace(/\D/g, '').length === 6 && (
                      <span style={{ color: '#16A34A', fontSize: '0.74rem', fontWeight: 600 }}>
                        ✓ Valid PIN Code
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="form-input"
                    placeholder="Enter your Postal Pincode"
                    value={regPincode}
                    onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>

              {/* Section 3: Security & Agreement */}
              <div className="auth-section-divider">
                <span>3. Security & Account</span>
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
                {/* Live Password Strength Indicator */}
                <div style={{ marginTop: '0.35rem', fontSize: '0.73rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span
                    style={{
                      color: regPassword.length >= 6 ? '#16A34A' : '#94A3B8',
                      fontWeight: 700
                    }}
                  >
                    {regPassword.length >= 6 ? '✓' : '•'}
                  </span>
                  <span
                    style={{
                      color: regPassword.length >= 6 ? '#16A34A' : '#64748B',
                      fontWeight: regPassword.length >= 6 ? 600 : 500
                    }}
                  >
                    {regPassword.length >= 6 ? 'Meets security standard (6+ characters)' : 'Minimum 6 characters'}
                  </span>
                </div>
              </div>

              {/* Sleek Integrated Privacy & Policy Agreement */}
              <div style={{ margin: '1.25rem 0 0.85rem 0' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    color: '#475569',
                    lineHeight: 1.45,
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={regAgreed}
                    onChange={(e) => setRegAgreed(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: 'var(--primary-color, #0F172A)',
                      marginTop: '2px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    required
                  />
                  <span>
                    Exclusively for Catholic clergy & religious. Managed manually by & for the verified Catholic forum. I confirm my details and agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPrivacyPage(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0284C7',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                        fontSize: 'inherit'
                      }}
                    >
                      Privacy Policy & Terms
                    </button>
                    . All details remain 100% confidential.
                  </span>
                </label>
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
                  boxShadow: (regAgreed && !formSubmitting) ? '0 4px 14px rgba(15, 23, 42, 0.2)' : 'none',
                  opacity: (regAgreed && !formSubmitting) ? 1 : 0.5,
                  cursor: (regAgreed && !formSubmitting) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
                disabled={!regAgreed || formSubmitting}
                title={!regAgreed ? 'Please read and check the agreement box above to proceed' : 'Submit'}
              >
                {formSubmitting ? (
                  <>
                    <span style={{ fontSize: '1rem', animation: 'spin 1s linear infinite' }}>⏳</span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </button>

              <div className="auth-footer" style={{ marginTop: '1rem', textAlign: 'center' }}>
                Already registered?{' '}
                <span className="auth-link" onClick={() => setAuthMode('login')}>
                  Sign In
                </span>
              </div>
            </form>
          )}
        </div>

        {/* --- ROUTE 3: WHATSAPP 1-TAP VERIFICATION OVERLAY MODAL --- */}
        {waAuthModal && (
          <div className="modal-overlay" style={{ zIndex: 10000, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)' }}>
            <div className="modal-container" style={{ maxWidth: '440px', padding: '1.75rem 1.5rem', textAlign: 'center', borderRadius: '18px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              
              {/* Animated WhatsApp Icon */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: waVerifiedSuccess ? '#DCFCE7' : '#25D366',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 8px 20px rgba(37, 211, 102, 0.35)',
                transition: 'all 0.3s ease'
              }}>
                {waVerifiedSuccess ? (
                  <span style={{ fontSize: '2rem', color: '#16A34A' }}>✓</span>
                ) : (
                  <span style={{ fontSize: '2rem' }}>💬</span>
                )}
              </div>

              {waVerifiedSuccess ? (
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#16A34A' }}>
                    WhatsApp Verified!
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                    {waAuthModal.mode === 'login' ? 'Logging you into your dashboard...' : 'Loading profile registration form...'}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', fontFamily: 'Outfit' }}>
                    1-Tap WhatsApp Verification
                  </h3>
                  <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.84rem', color: '#64748B', lineHeight: '1.5' }}>
                    Tap the button below to open WhatsApp and send the pre-filled message:
                  </p>

                  {/* Pre-filled Message Bubble Preview */}
                  <div style={{
                    background: '#F0FDF4',
                    border: '1.5px dashed #86EFAC',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                      Pre-filled Message Preview
                    </div>
                    <div style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 600, fontFamily: 'monospace' }}>
                      {waAuthModal.messageText}
                    </div>
                  </div>

                  {/* Single Clean Action: Opens Native OS Chooser */}
                  <a
                    href={`whatsapp://send?phone=${waAuthModal.helpline.replace(/\D/g, '')}&text=${encodeURIComponent(waAuthModal.messageText)}`}
                    className="btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: '#25D366',
                      borderColor: '#22C55E',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      fontWeight: 700,
                      padding: '0.85rem 1.25rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                      marginBottom: '1rem'
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.69C7.02 10.9 7.9 12.07 8.02 12.23C8.15 12.4 9.73 14.82 12.16 15.86C12.74 16.11 13.19 16.26 13.54 16.37C14.12 16.56 14.65 16.53 15.07 16.47C15.54 16.4 16.51 15.88 16.71 15.31C16.92 14.74 16.92 14.26 16.86 14.16C16.79 14.05 16.63 13.99 16.39 13.87C16.15 13.75 14.97 13.17 14.75 13.09C14.53 13.01 14.37 12.97 14.21 13.22C14.05 13.46 13.59 14.01 13.45 14.17C13.31 14.33 13.17 14.35 12.93 14.23C12.69 14.11 11.91 13.86 10.99 13.04C10.28 12.4 9.8 11.62 9.66 11.38C9.52 11.14 9.65 11.01 9.77 10.89C9.88 10.78 10.02 10.6 10.14 10.46C10.26 10.32 10.3 10.22 10.38 10.06C10.46 9.9 10.42 9.76 10.36 9.64C10.3 9.52 9.84 8.38 9.64 7.91C9.45 7.46 9.26 7.52 9.11 7.51C8.97 7.51 8.81 7.51 8.65 7.51L8.53 7.33Z" />
                    </svg>
                    <span>Send via WhatsApp</span>
                  </a>

                  {/* Listening Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748B', margin: '0.85rem 0' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', animation: 'pulse 1.2s infinite' }}></span>
                    <span>Waiting for your WhatsApp message to arrive...</span>
                  </div>

                  {/* Dev / Quick Test: Simulate Click */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSimulateWhatsAppConfirm(waAuthModal.code)}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      title="Simulates that your WhatsApp message arrived at the server"
                    >
                      ⚡ Test: Simulate Incoming WhatsApp Message
                    </button>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setWaAuthModal(null);
                        setWaAuthPolling(false);
                      }}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- SET NEW PASSWORD MODAL (AFTER WHATSAPP VERIFICATION) --- */}
        {resetPasswordModal && (
          <div className="modal-overlay" style={{ zIndex: 10001, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)' }}>
            <div className="modal-container" style={{ maxWidth: '420px', padding: '1.75rem 1.5rem', borderRadius: '18px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#16A34A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  marginBottom: '0.75rem'
                }}>
                  🔐
                </div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                  Reset Your Password
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                  WhatsApp verified for <strong>{resetPasswordModal.mobile}</strong>. Enter your new password below:
                </p>
              </div>

              <form onSubmit={handleResetPasswordWa}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">New Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter new password (min. 6 chars)"
                    value={resetPasswordModal.newPassword}
                    onChange={(e) => setResetPasswordModal({ ...resetPasswordModal, newPassword: e.target.value })}
                    required
                    minLength={6}
                    autoFocus
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    Minimum 6 characters.
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.8rem', fontWeight: 700 }}
                  disabled={formSubmitting || !resetPasswordModal.newPassword || resetPasswordModal.newPassword.length < 6}
                >
                  {formSubmitting ? 'Updating...' : 'Set New Password'}
                </button>

                <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setResetPasswordModal(null)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- AUTH PAGE FOOTER (DISCREET & PRIVACY-CONSCIOUS) --- */}
        <footer style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.78rem', color: '#64748B', lineHeight: '1.6' }}>
          {/* Subtle Access Note */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            color: '#64748B',
            fontWeight: 500,
            marginBottom: '0.5rem',
            letterSpacing: '0.01em'
          }}>
            <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>🔒</span>
            <span>For verified clergy & religious only. Access by approval</span>
          </div>

          <div style={{ marginBottom: '0.25rem', fontWeight: 500 }}>
            Managed under Catholic Religious Administration
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>&copy; <a href="https://josephcap.com" target="_blank" rel="noreferrer" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>josephcap.com</a></span>
            <span style={{ color: '#CBD5E1' }}>&bull;</span>
            <button
              type="button"
              onClick={() => setShowPrivacyPage(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0284C7',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.78rem',
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: '3px'
              }}
            >
              Privacy &amp; Authenticity Notes
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // --- Main Application Dashboard ---
  return (
    <div className="app-container">
      {/* Header */}
      <header className="navbar">
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '2px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(26, 34, 56, 0.1)'
          }}>
            <BookAPriestLogo size={36} />
          </div>
          <span className="brand-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span>Book</span>
            <span style={{ color: '#FCD116' }}>a</span>
            <span>Priest</span>
          </span>
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
                renderDefaultAvatar(user.title, user.clergy_type, 20)
              )}
            </div>
            <div className="user-tag" style={{ textAlign: 'left' }}>
              <span className="user-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span>{user.is_admin === 1 ? 'Administrator' : formatEcclesiasticalName(user)}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.85 }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
              <span className="user-status" style={{ justifyContent: 'flex-start' }}>
                <span className={`status-dot ${user.is_verified === 1 ? 'verified' : 'pending'}`}></span>
                {user.is_admin === 1 ? 'System Admin' : user.is_verified === 1 ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </button>

          {/* Favorite Ministers Quick Access Button (Hide for Super-Admin) */}
          {user.is_admin !== 1 && (
            <div className="header-notif-wrapper">
              <button
                type="button"
                className="header-notif-btn"
                onClick={() => setShowFavoritesModal(true)}
                title="My Favorite Ministers"
                aria-label="View favorite ministers"
                style={{
                  borderColor: showFavoritesModal ? '#EAB308' : '#E2E8F0',
                  background: showFavoritesModal ? '#FEFCE8' : '#FFFFFF',
                  color: showFavoritesModal ? '#CA8A04' : '#64748B'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={user?.favorite_ministers?.length > 0 ? '#EAB308' : 'none'} stroke="#EAB308" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {(() => {
                  const favCount = Array.isArray(user?.favorite_ministers) ? user.favorite_ministers.length : 0;
                  return favCount > 0 ? (
                    <span className="header-notif-badge" style={{ background: '#EAB308', color: '#FFFFFF', boxShadow: '0 2px 4px rgba(234, 179, 8, 0.4)' }}>
                      {favCount}
                    </span>
                  ) : null;
                })()}
              </button>
            </div>
          )}

          {/* Monthly Booking Calendar Quick Access Button (Hide for Super-Admin) */}
          {user.is_admin !== 1 && (
            <div className="header-notif-wrapper">
              <button
                type="button"
                className="header-notif-btn"
                onClick={() => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  setCalMonthOffset(0);
                  // Look for upcoming celebration dates for this user
                  const confirmedUserBookings = bookings.filter(b => (b.status === 'accepted' || b.status === 'completed') && (b.responder_id === user.id || b.requester_id === user.id));
                  const datesWithBookings = confirmedUserBookings
                    .map(b => b.datetime ? b.datetime.split('T')[0] : null)
                    .filter(Boolean)
                    .sort();
                  // Select today if it has a booking, or the next upcoming date, or first available, or today
                  const upcomingDate = datesWithBookings.find(d => d >= todayStr);
                  const targetDate = datesWithBookings.includes(todayStr) ? todayStr : (upcomingDate || datesWithBookings[0] || todayStr);
                  setCalendarSelectedDate(targetDate);
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
          )}

          {/* Facebook-Style Notification Bell & Floating Dropdown Overlay (Hide for Super-Admin) */}
          {user.is_admin !== 1 && (
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

                        // 4. Post Edit Events (Changes made by Requester)
                        (b.edit_history || []).forEach((ed, idx) => {
                          const hasOfferedThis = (b.applicants || []).some(a => a.priest_id === user.id);
                          if (isRequester || isResponder || hasOfferedThis) {
                            events.push({
                              id: `edit-${b.id}-${idx}`,
                              timestamp: new Date(ed.edited_at || b.updated_at || b.created_at),
                              type: 'edited',
                              icon: (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              ),
                              iconBg: '#FEF3C7',
                              title: isRequester ? 'You edited your ministry request' : `Ministry request details updated (${b.service_type || 'Holy Mass'})`,
                              subtitle: ed.summary || 'Schedule, venue, or language updated by requester.',
                              targetDate: `${date} • ⏰ ${time}`,
                              badge: 'Details Edited',
                              badgeColor: '#B45309',
                              badgeBg: '#FEF3C7'
                            });
                          }
                        });

                        // 5. Offer Withdrawal Events
                        (b.withdrawals || []).forEach((w, wIdx) => {
                          const isWithdrawer = w.priest_id === user.id;
                          if (isRequester || isWithdrawer) {
                            const withdrawerName = formatEcclesiasticalName(w.priest_title || 'Fr.', w.priest_name, w.congregation_abbr);
                            events.push({
                              id: `withdrawn-${b.id}-${w.priest_id}-${wIdx}`,
                              timestamp: new Date(w.withdrawn_at || b.updated_at || b.created_at),
                              type: 'withdrawn',
                              icon: (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="15" y1="9" x2="9" y2="15" />
                                  <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                              ),
                              iconBg: '#FEE2E2',
                              title: isWithdrawer ? 'You withdrew your availability' : `${withdrawerName} withdrew availability`,
                              subtitle: `For ${b.service_type || 'Holy Mass'} at ${b.location || 'Parish'}`,
                              targetDate: `${date} • ⏰ ${time}`,
                              badge: 'Withdrawn',
                              badgeColor: '#DC2626',
                              badgeBg: '#FEE2E2'
                            });
                          }
                        });
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
        )}

        {/* Sign Out Action Button (Styled matching the circular header action buttons) */}
          <div className="header-notif-wrapper">
            <button
              type="button"
              className="header-notif-btn"
              onClick={handleSignOut}
              title="Sign Out"
              aria-label="Sign out of Book a Priest"
              style={{
                borderColor: '#E2E8F0',
                background: '#FFFFFF',
                color: '#64748B'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FCA5A5';
                e.currentTarget.style.background = '#FEF2F2';
                e.currentTarget.style.color = '#DC2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
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

        {/* Liturgical Platform: Only rendered for standard Clergy & Sister accounts (Admins exclusively use Admin Control Suite) */}
        {user.is_admin !== 1 && (
          <>
            {/* ========================================================================= */}
            {/* UNIFIED 4-TAB DASHBOARD (PRIESTS & SISTERS)                              */}
            {/* ========================================================================= */}
            <div>
              {/* ========================================================================= */}
              {/* DUAL-MODE ROLE PERSPECTIVE SWITCH: [ 📋 My Requests ] vs [ 🤝 Serve ]     */}
              {/* ========================================================================= */}
              {(() => {
                const isSister = user.title === 'Sr.' || user.clergy_type === 'convent' || user.clergy_type === 'convent_sister';

                // Current timestamp for separating upcoming confirmed vs past history
                const nowMs = Date.now();

                // Counts for Unified 4-Tab Navigation:
                // 1. Explore: open community needs (excluding user's own)
                const isCatCMinistry = (serviceType) => {
                  const s = (serviceType || '').toLowerCase();
                  return s.includes('catechism') || s.includes('sunday school') || s.includes('faith formation') ||
                         s.includes('altar decoration') || s.includes('decoration') ||
                         s.includes('anbiam') || s.includes('bcc') || s.includes('small christian community') ||
                         s.includes('house visit') || s.includes('home visit') || s.includes('family visit') ||
                         s.includes('communion to sick') || (s.includes('communion') && s.includes('sick')) ||
                         s.includes('choir') || s.includes('choir animation');
                };

                const openNeeds = bookings.filter(b => {
                  if (b.status !== 'pending' || b.requester_id === user.id) return false;
                  const isCatC = isCatCMinistry(b.service_type);
                  if (isSister) {
                    // Sisters: ONLY Category C (Pastoral Ministries)
                    if (!isCatC) return false;
                  } else {
                    // Priests: ONLY Categories A & B (Sacraments & Paraliturgies, exclude Category C)
                    if (isCatC) return false;
                  }
                  if (priestFilterRadius !== 'all') {
                    if (b.distance_km !== null && b.distance_km > priestFilterRadius) return false;
                  }
                  if (priestFilterService !== 'all') {
                    const s = (b.service_type || '').toLowerCase();
                    const f = priestFilterService.toLowerCase();
                    let match = false;
                    if (f === 'mass') match = s.includes('holy mass') || s.includes('mass');
                    else if (f === 'concelebration') match = s.includes('concelebration');
                    else if (f === 'marriage') match = s.includes('marriage') || s.includes('matrimony');
                    else if (f === 'funeral') match = s.includes('funeral') || s.includes('requiem');
                    else if (f === 'confession') match = s.includes('confession');
                    else if (f === 'anointing') match = s.includes('anointing') || s.includes('sick');
                    else if (f === 'adoration') match = s.includes('adoration');
                    else if (f === 'charismatic') match = s.includes('charismatic') || s.includes('prayer service');
                    else if (f === 'house_blessing') match = s.includes('house blessing') || s.includes('blessing');
                    else if (f === 'recollection') match = s.includes('recollection');
                    else if (f === 'retreat') match = s.includes('retreat');
                    else if (f === 'catechism') match = s.includes('catechism') || s.includes('sunday school');
                    else if (f === 'altar_decoration') match = s.includes('altar decoration') || s.includes('decoration');
                    else if (f === 'anbiam') match = s.includes('anbiam') || s.includes('bcc');
                    else if (f === 'house_visit') match = s.includes('house visit') || s.includes('family visit');
                    else if (f === 'communion_sick') match = s.includes('communion to sick') || (s.includes('communion') && s.includes('sick'));
                    else if (f === 'choir') match = s.includes('choir');
                    else if (f === 'others') match = s.includes('other');
                    else match = s.includes(f);
                    if (!match) return false;
                  }
                  if (priestFilterLanguage !== 'all') {
                    const l = (b.language || '').toLowerCase();
                    if (!l.includes(priestFilterLanguage.toLowerCase())) return false;
                  }
                  return true;
                });

                // 2. My Requests: posts created by this user that are active/pending
                const myAllPosts = bookings.filter(b => b.requester_id === user.id);
                const myPendingPosts = myAllPosts.filter(b => b.status === 'pending');
                const myResponsesCount = myPendingPosts.filter(b => (b.applicants || []).length > 0).length;

                // 3. Confirmed: all upcoming locked celebrations (requester OR celebrant)
                const myConfirmedAll = bookings.filter(b => {
                  if (b.responder_id !== user.id && b.requester_id !== user.id) return false;
                  if (b.status !== 'accepted' && b.status !== 'completed') return false;
                  if (b.status === 'completed') return false;
                  const endOrStartTime = b.datetime_end ? new Date(b.datetime_end).getTime() : new Date(b.datetime).getTime() + 3600000;
                  return endOrStartTime >= nowMs;
                });
                const myConfirmedServing = myConfirmedAll.filter(b => b.responder_id === user.id);
                const myConfirmedRequested = myConfirmedAll.filter(b => b.requester_id === user.id);

                // 4. History: past completed celebrations & records (requester OR celebrant OR withdrawn)
                const myHistoryAll = bookings.filter(b => {
                  const hasWithdrawn = (b.withdrawals || []).some(w => w.priest_id === user.id);
                  if (hasWithdrawn) return true;
                  if (b.responder_id !== user.id && b.requester_id !== user.id) return false;
                  if (b.status === 'completed') return true;
                  if (b.status === 'accepted') {
                    const endOrStartTime = b.datetime_end ? new Date(b.datetime_end).getTime() : new Date(b.datetime).getTime() + 3600000;
                    return endOrStartTime < nowMs;
                  }
                  return false;
                });
                const myHistoryServing = myHistoryAll.filter(b => b.responder_id === user.id || (b.withdrawals || []).some(w => w.priest_id === user.id));
                const myHistoryRequested = myHistoryAll.filter(b => b.requester_id === user.id);

                const userGreetingName = formatEcclesiasticalName(user?.title || (isSister ? 'Sr.' : 'Fr.'), user?.name, user?.congregation_abbr);

                return (
                  <div className="dash-nav-container">
                    {/* TOP HEADER ROW: UNBOXED SALUTATION + PERSISTENT QUICK POST BUTTON */}
                    <div className="dash-header-bar">
                      <div className="dash-header-salutation">
                        <div className="salutation-title">
                          <span className="salutation-name">Hello, {userGreetingName}</span>
                          <span className="salutation-sep">—</span>
                          <span className="salutation-lead">
                            {requestsTab === 'open'
                              ? 'Explore ministry requests from parishes & communities'
                              : requestsTab === 'my_requests'
                              ? 'Manage your posted ministry needs & applicant responses'
                              : requestsTab === 'accepted'
                              ? 'Your upcoming confirmed liturgical celebrations'
                              : 'Your past celebrated ministries and archives'}
                          </span>
                        </div>
                        <div className="salutation-sub">
                          {requestsTab === 'open'
                            ? 'Are you available to extend a helping hand in celebration?'
                            : requestsTab === 'my_requests'
                            ? 'Review volunteers, confirm priests, and keep liturgies covered.'
                            : requestsTab === 'accepted'
                            ? 'Direct contact, GPS directions, and calendar reminders ready.'
                            : 'Historical records of all pastoral and community services.'}
                        </div>
                      </div>

                      {/* PERSISTENT QUICK ACTION ON THE RIGHT */}
                      {user.is_verified === 1 && (
                        <button
                          type="button"
                          className="btn btn-primary dash-quick-post-btn"
                          onClick={() => setShowRequestModal(true)}
                          style={{ flexShrink: 0 }}
                          title="Post a new ministry request for your parish or convent"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Post a Ministry Request</span>
                        </button>
                      )}
                    </div>

                    {/* UNIFIED SINGLE-ROW APP BAR (4 CLEAR DIRECT TABS + CONTROLS) */}
                    <div className="dash-subtabs-toolbar-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem', borderBottom: '1.5px solid #E2E8F0', marginBottom: '1.15rem' }}>
                      <div className="dash-underline-tabs" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                        {/* TAB 1: EXPLORE - BLUE PILL */}
                        <button
                          type="button"
                          className={`dash-underline-tab ${requestsTab === 'open' ? 'active' : ''}`}
                          onClick={() => setRequestsTab('open')}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <span>Explore</span>
                          <span className={`dash-tab-pill ${openNeeds.length > 0 ? 'pill-blue' : 'pill-empty'}`}>
                            {openNeeds.length}
                          </span>
                        </button>

                        {/* TAB 2: MY REQUESTS - RED PILL */}
                        <button
                          type="button"
                          className={`dash-underline-tab ${requestsTab === 'my_requests' ? 'active' : ''}`}
                          onClick={() => setRequestsTab('my_requests')}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                          <span>My Requests</span>
                          <span className={`dash-tab-pill ${myPendingPosts.length > 0 ? 'pill-red' : 'pill-empty'}`}>
                            {myPendingPosts.length}
                          </span>
                        </button>

                        {/* TAB 3: CONFIRMED - GREEN PILL */}
                        <button
                          type="button"
                          className={`dash-underline-tab ${requestsTab === 'accepted' ? 'active' : ''}`}
                          onClick={() => setRequestsTab('accepted')}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          <span>Confirmed</span>
                          <span className={`dash-tab-pill ${myConfirmedAll.length > 0 ? 'pill-green' : 'pill-empty'}`}>
                            {myConfirmedAll.length}
                          </span>
                        </button>

                        {/* TAB 4: HISTORY - NO COLOUR (NEUTRAL MUTED PILL) */}
                        <button
                          type="button"
                          className={`dash-underline-tab ${requestsTab === 'history' ? 'active' : ''}`}
                          onClick={() => setRequestsTab('history')}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>History</span>
                          <span className="dash-tab-pill pill-empty">
                            {myHistoryAll.length}
                          </span>
                        </button>
                      </div>

                        {/* RIGHT-ALIGNED COMPACT TOOLBAR CONTROLS */}
                        {requestsTab === 'accepted' && (myConfirmedServing.length > 0 && myConfirmedRequested.length > 0) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto', paddingBottom: '0.35rem' }}>
                            <span className="feed-control-label" style={{ fontSize: '0.68rem', letterSpacing: '0.03em', margin: '0 4px 0 0', color: '#64748B' }}>
                              Show:
                            </span>
                            <button
                              type="button"
                              onClick={() => setConfirmedRoleFilter('all')}
                              style={{
                                border: '1px solid',
                                borderColor: confirmedRoleFilter === 'all' ? '#15803D' : '#CBD5E1',
                                background: confirmedRoleFilter === 'all' ? '#DCFCE7' : '#FFFFFF',
                                color: confirmedRoleFilter === 'all' ? '#15803D' : '#475569',
                                fontWeight: confirmedRoleFilter === 'all' ? 700 : 500,
                                fontSize: '0.74rem',
                                padding: '0.22rem 0.55rem',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              All ({myConfirmedAll.length})
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmedRoleFilter('serving')}
                              style={{
                                border: '1px solid',
                                borderColor: confirmedRoleFilter === 'serving' ? '#1D4ED8' : '#CBD5E1',
                                background: confirmedRoleFilter === 'serving' ? '#EFF6FF' : '#FFFFFF',
                                color: confirmedRoleFilter === 'serving' ? '#1D4ED8' : '#475569',
                                fontWeight: confirmedRoleFilter === 'serving' ? 700 : 500,
                                fontSize: '0.74rem',
                                padding: '0.22rem 0.55rem',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>🤝 Serving ({myConfirmedServing.length})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmedRoleFilter('request')}
                              style={{
                                border: '1px solid',
                                borderColor: confirmedRoleFilter === 'request' ? '#7C3AED' : '#CBD5E1',
                                background: confirmedRoleFilter === 'request' ? '#F5F3FF' : '#FFFFFF',
                                color: confirmedRoleFilter === 'request' ? '#7C3AED' : '#475569',
                                fontWeight: confirmedRoleFilter === 'request' ? 700 : 500,
                                fontSize: '0.74rem',
                                padding: '0.22rem 0.55rem',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>📋 My Posts ({myConfirmedRequested.length})</span>
                            </button>
                          </div>
                        )}

                        {/* RIGHT-ALIGNED COMPACT TOOLBAR CONTROLS: HISTORY ROLE FILTER CHIPS */}
                        {requestsTab === 'history' && (myHistoryServing.length > 0 && myHistoryRequested.length > 0) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto', paddingBottom: '0.35rem' }}>
                            <span className="feed-control-label" style={{ fontSize: '0.68rem', letterSpacing: '0.03em', margin: '0 4px 0 0', color: '#64748B' }}>
                              Show:
                            </span>
                            <button
                              type="button"
                              onClick={() => setHistoryRoleFilter('all')}
                              style={{
                                border: '1px solid',
                                borderColor: historyRoleFilter === 'all' ? '#475569' : '#CBD5E1',
                                background: historyRoleFilter === 'all' ? '#F1F5F9' : '#FFFFFF',
                                color: historyRoleFilter === 'all' ? '#0F172A' : '#475569',
                                fontWeight: historyRoleFilter === 'all' ? 700 : 500,
                                fontSize: '0.74rem',
                                padding: '0.22rem 0.55rem',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              All ({myHistoryAll.length})
                            </button>

                            <button
                              type="button"
                              onClick={() => setHistoryRoleFilter('serving')}
                              style={{
                                border: '1px solid',
                                borderColor: historyRoleFilter === 'serving' ? '#1D4ED8' : '#CBD5E1',
                                background: historyRoleFilter === 'serving' ? '#EFF6FF' : '#FFFFFF',
                                color: historyRoleFilter === 'serving' ? '#1D4ED8' : '#475569',
                                fontWeight: historyRoleFilter === 'serving' ? 700 : 500,
                                fontSize: '0.74rem',
                                padding: '0.22rem 0.55rem',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>🤝 Celebrated ({myHistoryServing.length})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setHistoryRoleFilter('request')}
                              style={{
                                border: '1px solid',
                                borderColor: historyRoleFilter === 'request' ? '#7C3AED' : '#CBD5E1',
                                background: historyRoleFilter === 'request' ? '#F5F3FF' : '#FFFFFF',
                                color: historyRoleFilter === 'request' ? '#7C3AED' : '#475569',
                                fontWeight: historyRoleFilter === 'request' ? 700 : 500,
                                fontSize: '0.74rem',
                                padding: '0.22rem 0.55rem',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>📋 My Posts ({myHistoryRequested.length})</span>
                            </button>
                          </div>
                        )}

                        {requestsTab === 'open' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: 'auto', paddingBottom: '0.35rem' }}>
                            <div className="distance-slider-container" style={{ margin: 0, padding: '0.25rem 0.55rem', border: '1px solid #E2E8F0', borderRadius: '9999px', background: '#F8FAFC' }}>
                              <span className="feed-control-label" style={{ fontSize: '0.68rem', letterSpacing: '0.03em', margin: 0 }}>
                                Distance:
                              </span>
                              <div className="distance-slider-track" style={{ width: '80px' }}>
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
                              <span className="distance-slider-badge" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                                {priestFilterRadius === 'all' ? 'All' : `≤${priestFilterRadius}km`}
                              </span>
                            </div>

                            <button
                              type="button"
                              className={`feed-filter-toggle-btn ${showPriestFilterDrawer ? 'active' : ''}`}
                              onClick={() => setShowPriestFilterDrawer(!showPriestFilterDrawer)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '0.32rem 0.65rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                border: (priestFilterService !== 'all' || priestFilterLanguage !== 'all' || priestSortBy !== 'date_asc') ? '1px solid #D97706' : '1px solid #CBD5E1',
                                background: (priestFilterService !== 'all' || priestFilterLanguage !== 'all' || priestSortBy !== 'date_asc') ? '#FEF3C7' : '#FFFFFF',
                                color: (priestFilterService !== 'all' || priestFilterLanguage !== 'all' || priestSortBy !== 'date_asc') ? '#92400E' : '#475569',
                                cursor: 'pointer'
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>{showPriestFilterDrawer ? '▲' : '▼'}</span>
                            </button>

                            {(priestFilterRadius !== 5 || priestSortBy !== 'date_asc' || priestFilterService !== 'all' || priestFilterLanguage !== 'all') && (
                              <button
                                type="button"
                                className="feed-reset-btn"
                                onClick={() => {
                                  setPriestFilterRadius(25);
                                  setPriestSortBy('smart_match');
                                  setPriestSortOrder('asc');
                                  setPriestFilterService('all');
                                  setPriestFilterLanguage('all');
                                }}
                                title="Reset all filters to default"
                                style={{ padding: '0.24rem 0.5rem', fontSize: '0.72rem', borderRadius: '9999px' }}
                              >
                                <span>Reset</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    {/* EXPANDABLE SECONDARY FILTER PANEL (WHEN OPENED) */}
                    {requestsTab === 'open' && showPriestFilterDrawer && (
                      <div className="feed-controls-card" style={{ padding: '0.75rem 1rem', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
                        <div className="feed-filters-row">
                          {/* Sort By */}
                          <div className="feed-filter-item">
                            <label className="feed-filter-label" htmlFor="feed-sort-select">
                              Sort By
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.15s ease' }}>
                              <select
                                id="feed-sort-select"
                                className="feed-select"
                                value={priestSortBy}
                                onChange={(e) => setPriestSortBy(e.target.value)}
                                style={{ flex: 1, border: 'none', background: 'transparent', borderRadius: 0, paddingRight: '0.4rem' }}
                              >
                                <option value="smart_match">Smart AI Match</option>
                                <option value="awaiting_reply">Awaiting Reply</option>
                                <option value="frequently_booked">Frequently Booked</option>
                                <option value="distance_asc">Distance</option>
                                <option value="recent_posted">Recent Posts</option>
                                <option value="date_desc">Date of Need</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => setPriestSortOrder(priestSortOrder === 'asc' ? 'desc' : 'asc')}
                                title={priestSortOrder === 'asc' ? 'Top to Bottom / Earliest First (Click to reverse)' : 'Bottom to Top / Furthest First (Click to reverse)'}
                                aria-label="Toggle sort order"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '36px',
                                  height: '36px',
                                  background: priestSortOrder === 'desc' ? '#EFF6FF' : '#F1F5F9',
                                  color: priestSortOrder === 'desc' ? '#2563EB' : '#64748B',
                                  border: 'none',
                                  borderLeft: '1px solid #E2E8F0',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  flexShrink: 0
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#E2E8F0';
                                  e.currentTarget.style.color = '#0F172A';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = priestSortOrder === 'desc' ? '#EFF6FF' : '#F1F5F9';
                                  e.currentTarget.style.color = priestSortOrder === 'desc' ? '#2563EB' : '#64748B';
                                }}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)', transform: priestSortOrder === 'desc' ? 'rotate(180deg)' : 'none' }}>
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <polyline points="19 12 12 19 5 12" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Sacrament / Service Filter */}
                          <div className="feed-filter-item">
                            <label className="feed-filter-label" htmlFor="feed-service-select">
                              Sacrament / Ministry
                            </label>
                            {(() => {
                              const isSister = user.title === 'Sr.' || user.clergy_type === 'convent' || user.clergy_type === 'convent_sister';
                              return (
                                <select
                                  id="feed-service-select"
                                  className="feed-select"
                                  value={priestFilterService}
                                  onChange={(e) => setPriestFilterService(e.target.value)}
                                >
                                  <option value="all">All Available Ministries (Default)</option>
                                  {!isSister ? (
                                    <>
                                      <optgroup label="A. Mass & Sacraments">
                                        <option value="mass">Holy Mass</option>
                                        <option value="concelebration">Concelebration</option>
                                        <option value="marriage">Marriage Mass</option>
                                        <option value="funeral">Funeral / Requiem Mass</option>
                                        <option value="confession">Confession Ministry</option>
                                        <option value="anointing">Anointing of the Sick</option>
                                      </optgroup>
                                      <option disabled style={{ fontSize: '6px', color: '#CBD5E1', lineHeight: '6px' }}>&nbsp;</option>
                                      <optgroup label="B. Paraliturgy & Blessings">
                                        <option value="adoration">Adoration Service</option>
                                        <option value="charismatic">Charismatic Prayer Service</option>
                                        <option value="house_blessing">House Blessing</option>
                                        <option value="recollection">Monthly Recollection Talk</option>
                                        <option value="retreat">Retreat</option>
                                      </optgroup>
                                    </>
                                  ) : (
                                    <optgroup label="C. Pastoral Ministries">
                                      <option value="catechism">Catechism</option>
                                      <option value="altar_decoration">Altar Decoration</option>
                                      <option value="anbiam">BCC / Anbiam Animation</option>
                                      <option value="house_visit">House Visit</option>
                                      <option value="communion_sick">Communion to Sick</option>
                                      <option value="choir">Choir Animation</option>
                                      <option value="others">Others</option>
                                    </optgroup>
                                  )}
                                </select>
                              );
                            })()}
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
                      </div>
                    )}
                  </div>
                );
              })()}

                {/* 3. PRIEST CARDS FEED */}
                <div className="roster-grid">
                  {(() => {
                    let displayBookings = [];
                    const isSister = user.title === 'Sr.' || user.clergy_type === 'convent' || user.clergy_type === 'convent_sister';

                    const nowMs = Date.now();

                    if (requestsTab === 'open') {
                      // 1. Explore feed: open community requests from others
                      const isCatCMinistry = (serviceType) => {
                        const s = (serviceType || '').toLowerCase();
                        return s.includes('catechism') || s.includes('sunday school') || s.includes('faith formation') ||
                               s.includes('altar decoration') || s.includes('decoration') ||
                               s.includes('anbiam') || s.includes('bcc') || s.includes('small christian community') ||
                               s.includes('house visit') || s.includes('home visit') || s.includes('family visit') ||
                               s.includes('communion to sick') || (s.includes('communion') && s.includes('sick')) ||
                               s.includes('choir') || s.includes('choir animation');
                      };

                      displayBookings = bookings.filter(b => {
                        if (b.status !== 'pending' || b.requester_id === user.id) return false;
                        const isCatC = isCatCMinistry(b.service_type);
                        if (isSister) {
                          // Sisters: ONLY Category C (Pastoral Ministries)
                          if (!isCatC) return false;
                        } else {
                          // Priests: ONLY Categories A & B (Sacraments & Paraliturgies, exclude Category C)
                          if (isCatC) return false;
                        }
                        // Radius filter
                        if (priestFilterRadius !== 'all') {
                          if (b.distance_km !== null && b.distance_km > priestFilterRadius) return false;
                        }
                        // Sacrament / Service filter
                        if (priestFilterService !== 'all') {
                          const s = (b.service_type || '').toLowerCase();
                          const f = priestFilterService.toLowerCase();
                          let match = false;
                          if (f === 'mass') match = s.includes('holy mass') || s.includes('mass');
                          else if (f === 'concelebration') match = s.includes('concelebration');
                          else if (f === 'marriage') match = s.includes('marriage') || s.includes('matrimony');
                          else if (f === 'funeral') match = s.includes('funeral') || s.includes('requiem');
                          else if (f === 'confession') match = s.includes('confession');
                          else if (f === 'anointing') match = s.includes('anointing') || s.includes('sick');
                          else if (f === 'adoration') match = s.includes('adoration');
                          else if (f === 'charismatic') match = s.includes('charismatic') || s.includes('prayer service');
                          else if (f === 'house_blessing') match = s.includes('house blessing') || s.includes('blessing');
                          else if (f === 'recollection') match = s.includes('recollection');
                          else if (f === 'retreat') match = s.includes('retreat');
                          else if (f === 'catechism') match = s.includes('catechism') || s.includes('sunday school');
                          else if (f === 'altar_decoration') match = s.includes('altar decoration') || s.includes('decoration');
                          else if (f === 'anbiam') match = s.includes('anbiam') || s.includes('bcc');
                          else if (f === 'house_visit') match = s.includes('house visit') || s.includes('family visit');
                          else if (f === 'communion_sick') match = s.includes('communion to sick') || (s.includes('communion') && s.includes('sick'));
                          else if (f === 'choir') match = s.includes('choir');
                          else if (f === 'others') match = s.includes('other');
                          else match = s.includes(f);
                          if (!match) return false;
                        }
                        // Language filter
                        if (priestFilterLanguage !== 'all') {
                          const l = (b.language || '').toLowerCase();
                          if (!l.includes(priestFilterLanguage.toLowerCase())) return false;
                        }
                        return true;
                      });
                    } else if (requestsTab === 'my_requests') {
                      // 2. My Requests: all pending active requests created by this user
                      displayBookings = bookings.filter(b => b.status === 'pending' && b.requester_id === user.id);
                    } else if (requestsTab === 'accepted') {
                      // 3. Confirmed: upcoming celebrations where user is either the requester OR the celebrant/minister
                      displayBookings = bookings.filter(b => {
                        if (b.responder_id !== user.id && b.requester_id !== user.id) return false;
                        if (b.status !== 'accepted' && b.status !== 'completed') return false;
                        if (b.status === 'completed') return false;
                        const endOrStart = b.datetime_end ? new Date(b.datetime_end).getTime() : new Date(b.datetime).getTime() + 3600000;
                        if (endOrStart < nowMs) return false;

                        // Role filter: 'all', 'serving' (celebrant), 'request' (requester)
                        if (confirmedRoleFilter === 'serving' && b.responder_id !== user.id) return false;
                        if (confirmedRoleFilter === 'request' && b.requester_id !== user.id) return false;

                        return true;
                      });
                    } else if (requestsTab === 'history') {
                      // 4. History: past completed celebrations & archives (requester OR celebrant OR withdrawn offer)
                      displayBookings = bookings.filter(b => {
                        const hasWithdrawn = (b.withdrawals || []).some(w => w.priest_id === user.id);
                        if (!hasWithdrawn && b.responder_id !== user.id && b.requester_id !== user.id) return false;
                        
                        let isEligible = hasWithdrawn;
                        if (!isEligible) {
                          if (b.status === 'completed') isEligible = true;
                          else if (b.status === 'accepted') {
                            const endOrStart = b.datetime_end ? new Date(b.datetime_end).getTime() : new Date(b.datetime).getTime() + 3600000;
                            isEligible = endOrStart < nowMs;
                          }
                        }
                        if (!isEligible) return false;

                        // Role filter: 'all', 'serving' (celebrant/withdrawn), 'request' (requester)
                        if (historyRoleFilter === 'serving') {
                          const isServing = b.responder_id === user.id || hasWithdrawn;
                          if (!isServing) return false;
                        } else if (historyRoleFilter === 'request') {
                          if (b.requester_id !== user.id) return false;
                        }

                        return true;
                      });
                    }

                    // -------------------------------------------------------------
                    // FINE-TUNED MULTI-FACTOR EXPLORE ALGORITHM
                    // Factors: Liturgical Language (35%), Distance & Travel Radius (20%),
                    //          Frequently Booked / Past Collaboration History (20%),
                    //          Favorited Minister / Parish Connection (15%),
                    //          Age Comfort Band (5%), Date Urgency (5%)
                    // -------------------------------------------------------------
                    const userLiturgicalLangs = Array.isArray(user.liturgical_languages) && user.liturgical_languages.length > 0
                      ? user.liturgical_languages.map(l => l.toLowerCase())
                      : (typeof user.liturgical_languages === 'string'
                          ? (() => { try { return JSON.parse(user.liturgical_languages).map(l => l.toLowerCase()); } catch(e) { return ['english', 'tamil']; } })()
                          : ['english', 'tamil']);

                    const userFavorites = Array.isArray(user.favorite_ministers)
                      ? user.favorite_ministers.map(Number)
                      : (typeof user.favorite_ministers === 'string'
                          ? (() => { try { return JSON.parse(user.favorite_ministers).map(Number); } catch(e) { return []; } })()
                          : []);

                    const userAge = calculateAge(user.dob);
                    const userMaxKm = Number(user.max_travel_km) || 25;

                    // Compute frequent collaborations: How many past bookings did user minister for each requester
                    const requesterHistoryCounts = {};
                    bookings.forEach(b => {
                      if (b.responder_id === user.id && (b.status === 'completed' || b.status === 'accepted')) {
                        const reqId = Number(b.requester_id);
                        if (reqId) {
                          requesterHistoryCounts[reqId] = (requesterHistoryCounts[reqId] || 0) + 1;
                        }
                      }
                    });

                    const computeExploreScore = (booking) => {
                      let score = 0;
                      const reasons = [];
                      const reqId = Number(booking.requester_id);
                      const pastCelebrationsCount = requesterHistoryCounts[reqId] || 0;
                      const isFrequent = pastCelebrationsCount >= 2;

                      // Factor 1: Liturgical Language Match (Weight: 35 points)
                      const bLang = (booking.language || 'English').toLowerCase();
                      const isLangMatch = userLiturgicalLangs.some(ul => bLang.includes(ul) || ul.includes(bLang));
                      if (isLangMatch) {
                        score += 35;
                        reasons.push(`${booking.language || 'English'} Match`);
                      }

                      // Factor 2: Distance & Personal Travel Radius (Weight: 20 points)
                      if (booking.distance_km !== null && booking.distance_km !== undefined) {
                        const dist = booking.distance_km;
                        if (dist <= 5) {
                          score += 20;
                          reasons.push('Very Close (≤5km)');
                        } else if (dist <= 15) {
                          score += 16;
                          reasons.push('Nearby (≤15km)');
                        } else if (dist <= userMaxKm) {
                          score += 12;
                          reasons.push(`Within Your ${userMaxKm}km Radius`);
                        } else {
                          // Decay score slightly if beyond personal preferred radius
                          score += Math.max(0, 8 - Math.round((dist - userMaxKm) / 5));
                        }
                      } else {
                        score += 8;
                      }

                      // Factor 3: Frequently Booked / Established Parish History (Weight: 20 points)
                      if (isFrequent) {
                        score += 20;
                        reasons.push(`Frequent (${pastCelebrationsCount} Past Ministries)`);
                      } else if (pastCelebrationsCount === 1) {
                        score += 10;
                        reasons.push('Previous Parish Collaborator');
                      }

                      // Factor 4: Mutual Favorite / Parish Connection (Weight: 15 points)
                      const isFavParish = userFavorites.includes(reqId);
                      if (isFavParish) {
                        score += 15;
                        reasons.push('★ Favorite Parish/Community');
                      }

                      // Factor 5: Minister Age Alignment / Pastoral Comfort (Weight: 5 points)
                      if (userAge !== null) {
                        if (userAge >= 70) {
                          if (booking.distance_km !== null && booking.distance_km <= 10) {
                            score += 5;
                            reasons.push('Comfortable Distance for Senior Clergy');
                          } else {
                            score += 2;
                          }
                        } else {
                          score += 5;
                        }
                      } else {
                        score += 4;
                      }

                      // Factor 6: Date Urgency & Freshness (Weight: 5 points)
                      if (booking.datetime) {
                        const daysAway = (new Date(booking.datetime).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                        if (daysAway >= 0 && daysAway <= 3) {
                          score += 5;
                          reasons.push('Upcoming Soon');
                        } else if (daysAway > 3 && daysAway <= 14) {
                          score += 3;
                        }
                      }

                      return { score, reasons, isFrequent, pastCelebrationsCount };
                    };

                    // Attach smart scores for rendering badges
                    displayBookings.forEach(b => {
                      const matchData = computeExploreScore(b);
                      b._smartScore = matchData.score;
                      b._matchReasons = matchData.reasons;
                      b._isFrequent = matchData.isFrequent;
                      b._pastCelebrationsCount = matchData.pastCelebrationsCount;
                    });

                    // Sorting execution
                    displayBookings.sort((a, b) => {
                      if (priestSortBy === 'smart_match') {
                        // Float active awaiting offers to the very top in Explore
                        const hasOfferedA = (a.applicants || []).some(ap => ap.priest_id === user.id) ? 1 : 0;
                        const hasOfferedB = (b.applicants || []).some(ap => ap.priest_id === user.id) ? 1 : 0;
                        if (hasOfferedB !== hasOfferedA) return hasOfferedB - hasOfferedA;

                        // Intelligent AI matching score highest first
                        if (b._smartScore !== a._smartScore) {
                          return b._smartScore - a._smartScore;
                        }
                        // Secondary tie-breaker: nearest date of celebration
                        return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
                      } else if (priestSortBy === 'awaiting_reply') {
                        // Posts where user is awaiting requester confirmation first
                        const hasOfferedA = (a.applicants || []).some(ap => ap.priest_id === user.id) ? 1 : 0;
                        const hasOfferedB = (b.applicants || []).some(ap => ap.priest_id === user.id) ? 1 : 0;
                        if (hasOfferedB !== hasOfferedA) return hasOfferedB - hasOfferedA;
                        return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
                      } else if (priestSortBy === 'frequently_booked') {
                        // Frequently collaborated requesters first
                        const countA = a._pastCelebrationsCount || 0;
                        const countB = b._pastCelebrationsCount || 0;
                        if (countB !== countA) return countB - countA;
                        return (b._smartScore || 0) - (a._smartScore || 0);
                      } else if (priestSortBy === 'distance_asc') {
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
                        // 'date_asc' (Earliest need date first)
                        const timeA = a.datetime ? new Date(a.datetime).getTime() : 0;
                        const timeB = b.datetime ? new Date(b.datetime).getTime() : 0;
                        return timeA - timeB;
                      }
                    });

                    // Invert sort order if user toggled Up (descending / reverse order)
                    if (priestSortOrder === 'desc') {
                      displayBookings.reverse();
                    }

                    const isFiltered = priestFilterRadius !== 25 || priestFilterService !== 'all' || priestFilterLanguage !== 'all' || priestSortBy !== 'smart_match' || priestSortOrder !== 'asc';

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
                              : requestsTab === 'my_requests'
                              ? 'No Ministry Requests Posted Yet'
                              : requestsTab === 'accepted'
                              ? 'No Confirmed Ministries Yet'
                              : 'No Past History in Records'}
                          </h4>
                          <p style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '440px', margin: '0 auto', marginBottom: '1rem' }}>
                            {requestsTab === 'open'
                              ? isFiltered
                                ? 'Try adjusting your distance slider, sacrament filter, or liturgical language to see more needs.'
                                : priestFilterRadius !== 'all'
                                ? `There are no requests within ${priestFilterRadius} km right now. Expand your travel distance to discover needs in nearby parishes.`
                                : isSister
                                ? 'No open pastoral needs (Anbiam, House Visit, Catechism) in the diocese right now. Check back soon.'
                                : 'All parishes and convents in the diocese are currently covered. Check back soon for new requests.'
                              : requestsTab === 'my_requests'
                              ? 'Need a priest or sister for Holy Mass, Retreat, Anbiam, or Catechism? Post a request to notify available ministers.'
                              : requestsTab === 'accepted'
                              ? 'Once a celebration is confirmed between you and another minister/parish, it appears here with 1-tap call, WhatsApp, and Google Maps directions.'
                              : 'Your past celebrated Masses, completed ministries, and archive records will appear here.'}
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

                          {requestsTab === 'accepted' && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setRequestsTab('open')}
                              style={{ borderRadius: '9999px', padding: '0.5rem 1.15rem', fontWeight: 600 }}
                            >
                              Explore Available Needs ↗
                            </button>
                          )}
                        </div>
                      );
                    }

                    return displayBookings.map((b) => {
                      const { date, time } = formatDateTime(b.datetime, b.datetime_end);
                      const isMyRequest = b.requester_id === user.id;
                      const isConfirmed = b.status === 'accepted' || b.status === 'completed';
                      const endOrStart = b.datetime_end ? new Date(b.datetime_end).getTime() : new Date(b.datetime).getTime() + 3600000;
                      const isPast = endOrStart < nowMs;
                      const isConfirmedPriest = b.responder_id === user.id;
                      const hasOffered = (b.applicants || []).some(a => a.priest_id === user.id);
                      const applicantsCount = (b.applicants || []).length;
                      const isWithdrawnByMe = (b.withdrawals || []).some(w => w.priest_id === user.id);
                      const myWithdrawalRecord = (b.withdrawals || []).find(w => w.priest_id === user.id);
                      const isHistoryBooking = isWithdrawnByMe || b.status === 'completed' || (b.status === 'accepted' && isPast) || requestsTab === 'history';
                      const urgency = (isConfirmed && !isHistoryBooking) ? getCelebrationUrgency(b.datetime) : null;
                      const rawService = b.service_type || 'Holy Mass';
                      const cleanServiceName = rawService.replace(/\s*\([^)]*\)/g, '').trim();

                      const contextualAvailableText = `${applicantsCount} available`;

                      return (
                        <div
                          className="priest-card"
                          key={b.id}
                          style={{
                            borderColor: isHistoryBooking ? '#E2E8F0' : isConfirmed ? '#BBF7D0' : hasOffered ? '#FDE68A' : '#E2E8F0',
                            background: isHistoryBooking ? '#F8FAFC' : isConfirmed ? '#F0FDF4' : '#FFFFFF',
                            boxShadow: isHistoryBooking ? '0 1px 3px rgba(0,0,0,0.04)' : isConfirmed ? '0 4px 14px rgba(22, 163, 74, 0.08)' : 'var(--shadow-sm)'
                          }}
                        >
                          {/* 1. PRIMARY CARD HEADER: MINISTRY TYPE + STATUS BADGE */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              {/* Prominent Ministry Title */}
                              <span style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.015em' }}>
                                {cleanServiceName}
                              </span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '2px 7px', borderRadius: '4px' }}>
                                {b.language || 'English'}
                              </span>
                              {requestsTab === 'open' && b._isFrequent && (
                                <span
                                  title={`Frequently Booked: You have celebrated ${b._pastCelebrationsCount} past ministries for this parish/requester`}
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    color: '#7C2D12',
                                    background: '#FFEDD5',
                                    border: '1px solid #FDBA74',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  <span>Frequent</span>
                                </span>
                              )}

                              {requestsTab === 'open' && b._smartScore >= 50 && (
                                <span
                                  title={b._matchReasons ? `Match breakdown: ${b._matchReasons.join(', ')}` : 'Recommended match'}
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    color: b._smartScore >= 70 ? '#15803D' : '#0369A1',
                                    background: b._smartScore >= 70 ? '#DCFCE7' : '#E0F2FE',
                                    border: b._smartScore >= 70 ? '1px solid #86EFAC' : '1px solid #BAE6FD',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  <span>{b._smartScore >= 70 ? 'Best Match' : 'Good Match'}</span>
                                </span>
                              )}
                            </div>

                            {/* Right Side Header: Status Tag & Edit Post Button for Requester */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isMyRequest && !isConfirmed && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditBookingModal(b);
                                  }}
                                  title="Edit ministry request details before confirmation (venue, date, time, language, notes)"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    color: '#2563EB',
                                    background: '#EFF6FF',
                                    border: '1px solid #BFDBFE',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#DBEAFE';
                                    e.currentTarget.style.borderColor = '#93C5FD';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#EFF6FF';
                                    e.currentTarget.style.borderColor = '#BFDBFE';
                                  }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  <span>Edit</span>
                                </button>
                              )}

                              {/* Status Tag (Contextual Addressing) */}
                              {isWithdrawnByMe ? (
                                <span
                                  title="You previously offered availability and subsequently withdrew your offer."
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    background: '#FEF2F2',
                                    color: '#DC2626',
                                    whiteSpace: 'nowrap',
                                    border: '1px solid #FECACA',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                  </svg>
                                  <span>Withdrawn</span>
                                </span>
                              ) : isHistoryBooking ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {/* Contextual Role Badge in History */}
                                  <span
                                    title={isConfirmedPriest ? "Celebrated by you." : "Posted by you for your parish or community."}
                                    style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      padding: '2px 7px',
                                      borderRadius: '9999px',
                                      background: isConfirmedPriest ? '#EFF6FF' : '#F5F3FF',
                                      color: isConfirmedPriest ? '#1D4ED8' : '#7C3AED',
                                      border: isConfirmedPriest ? '1px solid #BFDBFE' : '1px solid #DDD6FE',
                                      whiteSpace: 'nowrap',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    <span>{isConfirmedPriest ? '🤝 Celebrated' : '📋 My Request'}</span>
                                  </span>

                                  <span
                                    title="Completed and celebrated. Preserved for canonical and parish records."
                                    style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: '#F1F5F9', color: '#475569', whiteSpace: 'nowrap', border: '1px solid #CBD5E1', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                  >
                                    ✓ Completed
                                  </span>
                                </div>
                              ) : isConfirmed ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {/* Contextual Role Badge */}
                                  <span
                                    title={isConfirmedPriest ? "You offered availability and were confirmed as the celebrating minister." : "You posted this request and confirmed a minister."}
                                    style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      padding: '2px 7px',
                                      borderRadius: '9999px',
                                      background: isConfirmedPriest ? '#EFF6FF' : '#F5F3FF',
                                      color: isConfirmedPriest ? '#1D4ED8' : '#7C3AED',
                                      border: isConfirmedPriest ? '1px solid #BFDBFE' : '1px solid #DDD6FE',
                                      whiteSpace: 'nowrap',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    <span>{isConfirmedPriest ? '🤝 Serving' : '📋 My Request'}</span>
                                  </span>

                                  <span
                                    title="Celebration confirmed & locked. Cannot be edited or deleted online. Any adjustments must be made directly with the minister via Call or WhatsApp."
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      padding: '2px 8px',
                                      borderRadius: '9999px',
                                      background: '#DCFCE7',
                                      color: '#15803D',
                                      whiteSpace: 'nowrap',
                                      border: '1px solid #86EFAC',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <span>Confirmed</span>
                                  </span>
                                </div>
                              ) : hasOffered ? (
                                <span
                                  title="Availability submitted. Awaiting confirmation from requester."
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    background: '#FEFCE8',
                                    color: '#854D0E',
                                    whiteSpace: 'nowrap',
                                    border: '1px solid #FDE047',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#854D0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <span>Awaiting</span>
                                </span>
                              ) : isMyRequest && applicantsCount > 0 ? (
                                <span
                                  title={`${applicantsCount} minister(s) responded & available to celebrate`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.78rem',
                                    fontWeight: 800,
                                    color: '#DC2626',
                                    background: '#FEF2F2',
                                    border: '1.5px solid #FECACA',
                                    padding: '2px 9px',
                                    borderRadius: '9999px',
                                    boxShadow: '0 1px 3px rgba(220, 38, 38, 0.12)'
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                                    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                                    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                                  </svg>
                                  <span>{applicantsCount}</span>
                                </span>
                              ) : isMyRequest && applicantsCount === 0 ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', background: '#FFFBEB', color: '#B45309', whiteSpace: 'nowrap', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <span>Waiting for Response</span>
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* 2. DATE, TIME & VENUE ADDRESS (THE CORE 4 PRIEST SCANNING DETAILS) */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.6rem 0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            {/* Date & Urgency Row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              <span>{date}</span>
                              {urgency && (
                                <span className={`urgency-pill ${urgency.badgeClass}`} style={{ fontSize: '0.66rem', padding: '1px 6px', marginLeft: '2px' }}>
                                  {urgency.isPulsing && <span className="urgency-pulse-dot"></span>}
                                  {urgency.label}
                                </span>
                              )}
                            </div>

                            {/* Dedicated Time Window Row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: '#0369A1', fontWeight: 700 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              <span>{time}</span>
                            </div>

                            {/* Location / Address Row (1-Tap Direct Map Navigation) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.84rem' }}>
                              {b.location ? (
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.location)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Click to open directions in Google Maps"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: 600,
                                    color: '#0F172A',
                                    textDecoration: 'none',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#2563EB';
                                    e.currentTarget.style.textDecoration = 'underline';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#0F172A';
                                    e.currentTarget.style.textDecoration = 'none';
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                  </svg>
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {b.location}
                                  </span>
                                </a>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#64748B' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                  </svg>
                                  <span>Parish Church / Chapel</span>
                                </span>
                              )}

                            </div>
                          </div>

                          {/* 3. OPTIONAL NOTE (if present) */}
                          {b.notes && (
                            <div style={{ fontSize: '0.76rem', color: '#475569', fontStyle: 'italic', background: '#FAF5FF', borderLeft: '3px solid #C084FC', padding: '0.35rem 0.65rem', borderRadius: '0 6px 6px 0', lineHeight: 1.4 }}>
                              "{b.notes}"
                            </div>
                          )}

                          {/* CASE 1: CONFIRMED OR COMPLETED CELEBRATION - ACTION HUB */}
                          {isConfirmed && (() => {
                            const personPhoto = isConfirmedPriest ? b.requester_photo : b.responder_photo;
                            const personTitle = isConfirmedPriest ? b.requester_title || 'Sr.' : b.responder_title || 'Fr.';
                            const personName = isConfirmedPriest ? b.requester_name : b.responder_name;
                            const personCongregation = isConfirmedPriest ? b.requester_congregation_abbr : b.responder_congregation_abbr;
                            const personClergyType = isConfirmedPriest ? b.requester_clergy_type : b.responder_clergy_type;
                            const personDiocese = isConfirmedPriest ? (b.requester_order || b.requester_diocese) : (b.responder_order || b.responder_diocese);
                            const roleLabel = isConfirmedPriest ? 'Requested by' : (isHistoryBooking ? 'Celebrated by' : 'Confirmed celebrant');
                            const otherPersonId = isConfirmedPriest ? b.requester_id : b.responder_id;
                            const isPersonFav = Array.isArray(user.favorites) && user.favorites.includes(otherPersonId);

                            return (
                              <div style={{ marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid #E2E8F0' }}>
                                {/* 1. REQUESTER / CONFIRMED PERSON IDENTITY ROW (Above Contact Buttons) */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '0.65rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                                    <div className="avatar-badge" style={{ width: '36px', height: '36px', borderColor: '#CBD5E1', flexShrink: 0, borderRadius: '9999px', overflow: 'hidden' }}>
                                      {personPhoto ? (
                                        <img src={personPhoto} alt={personName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        renderDefaultAvatar(personTitle, personClergyType, 18)
                                      )}
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <div style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.2 }}>
                                        {roleLabel}
                                      </div>
                                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {formatEcclesiasticalName(personTitle, personName, personCongregation)}
                                      </div>
                                      {personDiocese && (
                                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {personDiocese}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    {isMyRequest && otherPersonId && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleFavorite(otherPersonId, formatEcclesiasticalName(personTitle, personName, personCongregation));
                                        }}
                                        title={isPersonFav ? 'Favorited minister (click to remove)' : 'Add to favorite ministers for quick future invites'}
                                        style={{
                                          background: isPersonFav ? '#FEF08A' : '#F8FAFC',
                                          border: isPersonFav ? '1px solid #EAB308' : '1px solid #CBD5E1',
                                          color: isPersonFav ? '#854D0E' : '#64748B',
                                          borderRadius: '9999px',
                                          padding: '2px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 700,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <span>{isPersonFav ? '★ Fav' : '☆ Favorite'}</span>
                                      </button>
                                    )}

                                    {isHistoryBooking && (
                                      <span style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '9999px',
                                        background: '#F1F5F9',
                                        color: '#475569',
                                        border: '1px solid #CBD5E1',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        Archived
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* 2. 1-Tap Quick Action Row (Call, WhatsApp, Map, Calendar) */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                                  <a
                                    href={`tel:${isConfirmedPriest ? b.requester_mobile : b.responder_mobile}`}
                                    className="btn btn-call btn-sm"
                                    style={{ padding: '0.42rem 0.2rem', fontWeight: 600, fontSize: '0.74rem', justifyContent: 'center' }}
                                    title="Call directly"
                                  >
                                    Call
                                  </a>

                                  <a
                                    href={getWhatsAppLink(
                                      isConfirmedPriest ? b.requester_mobile : b.responder_mobile,
                                      buildWhatsAppCelebrationMessage(b, !isHistoryBooking)
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="wa-btn"
                                    style={{ padding: '0.42rem 0.2rem', fontWeight: 600, fontSize: '0.74rem', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }}
                                    title="Message on WhatsApp"
                                  >
                                    WhatsApp
                                  </a>

                                  {b.location ? (
                                    <a
                                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.location)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '0.42rem 0.2rem', fontWeight: 600, fontSize: '0.74rem', justifyContent: 'center', background: '#FFFFFF', borderColor: '#CBD5E1' }}
                                      title="Open Google Maps Directions"
                                    >
                                      Map
                                    </a>
                                  ) : (
                                    <div></div>
                                  )}

                                  <a
                                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${cleanServiceName} - ${b.location || 'Parish'}`)}&dates=${(() => {
                                      const d = new Date(b.datetime);
                                      const dEnd = new Date(b.datetime_end || d.getTime() + 3600000);
                                      const fmt = dt => dt.toISOString().replace(/-|:|\.\d\d\d/g, '');
                                      return `${fmt(d)}/${fmt(dEnd)}`;
                                    })()}&details=${encodeURIComponent(`Confirmed ministry with ${formatEcclesiasticalName(isConfirmedPriest ? b.requester_title || 'Sr.' : b.responder_title || 'Fr.', isConfirmedPriest ? b.requester_name : b.responder_name, isConfirmedPriest ? b.requester_congregation_abbr : b.responder_congregation_abbr)}. Contact: ${isConfirmedPriest ? b.requester_mobile : b.responder_mobile}`)}&location=${encodeURIComponent(b.location || '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '0.42rem 0.2rem', fontWeight: 600, fontSize: '0.74rem', justifyContent: 'center', background: '#FFFFFF', borderColor: '#CBD5E1' }}
                                    title="Add celebration to Google Calendar"
                                  >
                                    Calendar
                                  </a>
                                </div>

                                {!isHistoryBooking && (
                                  <div
                                    style={{
                                      marginTop: '0.55rem',
                                      padding: '0.35rem 0.6rem',
                                      background: '#F8FAFC',
                                      border: '1px solid #E2E8F0',
                                      borderRadius: '6px',
                                      fontSize: '0.72rem',
                                      color: '#64748B',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      lineHeight: 1.35
                                    }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="16" x2="12" y2="12" />
                                      <line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                    <span>
                                      Confirmed bookings cannot be edited online. If you need any change, please contact the concerned person directly via Call or WhatsApp.
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* CASE 2: OPEN REQUEST FROM OTHERS - 1-TAP "I AM AVAILABLE" OR "WITHDRAW" (PRIESTS OR SISTERS FOR PASTORAL MINISTRIES) */}
                          {!isConfirmed && !isMyRequest && user.is_verified === 1 && (() => {
                            const serviceStr = (b.service_type || '').toLowerCase();
                            const isNonSacr = ['catechism', 'altar decoration', 'decoration', 'anbiam', 'bcc', 'house visit', 'communion to sick', 'choir'].some(k => serviceStr.includes(k));
                            const canVolunteer = (user.title === 'Fr.' || (!user.title && user.clergy_type !== 'convent' && user.clergy_type !== 'convent_sister')) || (isSister && isNonSacr);
                            
                            if (!canVolunteer) return null;

                            return (
                              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                                {isWithdrawnByMe ? (
                                  <div style={{
                                    background: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: 'var(--radius-sm)',
                                    textAlign: 'center'
                                  }}>
                                    <div style={{ color: '#DC2626', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                      You withdrew your availability
                                    </div>
                                    <div style={{ fontSize: '0.74rem', color: '#7F1D1D', marginBottom: b.status === 'pending' ? '0.45rem' : 0 }}>
                                      {myWithdrawalRecord?.withdrawn_at ? `Withdrawn on ${new Date(myWithdrawalRecord.withdrawn_at).toLocaleDateString()}` : 'Archived in your ministry records.'}
                                    </div>
                                    {b.status === 'pending' && (
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleOfferMinistry(b.id)}
                                        style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem', fontWeight: 600, background: '#FFFFFF', borderColor: '#FCA5A5', color: '#991B1B' }}
                                      >
                                        Re-Offer Availability
                                      </button>
                                    )}
                                  </div>
                                ) : hasOffered ? (() => {
                                  const myApp = (b.applicants || []).find(a => a.priest_id === user.id);
                                  const hasEditNotice = myApp && myApp.has_post_edit;
                                  return (
                                    <div style={{
                                      background: hasEditNotice ? '#FEF2F2' : '#FFFDF5',
                                      border: hasEditNotice ? '1.5px solid #FCA5A5' : '1px solid #FDE68A',
                                      padding: '0.65rem 0.85rem',
                                      borderRadius: 'var(--radius-sm)'
                                    }}>
                                      {hasEditNotice ? (
                                        <div style={{ marginBottom: '0.55rem' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#991B1B', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                              <line x1="12" y1="9" x2="12" y2="13" />
                                              <line x1="12" y1="17" x2="12.01" y2="17" />
                                            </svg>
                                            <span>Request Info Was Recently Edited</span>
                                          </div>
                                          {myApp.last_edit_notice && (
                                            <div style={{ fontSize: '0.74rem', color: '#7F1D1D', background: '#FEE2E2', padding: '0.35rem 0.55rem', borderRadius: '4px', marginBottom: '0.45rem', lineHeight: '1.4' }}>
                                              {myApp.last_edit_notice}
                                            </div>
                                          )}
                                          <div style={{ fontSize: '0.74rem', color: '#B91C1C', marginBottom: '0.45rem', lineHeight: '1.35' }}>
                                            Please review the updated date, time, or venue above. If you are no longer available for these new details, you can withdraw your offer below.
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div style={{ color: '#92400E', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.35rem', textAlign: 'center' }}>
                                            ✓ Marked as available for this ministry
                                          </div>
                                          <div style={{ fontSize: '0.75rem', color: '#78350F', textAlign: 'center', marginBottom: '0.5rem' }}>
                                            Awaiting Requester to review and confirm.
                                          </div>
                                        </>
                                      )}
                                      <div style={{ textAlign: 'center' }}>
                                        <button
                                          type="button"
                                          onClick={() => handleWithdrawOffer(b.id)}
                                          style={{
                                            background: hasEditNotice ? '#DC2626' : 'none',
                                            border: hasEditNotice ? 'none' : 'none',
                                            color: hasEditNotice ? '#FFFFFF' : '#DC2626',
                                            padding: hasEditNotice ? '0.4rem 0.85rem' : '0',
                                            borderRadius: hasEditNotice ? '6px' : '0',
                                            fontSize: hasEditNotice ? '0.78rem' : '0.76rem',
                                            cursor: 'pointer',
                                            textDecoration: hasEditNotice ? 'none' : 'underline',
                                            fontWeight: 700
                                          }}
                                        >
                                          ✕ Withdraw my availability
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })() : (
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
                                    {isSister ? 'I Can Lead / Assist' : 'I Am Available to Celebrate'}
                                  </button>
                                )}
                              </div>
                            );
                          })()}

                           {/* CASE 3: MY REQUEST (OWN POST) - REVIEW APPLICANTS & CONFIRM */}
                          {!isConfirmed && isMyRequest && (
                            <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px dashed #CBD5E1' }}>
                              {applicantsCount > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                  {/* Visible Break & Available Option Header */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{
                                        fontSize: '0.74rem',
                                        fontWeight: 800,
                                        color: '#1D4ED8',
                                        background: '#EFF6FF',
                                        border: '1px solid #BFDBFE',
                                        padding: '3px 10px',
                                        borderRadius: '9999px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                      }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB' }}></span>
                                        {applicantsCount} {applicantsCount === 1 ? 'Minister Available' : 'Ministers Available'}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                                      Select & Confirm below ↴
                                    </span>
                                  </div>
                                  {(() => {
                                    const userFavs = Array.isArray(user?.favorite_ministers) ? user.favorite_ministers : [];
                                    const sortedApplicants = [...(b.applicants || [])].sort((a, bCand) => {
                                      const isAFav = userFavs.includes(Number(a.priest_id));
                                      const isBFav = userFavs.includes(Number(bCand.priest_id));
                                      if (isAFav && !isBFav) return -1;
                                      if (!isAFav && isBFav) return 1;
                                      return 0;
                                    });

                                    return sortedApplicants.map(cand => {
                                      const isCandSister = cand.priest_title === 'Sr.' || cand.clergy_type === 'convent' || cand.clergy_type === 'convent_sister';
                                      const candDisplayName = formatEcclesiasticalName(cand.priest_title || (isCandSister ? 'Sr.' : 'Fr.'), cand.priest_name, cand.congregation_abbr);
                                      const candAffiliation = cand.clergy_type === 'religious' ? (cand.congregation_abbr || cand.religious_order) : cand.diocese_province;
                                      const candAge = cand.age !== undefined && cand.age !== null ? cand.age : calculateAge(cand.dob);
                                      const isFav = userFavs.includes(Number(cand.priest_id));

                                      return (
                                        <div
                                          key={cand.priest_id}
                                          style={{
                                            background: isFav ? '#FEFCE8' : '#FFFFFF',
                                            border: isFav ? '1.5px solid #FDE047' : '1.5px solid #E2E8F0',
                                            borderRadius: '12px',
                                            padding: '0.75rem 0.85rem',
                                            boxShadow: isFav ? '0 2px 6px rgba(234, 179, 8, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.65rem'
                                          }}
                                        >
                                        {/* Row 1: Minister Identity (Clickable to open profile) */}
                                        <div
                                          onClick={() => setViewMinisterModal({ minister: cand, booking: b })}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            cursor: 'pointer'
                                          }}
                                          title="Tap to view ecclesiastical profile"
                                        >
                                          <div
                                            style={{
                                              position: 'relative',
                                              width: '44px',
                                              height: '44px',
                                              borderRadius: '9999px',
                                              flexShrink: 0,
                                              overflow: 'hidden',
                                              border: '2px solid #CBD5E1',
                                              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                                            }}
                                          >
                                            {cand.profile_photo ? (
                                              <img src={cand.profile_photo} alt={cand.priest_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', color: '#475569' }}>
                                                {renderDefaultAvatar(cand.priest_title || (isCandSister ? 'Sr.' : 'Fr.'), cand.clergy_type, 24)}
                                              </div>
                                            )}
                                            <span
                                              style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                background: '#16A34A',
                                                color: '#FFF',
                                                borderRadius: '9999px',
                                                width: '13px',
                                                height: '13px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '8px',
                                                border: '1.5px solid #FFF'
                                              }}
                                            >
                                              ✓
                                            </span>
                                          </div>

                                          <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                                                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                  {candDisplayName}
                                                </span>
                                                {isFav && (
                                                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#854D0E', background: '#FEF9C3', border: '1px solid #FDE047', padding: '1px 6px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                    ★ Favorite
                                                  </span>
                                                )}
                                              </div>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleToggleFavorite(cand.priest_id, candDisplayName);
                                                }}
                                                title={isFav ? "Remove from favorite ministers" : "Save as favorite minister for future requests"}
                                                style={{
                                                  background: 'none',
                                                  border: 'none',
                                                  cursor: 'pointer',
                                                  padding: '2px',
                                                  fontSize: '1.05rem',
                                                  color: isFav ? '#EAB308' : '#CBD5E1',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  transition: 'transform 0.15s ease'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                              >
                                                {isFav ? '★' : '☆'}
                                              </button>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#64748B', marginTop: '2px', flexWrap: 'wrap' }}>
                                              {candAffiliation && (
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                  {candAffiliation}
                                                </span>
                                              )}
                                              {candAge !== null && (
                                                <span style={{ color: '#92400E', background: '#FEF3C7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}>
                                                  {candAge} yrs
                                                </span>
                                              )}
                                              {cand.distance_km !== null && (
                                                <span style={{ color: '#059669', fontWeight: 600, flexShrink: 0 }}>
                                                  • {cand.distance_km} km
                                                </span>
                                              )}
                                              {(() => {
                                                const modes = Array.isArray(cand.transport_modes) && cand.transport_modes.length > 0
                                                  ? cand.transport_modes
                                                  : (cand.transport_mode ? [cand.transport_mode] : []);
                                                if (modes.length === 0) return null;
                                                const icons = modes.map(m => {
                                                  const opt = TRANSPORT_OPTIONS.find(o => o.id === m);
                                                  return opt ? opt.icon : '🚗';
                                                }).slice(0, 3);
                                                return (
                                                  <span style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }} title={modes.join(', ')}>
                                                    {icons.join(' ')}{modes.length > 3 ? ` +${modes.length - 3}` : ''}
                                                  </span>
                                                );
                                              })()}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Row 2: Clean Actions Bar (View Profile, Contact, Confirm) */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '0.45rem', borderTop: '1px solid #F1F5F9' }}>
                                          <button
                                            type="button"
                                            onClick={() => setViewMinisterModal({ minister: cand, booking: b })}
                                            style={{
                                              background: 'transparent',
                                              border: 'none',
                                              color: '#0284C7',
                                              fontSize: '0.76rem',
                                              fontWeight: 600,
                                              cursor: 'pointer',
                                              padding: '0',
                                              textDecoration: 'underline'
                                            }}
                                          >
                                            View Profile ↗
                                          </button>

                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {cand.priest_mobile && (
                                              <>
                                                <a
                                                  href={`tel:${cand.priest_mobile}`}
                                                  className="btn btn-call btn-sm"
                                                  style={{ width: '32px', height: '32px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                                                  title={`Call ${candDisplayName}`}
                                                >
                                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                                  </svg>
                                                </a>
                                                <a
                                                  href={getWhatsAppLink(cand.priest_mobile, buildWhatsAppCelebrationMessage(b, false, cand.priest_name))}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="wa-btn"
                                                  style={{ width: '32px', height: '32px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                                                  title={`WhatsApp ${candDisplayName}`}
                                                >
                                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                                  </svg>
                                                </a>
                                              </>
                                            )}
                                            <button
                                              type="button"
                                              className="btn btn-primary btn-sm"
                                              onClick={() => handleConfirmApplicant(b.id, cand.priest_id, cand.priest_name)}
                                              style={{
                                                padding: '0.4rem 0.85rem',
                                                fontSize: '0.8rem',
                                                fontWeight: 800,
                                                background: '#16A34A',
                                                borderColor: '#15803D',
                                                whiteSpace: 'nowrap',
                                                borderRadius: '6px',
                                                boxShadow: '0 1px 2px rgba(22, 163, 74, 0.25)'
                                              }}
                                            >
                                              ✓ Confirm
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      );
                                    });
                                  })()}
                                </div>
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

        {/* --- SUPER-ADMIN CONTROL SUITE --- */}
        {user.is_admin === 1 && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {/* Super Admin Header & Quick Stats */}
            <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem', background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🛡️</span>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', fontFamily: 'Outfit' }}>
                      Super-Admin Control Suite
                    </h2>
                    <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#92400E', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', border: '1px solid #FDE68A' }}>
                      Master Access
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#64748B' }}>
                    Complete diocesan authority: manage priests, sisters, liturgical bookings, and live database tables.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={fetchAdminData}
                    disabled={adminLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
                  >
                    <span>🔄</span>
                    <span>{adminLoading ? 'Refreshing...' : 'Refresh Live Data'}</span>
                  </button>

                  <a
                    href="/api/admin/database/download-backup"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', padding: '0.5rem 0.85rem', textDecoration: 'none', background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}
                  >
                    <span>💾</span>
                    <span>Download DB Backup (.json)</span>
                  </a>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
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
                    style={{ background: '#16A34A', borderColor: '#15803D', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
                  >
                    <span>➕</span>
                    <span>Register Clergy / Sister</span>
                  </button>
                </div>
              </div>

              {/* Quick Health & Stats Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Total Registered</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{adminDbSnapshot?.stats?.total_users || adminUsers.length} Users</div>
                </div>
                <div style={{ background: '#F0FDF4', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 600 }}>Verified Clergy</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803D' }}>{adminDbSnapshot?.stats?.verified_users || adminUsers.filter(u => u.is_verified === 1).length}</div>
                </div>
                <div style={{ background: '#FEF2F2', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #FECACA' }}>
                  <div style={{ fontSize: '0.74rem', color: '#991B1B', fontWeight: 600 }}>Pending Queue</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#DC2626' }}>{pendingUsers.length}</div>
                </div>
                <div style={{ background: '#EFF6FF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                  <div style={{ fontSize: '0.74rem', color: '#1E40AF', fontWeight: 600 }}>Total Bookings</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>{adminDbSnapshot?.stats?.total_bookings || bookings.length}</div>
                </div>
                <div style={{ background: '#FAF5FF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
                  <div style={{ fontSize: '0.74rem', color: '#6B21A8', fontWeight: 600 }}>Database Sync</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: adminDbSnapshot?.stats?.turso_connected ? '#16A34A' : '#D97706', marginTop: '4px' }}>
                    {adminDbSnapshot?.stats?.turso_connected ? '⚡ Turso Cloud' : '📁 Local SQLite/JSON'}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Sub-Tabs Navigation */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
              <button
                type="button"
                onClick={() => setAdminTab('directory')}
                style={{
                  padding: '0.65rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: adminTab === 'directory' ? '3px solid #2563EB' : '3px solid transparent',
                  color: adminTab === 'directory' ? '#2563EB' : '#64748B',
                  fontWeight: adminTab === 'directory' ? 800 : 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>👥</span>
                <span>Clergy &amp; Convent Directory</span>
                <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '999px' }}>
                  {adminUsers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('bookings')}
                style={{
                  padding: '0.65rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: adminTab === 'bookings' ? '3px solid #2563EB' : '3px solid transparent',
                  color: adminTab === 'bookings' ? '#2563EB' : '#64748B',
                  fontWeight: adminTab === 'bookings' ? 800 : 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>📋</span>
                <span>All Diocesan Bookings</span>
                <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '999px' }}>
                  {adminBookings.length || bookings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('verification')}
                style={{
                  padding: '0.65rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: adminTab === 'verification' ? '3px solid #2563EB' : '3px solid transparent',
                  color: adminTab === 'verification' ? '#2563EB' : '#64748B',
                  fontWeight: adminTab === 'verification' ? 800 : 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>🛡️</span>
                <span>Pending Approvals</span>
                {pendingUsers.length > 0 && (
                  <span style={{ fontSize: '0.72rem', background: '#DC2626', color: '#FFFFFF', padding: '1px 6px', borderRadius: '999px', fontWeight: 800 }}>
                    {pendingUsers.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('database')}
                style={{
                  padding: '0.65rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: adminTab === 'database' ? '3px solid #2563EB' : '3px solid transparent',
                  color: adminTab === 'database' ? '#2563EB' : '#64748B',
                  fontWeight: adminTab === 'database' ? 800 : 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>💾</span>
                <span>Live Database Tables</span>
                <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>
                  Raw View
                </span>
              </button>
            </div>

            {/* TAB 1: CLERGY & CONVENT DIRECTORY */}
            {adminTab === 'directory' && (
              <div>
                {/* Search & Filter Bar */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 260px', position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="🔍 Search priest or sister by name, mobile, parish, order..."
                      value={adminUserSearch}
                      onChange={(e) => setAdminUserSearch(e.target.value)}
                      style={{ paddingLeft: '1rem', background: '#FFFFFF', borderRadius: '8px' }}
                    />
                    {adminUserSearch && (
                      <button
                        type="button"
                        onClick={() => setAdminUserSearch('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['all', 'priest', 'sister', 'admin'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        className={`filter-chip ${adminUserRoleFilter === role ? 'active' : ''}`}
                        onClick={() => setAdminUserRoleFilter(role)}
                        style={{ textTransform: 'capitalize', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                      >
                        {role === 'all' ? 'All Roles' : role === 'priest' ? 'Priests (Fr.)' : role === 'sister' ? 'Sisters (Sr.)' : 'Super Admins'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Directory List / Table */}
                {(() => {
                  const filtered = adminUsers.filter((u) => {
                    const q = adminUserSearch.toLowerCase().trim();
                    const matchesSearch = !q ||
                      (u.name && u.name.toLowerCase().includes(q)) ||
                      (u.mobile && u.mobile.includes(q)) ||
                      (u.email && u.email.toLowerCase().includes(q)) ||
                      (u.diocese_province && u.diocese_province.toLowerCase().includes(q)) ||
                      (u.religious_order && u.religious_order.toLowerCase().includes(q)) ||
                      (u.residence_name && u.residence_name.toLowerCase().includes(q));

                    if (!matchesSearch) return false;

                    if (adminUserRoleFilter === 'priest') return u.title === 'Fr.' || u.clergy_type === 'religious' || u.clergy_type === 'diocesan';
                    if (adminUserRoleFilter === 'sister') return u.title === 'Sr.' || u.clergy_type === 'convent' || u.clergy_type === 'convent_sister';
                    if (adminUserRoleFilter === 'admin') return u.is_admin === 1;
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="no-data" style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2.5rem' }}>
                        <div className="no-data-icon">🔍</div>
                        <p>No clergy or sisters found matching "{adminUserSearch}".</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
                      {filtered.map((u) => (
                        <div
                          key={u.id}
                          className="glass-card"
                          style={{
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            border: u.is_admin === 1 ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                            padding: '1.15rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 6px rgba(15,23,42,0.04)'
                          }}
                        >
                          <div>
                            {/* Card Top: Avatar, Name, Status Pill */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {u.profile_photo ? (
                                    <img src={u.profile_photo} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    renderDefaultAvatar(u.title, u.clergy_type, 26)
                                  )}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{formatEcclesiasticalName(u)}</span>
                                    {u.is_admin === 1 && (
                                      <span style={{ fontSize: '0.65rem', background: '#FEF3C7', color: '#92400E', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                    ID: #{u.id} &bull; {u.clergy_type || 'Clergy'}
                                  </span>
                                </div>
                              </div>

                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontWeight: 700,
                                  background: u.is_verified === 1 ? '#DCFCE7' : '#FEE2E2',
                                  color: u.is_verified === 1 ? '#15803D' : '#DC2626'
                                }}
                              >
                                {u.is_verified === 1 ? '✓ Verified' : '⏳ Pending'}
                              </span>
                            </div>

                            {/* Details Grid */}
                            <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px', background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
                              <div>📱 <strong>Mobile:</strong> <a href={`tel:${u.mobile}`} style={{ color: '#2563EB', textDecoration: 'none' }}>{u.mobile}</a></div>
                              {u.email && <div>✉️ <strong>Email:</strong> {u.email}</div>}
                              <div>⛪ <strong>Diocese/Order:</strong> {u.clergy_type === 'religious' ? (u.religious_order || 'Religious') : (u.diocese_province || 'Diocesan')}</div>
                              <div>📍 <strong>Residence:</strong> {u.residence_name ? `${u.residence_name}, ` : ''}{u.residence_address || 'No address set'}</div>
                              <div style={{ display: 'flex', gap: '12px', marginTop: '3px', fontSize: '0.75rem', color: '#64748B' }}>
                                <span>🤝 Celebrated: <strong>{u.ministries_celebrated || 0}</strong></span>
                                <span>📋 Posted: <strong>{u.requests_posted || 0}</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Admin Action Toolbar */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setAdminEditingUser({ ...u })}
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', flex: '1 1 auto' }}
                            >
                              ✏️ Edit Profile
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setAdminPasswordResetModal({ user: u, newPass: 'Jesus@123' })}
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', flex: '1 1 auto' }}
                            >
                              🔑 Reset Pass
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleAdminToggleRole(u.id, 'is_verified', u.is_verified === 1)}
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: u.is_verified === 1 ? '#D97706' : '#16A34A' }}
                            >
                              {u.is_verified === 1 ? 'Suspend' : 'Verify'}
                            </button>

                            {u.id !== user.id && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleAdminToggleRole(u.id, 'is_admin', u.is_admin === 1)}
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: u.is_admin === 1 ? '#6B21A8' : '#2563EB' }}
                              >
                                {u.is_admin === 1 ? 'Demote Admin' : 'Make Admin'}
                              </button>
                            )}

                            {u.id !== user.id && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleAdminDeleteUser(u.id, u.name)}
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.55rem', color: '#DC2626', borderColor: '#FECACA' }}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 2: ALL DIOCESAN BOOKINGS */}
            {adminTab === 'bookings' && (
              <div>
                {/* Search & Filter Bar */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 260px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="🔍 Search bookings by location, priest, service, intention..."
                      value={adminBookingSearch}
                      onChange={(e) => setAdminBookingSearch(e.target.value)}
                      style={{ background: '#FFFFFF', borderRadius: '8px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['all', 'pending', 'accepted', 'completed'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`filter-chip ${adminBookingStatusFilter === status ? 'active' : ''}`}
                        onClick={() => setAdminBookingStatusFilter(status)}
                        style={{ textTransform: 'capitalize', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                      >
                        {status === 'all' ? 'All Bookings' : status === 'pending' ? 'Open Requests' : status === 'accepted' ? 'Confirmed' : 'Concluded'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bookings List */}
                {(() => {
                  const sourceBookings = adminBookings.length > 0 ? adminBookings : bookings;
                  const filteredBookings = sourceBookings.filter((b) => {
                    const q = adminBookingSearch.toLowerCase().trim();
                    const matchesSearch = !q ||
                      (b.service_type && b.service_type.toLowerCase().includes(q)) ||
                      (b.location && b.location.toLowerCase().includes(q)) ||
                      (b.requester_name && b.requester_name.toLowerCase().includes(q)) ||
                      (b.responder_name && b.responder_name.toLowerCase().includes(q)) ||
                      (b.notes && b.notes.toLowerCase().includes(q));

                    if (!matchesSearch) return false;
                    if (adminBookingStatusFilter !== 'all' && b.status !== adminBookingStatusFilter) return false;
                    return true;
                  });

                  if (filteredBookings.length === 0) {
                    return (
                      <div className="no-data" style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2.5rem' }}>
                        <div className="no-data-icon">📋</div>
                        <p>No bookings found matching filter criteria.</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {filteredBookings.map((b) => {
                        const { date, time } = formatDateTime(b.datetime, b.datetime_end);
                        return (
                          <div
                            key={b.id}
                            className="glass-card"
                            style={{
                              background: '#FFFFFF',
                              borderRadius: '10px',
                              border: '1px solid #E2E8F0',
                              padding: '1rem 1.25rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}
                          >
                            <div style={{ flex: '1 1 340px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0F172A' }}>
                                  {b.service_type || 'Holy Mass'}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    background: b.status === 'accepted' ? '#DCFCE7' : b.status === 'pending' ? '#FEF3C7' : '#F1F5F9',
                                    color: b.status === 'accepted' ? '#15803D' : b.status === 'pending' ? '#92400E' : '#475569'
                                  }}
                                >
                                  {b.status.toUpperCase()}
                                </span>
                                <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Ticket #{b.id}</span>
                              </div>

                              <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                <span>📅 {date}</span>
                                <span>⏰ {time}</span>
                                <span>📍 {b.location}</span>
                                {b.honorarium && <span>🪙 ₹{b.honorarium}</span>}
                              </div>

                              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                                <span>Requested by: <strong>{formatEcclesiasticalName(b.requester_title || 'Sr.', b.requester_name, b.requester_congregation_abbr)}</strong></span>
                                {b.responder_id && (
                                  <span style={{ marginLeft: '10px' }}>
                                    &bull; Celebrant: <strong style={{ color: '#16A34A' }}>{formatEcclesiasticalName(b.responder_title || 'Fr.', b.responder_name, b.responder_congregation_abbr)}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setAdminEditingBooking({ ...b })}
                                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                              >
                                ✏️ Override / Reassign
                              </button>

                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleAdminDeleteBooking(b.id)}
                                style={{ fontSize: '0.78rem', padding: '0.4rem 0.65rem', color: '#DC2626', borderColor: '#FECACA' }}
                              >
                                🗑️ Purge
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 3: PENDING VERIFICATION QUEUE */}
            {adminTab === 'verification' && (
              <div>
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#92400E', fontSize: '0.92rem' }}>🛡️ Mandatory Identity Checks</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350F' }}>
                    Review registration credentials of newly registered priests and sisters. Approving immediately unlocks their access to offer availability and accept ministry appointments.
                  </p>
                </div>

                <div className="admin-queue">
                  {pendingUsers.length === 0 ? (
                    <div className="no-data" style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2.5rem' }}>
                      <div className="no-data-icon">✓</div>
                      <p>All registered clergy and religious accounts are verified. No pending reviews in queue.</p>
                    </div>
                  ) : (
                    pendingUsers.map((u) => (
                      <div className="admin-card" key={u.id} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1.2rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className="admin-info">
                          <div className="admin-priest-name" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                            {formatEcclesiasticalName(u.title || (u.clergy_type === 'convent' ? 'Sr.' : 'Fr.'), u.name, u.congregation_abbr)}
                          </div>
                          <div className="admin-priest-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px', fontSize: '0.82rem', color: '#475569' }}>
                            <span>📱 {u.mobile}</span>
                            <span>⛪ {u.clergy_type === 'religious' ? u.religious_order : (u.diocese_province || u.religious_order)}</span>
                            <span>📍 {u.residence_name ? `${u.residence_name}, ` : ''}{u.residence_address || 'No address set'}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => handleVerifyUser(u.id, true)}
                            style={{ padding: '0.5rem 1rem', fontWeight: 800 }}
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

            {/* TAB 4: LIVE DATABASE TABLE INSPECTOR */}
            {adminTab === 'database' && (
              <div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: '#0F172A' }}>💾 Direct Database Record Inspector</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                      Inspect, edit, or fix raw database rows directly without terminal or SQL queries.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['users', 'bookings', 'availability_slots'].map((tbl) => (
                      <button
                        key={tbl}
                        type="button"
                        className={`filter-chip ${adminSelectedDbTable === tbl ? 'active' : ''}`}
                        onClick={() => setAdminSelectedDbTable(tbl)}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                      >
                        📄 table_{tbl} ({adminDbSnapshot?.tables?.[tbl]?.length || 0})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Raw Table View */}
                {(() => {
                  const tableRows = adminDbSnapshot?.tables?.[adminSelectedDbTable] || [];
                  if (tableRows.length === 0) {
                    return (
                      <div className="no-data" style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2.5rem' }}>
                        <div className="no-data-icon">📁</div>
                        <p>No rows in table '{adminSelectedDbTable}'.</p>
                      </div>
                    );
                  }

                  const firstRow = tableRows[0] || {};
                  const columns = Object.keys(firstRow).slice(0, 7); // preview first 7 columns

                  return (
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflowX: 'auto', boxShadow: '0 2px 6px rgba(15,23,42,0.03)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1', color: '#334155' }}>
                            <th style={{ padding: '0.65rem 0.85rem' }}>Actions</th>
                            {columns.map((c) => (
                              <th key={c} style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map((row) => (
                            <tr key={row.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                              <td style={{ padding: '0.55rem 0.85rem', whiteSpace: 'nowrap' }}>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setAdminEditingRawRecord({ table: adminSelectedDbTable, id: row.id, rawJson: JSON.stringify(row, null, 2) })}
                                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                                >
                                  ✏️ Edit Row
                                </button>
                              </td>
                              {columns.map((c) => {
                                const val = typeof row[c] === 'object' ? JSON.stringify(row[c]) : String(row[c] !== undefined ? row[c] : '');
                                return (
                                  <td key={c} style={{ padding: '0.55rem 0.85rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#0F172A' }}>
                                    {val}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* --- ADMIN MODAL: EDIT USER PROFILE --- */}
            {adminEditingUser && (
              <div className="modal-overlay">
                <div className="modal-container" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div className="modal-header">
                    <h3 className="modal-title">✏️ Admin Edit: {adminEditingUser.name}</h3>
                    <button className="modal-close" onClick={() => setAdminEditingUser(null)}>&times;</button>
                  </div>
                  <form onSubmit={handleAdminSaveUser}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div className="form-row">
                        <div className="form-group" style={{ flex: '0 0 100px' }}>
                          <label className="form-label">Title</label>
                          <select
                            className="form-control"
                            value={adminEditingUser.title || 'Fr.'}
                            onChange={(e) => setAdminEditingUser({ ...adminEditingUser, title: e.target.value })}
                          >
                            <option value="Fr.">Fr.</option>
                            <option value="Sr.">Sr.</option>
                            <option value="Br.">Br.</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminEditingUser.name || ''}
                            onChange={(e) => setAdminEditingUser({ ...adminEditingUser, name: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Mobile Number</label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminEditingUser.mobile || ''}
                            onChange={(e) => setAdminEditingUser({ ...adminEditingUser, mobile: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={adminEditingUser.email || ''}
                            onChange={(e) => setAdminEditingUser({ ...adminEditingUser, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Diocese / Province</label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminEditingUser.diocese_province || ''}
                            onChange={(e) => setAdminEditingUser({ ...adminEditingUser, diocese_province: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Religious Order</label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminEditingUser.religious_order || ''}
                            onChange={(e) => setAdminEditingUser({ ...adminEditingUser, religious_order: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Parish / Convent / Residence</label>
                        <input
                          type="text"
                          className="form-control"
                          value={adminEditingUser.residence_name || ''}
                          onChange={(e) => setAdminEditingUser({ ...adminEditingUser, residence_name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Full Address</label>
                        <input
                          type="text"
                          className="form-control"
                          value={adminEditingUser.residence_address || ''}
                          onChange={(e) => setAdminEditingUser({ ...adminEditingUser, residence_address: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setAdminEditingUser(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        💾 Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --- ADMIN MODAL: OVERRIDE / REASSIGN BOOKING --- */}
            {adminEditingBooking && (
              <div className="modal-overlay">
                <div className="modal-container" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div className="modal-header">
                    <h3 className="modal-title">📋 Override Booking #{adminEditingBooking.id}</h3>
                    <button className="modal-close" onClick={() => setAdminEditingBooking(null)}>&times;</button>
                  </div>
                  <form onSubmit={handleAdminSaveBooking}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Booking Status</label>
                          <select
                            className="form-control"
                            value={adminEditingBooking.status}
                            onChange={(e) => setAdminEditingBooking({ ...adminEditingBooking, status: e.target.value })}
                          >
                            <option value="pending">Pending (Open to Explore)</option>
                            <option value="accepted">Accepted (Locked with Celebrant)</option>
                            <option value="completed">Completed (Celebrated)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Honorarium (₹)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminEditingBooking.honorarium || ''}
                            onChange={(e) => setAdminEditingBooking({ ...adminEditingBooking, honorarium: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Assign Celebrant / Minister</label>
                        <select
                          className="form-control"
                          value={adminEditingBooking.responder_id || ''}
                          onChange={(e) => setAdminEditingBooking({ ...adminEditingBooking, responder_id: e.target.value ? Number(e.target.value) : null })}
                        >
                          <option value="">-- No Celebrant Assigned (Open Slot) --</option>
                          {adminUsers
                            .filter(u => u.title === 'Fr.' || u.clergy_type === 'religious' || u.clergy_type === 'diocesan')
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title} {p.name} {p.congregation_abbr ? `(${p.congregation_abbr})` : ''} - {p.mobile}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Service Type</label>
                        <input
                          type="text"
                          className="form-control"
                          value={adminEditingBooking.service_type || ''}
                          onChange={(e) => setAdminEditingBooking({ ...adminEditingBooking, service_type: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Venue / Location</label>
                        <input
                          type="text"
                          className="form-control"
                          value={adminEditingBooking.location || ''}
                          onChange={(e) => setAdminEditingBooking({ ...adminEditingBooking, location: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Special Notes / Intentions</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={adminEditingBooking.notes || ''}
                          onChange={(e) => setAdminEditingBooking({ ...adminEditingBooking, notes: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setAdminEditingBooking(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        💾 Update Booking
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --- ADMIN MODAL: RESET PASSWORD --- */}
            {adminPasswordResetModal && (
              <div className="modal-overlay">
                <div className="modal-container" style={{ maxWidth: '440px' }}>
                  <div className="modal-header">
                    <h3 className="modal-title">🔑 Reset Password</h3>
                    <button className="modal-close" onClick={() => setAdminPasswordResetModal(null)}>&times;</button>
                  </div>
                  <div className="modal-body">
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                      Set a new temporary password for <strong>{formatEcclesiasticalName(adminPasswordResetModal.user)}</strong>.
                    </p>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="text"
                        className="form-control"
                        value={adminPasswordResetModal.newPass}
                        onChange={(e) => setAdminPasswordResetModal({ ...adminPasswordResetModal, newPass: e.target.value })}
                        placeholder="Jesus@123"
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setAdminPasswordResetModal(null)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleAdminResetPassword(adminPasswordResetModal.user.id, adminPasswordResetModal.newPass)}
                    >
                      Save New Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- ADMIN MODAL: RAW RECORD JSON EDITOR --- */}
            {adminEditingRawRecord && (
              <div className="modal-overlay">
                <div className="modal-container" style={{ maxWidth: '640px' }}>
                  <div className="modal-header">
                    <h3 className="modal-title">💾 Edit Row: {adminEditingRawRecord.table} #{adminEditingRawRecord.id}</h3>
                    <button className="modal-close" onClick={() => setAdminEditingRawRecord(null)}>&times;</button>
                  </div>
                  <form onSubmit={handleAdminSaveRawRecord}>
                    <div className="modal-body">
                      <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.5rem' }}>
                        Modify raw database fields in JSON format:
                      </p>
                      <textarea
                        className="form-control"
                        rows="12"
                        value={adminEditingRawRecord.rawJson}
                        onChange={(e) => setAdminEditingRawRecord({ ...adminEditingRawRecord, rawJson: e.target.value })}
                        style={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.4' }}
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setAdminEditingRawRecord(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        💾 Save Row Updates
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- APP FOOTER (SUBTLE, SLEEK & LOW-PROFILE) --- */}
      <footer className="app-site-footer">
        <div className="app-site-footer-inner">
          <span className="footer-subtle-credits">
            Developed &amp; Maintained by <strong>Fr. Joseph ArRa OFM Cap</strong>
          </span>
          <span className="footer-subtle-dot">&bull;</span>
          <a
            href="https://josephcap.com"
            target="_blank"
            rel="noreferrer"
            className="footer-subtle-link"
          >
            josephcap.com
          </a>
          <span className="footer-subtle-dot">&bull;</span>
          <button
            type="button"
            className="footer-subtle-btn"
            onClick={() => setShowPrivacyPage(true)}
          >
            Privacy &amp; Authenticity Notes
          </button>
        </div>
      </footer>



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
                  <label className="form-label">CHOOSE MINISTRY / SACRAMENT *</label>
                  <select
                    className="form-input"
                    value={confirmServiceType}
                    onChange={(e) => setConfirmServiceType(e.target.value)}
                    style={{ background: '#FFFFFF', color: '#0F172A', fontWeight: 600, fontSize: '0.92rem' }}
                    required
                  >
                    <optgroup label="⛪ A. MASS & SACRAMENTS">
                      {MASS_SACRAMENTS.filter(s => s !== 'Others').map(st => (
                        <option key={`a-${st}`} value={st}>{st}</option>
                      ))}
                    </optgroup>
                    <option disabled style={{ fontSize: '6px', color: '#CBD5E1', lineHeight: '6px' }}>&nbsp;</option>
                    <optgroup label="🕯️ B. PARALITURGY & BLESSINGS">
                      {PARALITURGY_BLESSINGS.filter(s => s !== 'Others').map(st => (
                        <option key={`b-${st}`} value={st}>{st}</option>
                      ))}
                    </optgroup>
                    <option disabled style={{ fontSize: '6px', color: '#CBD5E1', lineHeight: '6px' }}>&nbsp;</option>
                    <optgroup label="🤝 C. PASTORAL MINISTRIES">
                      {PASTORAL_MINISTRIES.filter(s => s !== 'Others').map(st => (
                        <option key={`c-${st}`} value={st}>{st}</option>
                      ))}
                    </optgroup>
                    <option disabled style={{ fontSize: '6px', color: '#CBD5E1', lineHeight: '6px' }}>&nbsp;</option>
                    <optgroup label="✨ OTHER INTENTIONS">
                      <option value="Others">Others</option>
                    </optgroup>
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
                  ⚠️ <strong>Platform Advisory:</strong> Book a Priest facilitates availability discovery only and assumes no liability for celebrant commitments. Always directly speak or chat with Father on WhatsApp prior to confirming to ensure mutual agreement on timing and logistics.
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

      {/* --- MODAL 3: POST / EDIT BROADCAST MASS REQUEST --- */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {editingBooking ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Edit Ministry Request Details</span>
                  </>
                ) : (
                  'Post your Ministry Request'
                )}
              </h3>
              <button className="modal-close" onClick={() => {
                setShowRequestModal(false);
                setEditingBooking(null);
              }}>&times;</button>
            </div>
            <form onSubmit={handleCreateBooking}>
              <div className="modal-body">
                {editingBooking && (
                  <div style={{
                    marginBottom: '1rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: (editingBooking.applicants || []).length > 0 ? '#FFFBEB' : '#EFF6FF',
                    border: (editingBooking.applicants || []).length > 0 ? '1px solid #FDE68A' : '1px solid #BFDBFE',
                    fontSize: '0.8rem',
                    color: (editingBooking.applicants || []).length > 0 ? '#92400E' : '#1E40AF',
                    lineHeight: '1.45'
                  }}>
                    {(editingBooking.applicants || []).length > 0 ? (
                      <>
                        ⚠️ <strong>Notice:</strong> {(editingBooking.applicants || []).length} minister(s) have already marked availability for this request. Saving changes will automatically notify them of the modifications so they can review and re-confirm or withdraw if the new details do not suit them.
                      </>
                    ) : editingBooking.status === 'accepted' ? (
                      <>
                        ℹ️ <strong>Confirmed Celebration:</strong> You are editing a confirmed ministry. The celebrant will see the updated details immediately.
                      </>
                    ) : (
                      <>
                        ℹ️ You are editing your open request. The updated information will reflect immediately on the parish ministry feed.
                      </>
                    )}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">CHOOSE MINISTRY / SACRAMENT TYPE *</label>
                  <select
                    className="form-input"
                    value={bookingServiceType}
                    onChange={(e) => setBookingServiceType(e.target.value)}
                    style={{ background: '#FFFFFF', color: '#0F172A', fontWeight: 600, fontSize: '0.92rem' }}
                    required
                  >
                    <optgroup label="⛪ A. MASS & SACRAMENTS">
                      {MASS_SACRAMENTS.filter(s => s !== 'Others').map(st => (
                        <option key={`req-a-${st}`} value={st}>{st}</option>
                      ))}
                    </optgroup>
                    <option disabled style={{ fontSize: '6px', color: '#CBD5E1', lineHeight: '6px' }}>&nbsp;</option>
                    <optgroup label="🕯️ B. PARALITURGY & BLESSINGS">
                      {PARALITURGY_BLESSINGS.filter(s => s !== 'Others').map(st => (
                        <option key={`req-b-${st}`} value={st}>{st}</option>
                      ))}
                    </optgroup>
                    <option disabled style={{ fontSize: '6px', color: '#CBD5E1', lineHeight: '6px' }}>&nbsp;</option>
                    <optgroup label="🤝 C. PASTORAL MINISTRIES">
                      {PASTORAL_MINISTRIES.filter(s => s !== 'Others').map(st => (
                        <option key={`req-c-${st}`} value={st}>{st}</option>
                      ))}
                    </optgroup>
                    <option disabled style={{ fontSize: '6px', color: '#CBD5E1', lineHeight: '6px' }}>&nbsp;</option>
                    <optgroup label="✨ OTHER INTENTIONS">
                      <option value="Others">Others</option>
                    </optgroup>
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
                {(bookingServiceType === 'Concelebration' || bookingServiceType === 'Concelebration (Feasts & Events)') && (
                  <div style={{ fontSize: '0.76rem', color: '#6B21A8', background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '6px', padding: '0.45rem 0.65rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    🤝 <strong>Concelebration Note:</strong> Mention vestment/stole color or feast details in Notes so visiting Father can prepare accordingly.
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>PARISH / CONVENT / VENUE LOCATION *</span>
                    {bookingLatitude && (
                      <span style={{ color: '#166534', fontSize: '0.74rem', fontWeight: 600 }}>
                        ✓ GPS Pin Set
                      </span>
                    )}
                  </label>
                  <div className="input-action-group">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. St. Charles Convent / Infant Jesus Church"
                      value={bookingLocation}
                      onChange={(e) => setBookingLocation(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={`input-action-btn ${bookingLatitude ? 'active' : ''}`}
                      onClick={() => handleDetectGPS('booking')}
                      disabled={gpsDetecting}
                      title={bookingLatitude ? "GPS Location Captured (Tap to update)" : "Get current GPS pin location"}
                      style={{ padding: '0.35rem' }}
                    >
                      {gpsDetecting ? (
                        <span style={{ fontSize: '0.9rem', animation: 'pulse 1s infinite' }}>⏳</span>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill={bookingLatitude ? "#DCFCE7" : "none"} stroke={bookingLatitude ? "#16A34A" : "#0F172A"} />
                          <circle cx="12" cy="10" r="3" stroke={bookingLatitude ? "#16A34A" : "#0F172A"} fill={bookingLatitude ? "#16A34A" : "none"} />
                          <ellipse cx="12" cy="22" rx="6" ry="1.5" stroke={bookingLatitude ? "#16A34A" : "#94A3B8"} strokeWidth="1.5" fill="none" />
                        </svg>
                      )}
                    </button>
                  </div>
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

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => {
                    setShowRequestModal(false);
                    setEditingBooking(null);
                  }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formSubmitting}>
                    {editingBooking ? '💾 Save Changes & Notify' : 'Broadcast Request'}
                  </button>
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
                      renderDefaultAvatar(editTitle, editClergyType, 44)
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
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setCropZoom(1);
                            setCropPan({ x: 0, y: 0 });
                            setCropperModal({ rawImage: ev.target.result, target: 'edit' });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.55rem', fontWeight: 500, letterSpacing: '0.01em' }}>
                    {editProfilePhoto ? 'Change your photo' : 'Upload your clerical photo'}
                  </span>
                  {editProfilePhoto && (
                    <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setCropZoom(1);
                          setCropPan({ x: 0, y: 0 });
                          setCropperModal({ rawImage: editProfilePhoto, target: 'edit' });
                        }}
                        style={{ background: 'none', border: 'none', color: '#0F766E', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        🔍 Adjust / Zoom
                      </button>
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

                {/* Name Input with Seamless Non-Editable Prefix */}
                <div className="form-group">
                  <label className="form-label">
                    <span>NAME *</span>
                  </label>
                  <div className="input-prefix-group" style={{ cursor: 'text', paddingLeft: '1rem', paddingRight: '1rem' }}>
                    <span
                      style={{
                        userSelect: 'none',
                        color: '#0F172A',
                        fontWeight: 700,
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        marginRight: '4px',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      {editTitle || 'Fr.'}
                    </span>
                    <input
                      type="text"
                      className="form-input-inline"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your name..."
                      style={{ paddingLeft: 0, paddingRight: 0 }}
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

                {/* BRANCH 2: SISTER (Sr.) -> Congregation + Abbreviation */}
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
                      placeholder={editTitle === 'Sr.' ? 'sister@gmail.com' : 'father@gmail.com'}
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Date of Birth & Live Age Calculation */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>DATE OF BIRTH *</span>
                    {editDob && calculateAge(editDob) !== null && (
                      <span style={{ color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.74rem', fontWeight: 700 }}>
                        ✓ Age: {calculateAge(editDob)} years
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={editDob}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEditDob(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '0.2rem' }}>
                    Used to calculate age and ensure comfortable ministry schedules.
                  </span>
                </div>

                {/* Parish / Convent Name */}
                <div className="form-group">
                  <label className="form-label">NAME OF THE PARISH / CONVENT</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editResidenceName}
                    onChange={(e) => setEditResidenceName(e.target.value)}
                    placeholder="e.g. National Shrine of St. Thomas, Child Jesus Convent"
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
                    {editPincode && editPincode.replace(/\D/g, '').length === 6 && (
                      <span style={{ color: '#166534', fontSize: '0.74rem', fontWeight: 600 }}>
                        ✓ Valid 6-Digit PIN
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="form-input"
                    placeholder="Enter your Postal Pincode"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>

                {/* Comfortable Modes of Travel (Multi-select) */}
                <div className="form-group" style={{ marginTop: '0.65rem' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <span>🚀</span> COMFORTABLE MODES OF TRAVEL
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700, background: '#DCFCE7', padding: '2px 8px', borderRadius: '9999px' }}>
                      {editTransportModes.length} selected
                    </span>
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginBottom: '0.55rem', lineHeight: '1.4' }}>
                    Select all travel modes you are comfortable using for ministry assignments:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.45rem' }}>
                    {TRANSPORT_OPTIONS.map(opt => {
                      const isSelected = editTransportModes.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              // Don't allow empty selection if it's the last one
                              if (editTransportModes.length === 1) {
                                showFeedback('error', 'Please select at least one travel option.');
                                return;
                              }
                              setEditTransportModes(editTransportModes.filter(m => m !== opt.id));
                            } else {
                              setEditTransportModes([...editTransportModes, opt.id]);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0.55rem 0.65rem',
                            borderRadius: '8px',
                            border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                            background: isSelected ? '#EFF6FF' : '#FFFFFF',
                            color: isSelected ? '#1E40AF' : '#334155',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{opt.icon}</span>
                          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</span>
                          {isSelected && (
                            <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 900 }}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Liturgical Languages (for priests and ministers) */}
                <div className="form-group" style={{ marginTop: '0.65rem' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <span>🗣️</span> LITURGICAL LANGUAGES
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#1E40AF', fontWeight: 700, background: '#DBEAFE', padding: '2px 8px', borderRadius: '9999px' }}>
                      {editLiturgicalLanguages.length} selected
                    </span>
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginBottom: '0.55rem', lineHeight: '1.4' }}>
                    Select all languages in which you can celebrate Holy Mass or conduct liturgical services (used to match explore feeds):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.45rem' }}>
                    {LANGUAGES.map(lang => {
                      const isSelected = editLiturgicalLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (editLiturgicalLanguages.length === 1) {
                                showFeedback('error', 'Please keep at least one liturgical language selected.');
                                return;
                              }
                              setEditLiturgicalLanguages(editLiturgicalLanguages.filter(l => l !== lang));
                            } else {
                              setEditLiturgicalLanguages([...editLiturgicalLanguages, lang]);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0.65rem',
                            borderRadius: '8px',
                            border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                            background: isSelected ? '#EFF6FF' : '#FFFFFF',
                            color: isSelected ? '#1E40AF' : '#334155',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang}</span>
                          {isSelected ? (
                            <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 900 }}>✓</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>+</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Maximum Travel Distance (for priests/ministers) */}
                {editTitle === 'Fr.' && (
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>MAXIMUM TRAVEL RADIUS</span>
                      <span style={{ color: '#2563EB', fontWeight: 700 }}>{editMaxTravelKm} km</span>
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      value={editMaxTravelKm}
                      onChange={(e) => setEditMaxTravelKm(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#2563EB' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94A3B8' }}>
                      <span>5 km</span>
                      <span>50 km</span>
                      <span>100 km</span>
                    </div>
                  </div>
                )}

                {/* About Me / Pastoral Ministry Statement */}
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>ABOUT ME / PASTORAL MINISTRY BIO</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>Optional</span>
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder={editTitle === 'Sr.' ? 'e.g. Passionate catechist, family animator, hospital ministry and youth accompaniment...' : 'e.g. Preacher of retreats, charismatic renewal leader, parish missions, spiritual director...'}
                    value={editAboutMe}
                    onChange={(e) => setEditAboutMe(e.target.value)}
                    style={{ resize: 'vertical', fontSize: '0.85rem', lineHeight: '1.45' }}
                  />
                </div>

                {/* Social Media & Online Profiles (Collapsible) */}
                <div style={{ marginTop: '0.85rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditSocialLinks(!showEditSocialLinks)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '0.75rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.95rem' }}>🌐</span>
                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#1E293B', display: 'block' }}>
                          SOCIAL MEDIA & WEB LINKS
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                          {showEditSocialLinks
                            ? 'Tap to collapse'
                            : (editYoutube || editFacebook || editInstagram || editWebsite
                                ? '✓ Links added (Tap to view / edit)'
                                : 'Add YouTube, Facebook, Instagram, Website (Optional)')}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>
                      {showEditSocialLinks ? '▲' : '▼'}
                    </span>
                  </button>

                  {showEditSocialLinks && (
                    <div style={{ padding: '0 0.85rem 0.85rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {/* YouTube */}
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                            <span>▶</span> YouTube (Sermons / Channel)
                          </label>
                          <input
                            type="url"
                            className="form-input"
                            style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                            placeholder="https://youtube.com/@yourchannel or video link"
                            value={editYoutube}
                            onChange={(e) => setEditYoutube(e.target.value)}
                          />
                        </div>

                        {/* Facebook */}
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                            <span>f</span> Facebook Profile / Page
                          </label>
                          <input
                            type="url"
                            className="form-input"
                            style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                            placeholder="https://facebook.com/yourprofile"
                            value={editFacebook}
                            onChange={(e) => setEditFacebook(e.target.value)}
                          />
                        </div>

                        {/* Instagram */}
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DB2777', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                            <span>📷</span> Instagram Handle / URL
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                            placeholder="e.g. @father_arul or https://instagram.com/..."
                            value={editInstagram}
                            onChange={(e) => setEditInstagram(e.target.value)}
                          />
                        </div>

                        {/* Website / Blog */}
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F766E', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                            <span>🔗</span> Personal Website / Blog
                          </label>
                          <input
                            type="url"
                            className="form-input"
                            style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                            placeholder="https://yourministry.org or blog"
                            value={editWebsite}
                            onChange={(e) => setEditWebsite(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                    Ministry suggestions, notifications, and celebration bookings are matched based on your <strong>clerical status</strong> and <strong>address</strong>. Please ensure this information is accurate so you receive relevant liturgical needs in your area.
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
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

                  {/* Date of Birth & Live Age */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>DATE OF BIRTH</span>
                      {onboardDob && calculateAge(onboardDob) !== null && (
                        <span style={{ color: '#166534', background: '#DCFCE7', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700 }}>
                          Age: {calculateAge(onboardDob)} yrs
                        </span>
                      )}
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={onboardDob}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setOnboardDob(e.target.value)}
                    />
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

                  {/* Parish / Convent Name */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      NAME OF THE PARISH / CONVENT
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. National Shrine of St. Thomas, St. Joseph’s Convent"
                      value={onboardResidenceName}
                      onChange={(e) => setOnboardResidenceName(e.target.value)}
                    />
                  </div>

                  {/* Postal PIN Code & City */}
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                      <label className="form-label">ADDRESS</label>
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
                                    border: isConfirmedPriest ? '1px solid #BBF7D0' : '1px solid #BFDBFE',
                                    borderLeft: isConfirmedPriest ? '4px solid #16A34A' : '4px solid #2563EB',
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                                      <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>
                                        {b.service_type || 'Holy Mass'}
                                      </strong>
                                      <span style={{ fontSize: '0.72rem', color: '#166534', background: '#DCFCE7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                        Confirmed
                                      </span>
                                      <span
                                        style={{
                                          fontSize: '0.70rem',
                                          color: isConfirmedPriest ? '#15803D' : '#1D4ED8',
                                          background: isConfirmedPriest ? '#F0FDF4' : '#EFF6FF',
                                          border: isConfirmedPriest ? '1px solid #BBF7D0' : '1px solid #BFDBFE',
                                          padding: '1px 6px',
                                          borderRadius: '4px',
                                          fontWeight: 700
                                        }}
                                      >
                                        {isConfirmedPriest ? '🙏 Serving (In My Schedule)' : '📝 Requested by You (In My Requests)'}
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
                                      View in Confirmed ↗
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

      {/* FAVORITE MINISTERS DIRECT DIRECTORY MODAL */}
      {showFavoritesModal && (() => {
        const userFavs = Array.isArray(user?.favorite_ministers) ? user.favorite_ministers.map(Number) : [];

        // Collect all minister accounts matching favorite ids from availablePriests, bookings applicants, or users pool
        const favoriteList = [];
        const seenIds = new Set();

        (availablePriests || []).forEach(p => {
          const pId = Number(p.priest_id || p.id);
          if (userFavs.includes(pId) && !seenIds.has(pId)) {
            seenIds.add(pId);
            favoriteList.push({
              ...p,
              priest_id: pId,
              priest_name: p.priest_name || p.name,
              priest_title: p.priest_title || p.title || 'Fr.',
              clergy_type: p.clergy_type || 'religious',
              congregation_abbr: p.congregation_abbr || '',
              diocese_province: p.diocese_province || '',
              religious_order: p.religious_order || '',
              residence_name: p.residence_name || '',
              residence_address: p.residence_address || '',
              priest_mobile: p.priest_mobile || p.mobile || '',
              priest_email: p.priest_email || p.email || '',
              profile_photo: p.profile_photo || null,
              about_me: p.about_me || '',
              social_links: p.social_links || {},
              transport_modes: p.transport_modes || [p.transport_mode || 'own_bike'],
              dob: p.dob || null,
              age: p.age !== undefined && p.age !== null ? p.age : calculateAge(p.dob)
            });
          }
        });

        (bookings || []).forEach(b => {
          (b.applicants || []).forEach(cand => {
            const cId = Number(cand.priest_id);
            if (userFavs.includes(cId) && !seenIds.has(cId)) {
              seenIds.add(cId);
              favoriteList.push({ ...cand });
            }
          });
        });

        return (
          <div className="modal-overlay" style={{ zIndex: 99980 }} onClick={() => setShowFavoritesModal(false)}>
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '520px',
                width: '94%',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '18px',
                padding: '0',
                background: '#FFFFFF',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: '1.25rem 1.5rem', background: '#FEFCE8', borderBottom: '1px solid #FEF08A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FEF08A', color: '#854D0E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    ★
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#854D0E' }}>
                      Favorite Ministers
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#A16207', fontWeight: 600 }}>
                      {userFavs.length} {userFavs.length === 1 ? 'minister' : 'ministers'} saved for quick selection
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFavoritesModal(false)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FEF08A',
                    color: '#854D0E',
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {userFavs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.7 }}>⭐</div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                      No Favorite Ministers Yet
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#64748B', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
                      When reviewing ministers who offer to celebrate, tap the <strong>☆</strong> star next to their name to save them as a favorite for future requests!
                    </div>
                  </div>
                ) : favoriteList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>★</div>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.96rem' }}>
                      {userFavs.length} Minister(s) Saved
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                      Your favorited ministers will automatically be highlighted with a <strong>★ Favorite</strong> badge at the top whenever they volunteer for your requests.
                    </div>
                  </div>
                ) : (
                  favoriteList.map(cand => {
                    const isCandSister = cand.priest_title === 'Sr.' || cand.clergy_type === 'convent' || cand.clergy_type === 'convent_sister';
                    const candDisplayName = formatEcclesiasticalName(cand.priest_title || (isCandSister ? 'Sr.' : 'Fr.'), cand.priest_name, cand.congregation_abbr);
                    const candAffiliation = cand.clergy_type === 'religious' ? (cand.congregation_abbr || cand.religious_order) : cand.diocese_province;
                    const candAge = cand.age !== undefined && cand.age !== null ? cand.age : calculateAge(cand.dob);

                    return (
                      <div
                        key={cand.priest_id}
                        style={{
                          background: '#FEFCE8',
                          border: '1.5px solid #FDE047',
                          borderRadius: '12px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, cursor: 'pointer' }}
                          onClick={() => {
                            setShowFavoritesModal(false);
                            setViewMinisterModal({ minister: cand, booking: null });
                          }}
                        >
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '9999px',
                              overflow: 'hidden',
                              background: '#FFFFFF',
                              border: '2px solid #FDE047',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {cand.profile_photo ? (
                              <img src={cand.profile_photo} alt={cand.priest_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              renderDefaultAvatar(cand.priest_title || (isCandSister ? 'Sr.' : 'Fr.'), cand.clergy_type, 22)
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {candDisplayName}
                              </span>
                              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#854D0E', background: '#FEF9C3', border: '1px solid #FDE047', padding: '1px 5px', borderRadius: '9999px' }}>
                                ★ Fav
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {candAffiliation || 'Catholic Clergy'}{candAge !== null ? ' • ' + candAge + ' yrs' : ''}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowFavoritesModal(false);
                              setViewMinisterModal({ minister: cand, booking: null });
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.36rem 0.65rem', fontSize: '0.76rem', fontWeight: 700 }}
                          >
                            Profile ↗
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleFavorite(cand.priest_id, candDisplayName)}
                            title="Remove from favorites"
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #FDE047',
                              color: '#EAB308',
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem'
                            }}
                          >
                            ★
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 8. DETAILED MINISTER PROFILE MODAL (FOR REQUESTER TO INSPECT BEFORE CONFIRMING) */}
      {viewMinisterModal && (() => {
        const { minister: cand, booking: b } = viewMinisterModal;
        const isCandSister = cand.priest_title === 'Sr.' || cand.clergy_type === 'convent' || cand.clergy_type === 'convent_sister';
        const candTitle = cand.priest_title || (isCandSister ? 'Sr.' : 'Fr.');
        const displayName = formatEcclesiasticalName(candTitle, cand.priest_name, cand.congregation_abbr);
        const { date, time } = b ? formatDateTime(b.datetime, b.datetime_end) : { date: '', time: '' };
        const cleanServiceName = b ? (b.service_type || 'Sacramental Ministry') : 'Ministry';
        const candAge = cand.age !== undefined && cand.age !== null ? cand.age : calculateAge(cand.dob);

        const soc = typeof cand.social_links === 'string'
          ? (() => { try { return JSON.parse(cand.social_links); } catch(e) { return {}; } })()
          : (cand.social_links || {});
        const hasAnySocial = soc.youtube || soc.facebook || soc.instagram || soc.website || cand.priest_mobile;

        const formatHref = (url, prefix = '') => {
          if (!url) return '';
          if (url.startsWith('http://') || url.startsWith('https://')) return url;
          if (prefix && !url.startsWith('@')) return `${prefix}${url}`;
          if (prefix && url.startsWith('@')) return `${prefix}${url.slice(1)}`;
          return `https://${url}`;
        };

        return (
          <div className="modal-overlay" style={{ zIndex: 99990 }} onClick={() => setViewMinisterModal(null)}>
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '480px',
                width: '94%',
                maxHeight: '90vh',
                overflowY: 'auto',
                borderRadius: '18px',
                padding: '0',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                background: '#FFFFFF'
              }}
            >
              {/* Minimal Clean Header with Close Button */}
              <div style={{ position: 'relative', padding: '1.75rem 1.5rem 1.25rem', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                {/* Favorite Star Button in Modal Header */}
                {(() => {
                  const userFavs = Array.isArray(user?.favorite_ministers) ? user.favorite_ministers : [];
                  const isModalFav = userFavs.includes(Number(cand.priest_id || cand.id));
                  return (
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(cand.priest_id || cand.id, displayName)}
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        background: isModalFav ? '#FEFCE8' : '#FFFFFF',
                        border: isModalFav ? '1.5px solid #FDE047' : '1px solid #E2E8F0',
                        color: isModalFav ? '#CA8A04' : '#94A3B8',
                        height: '32px',
                        padding: '0 10px',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                      title={isModalFav ? "Favorited Minister" : "Mark as Favorite Minister"}
                    >
                      <span style={{ fontSize: '1rem', color: isModalFav ? '#EAB308' : '#94A3B8' }}>{isModalFav ? '★' : '☆'}</span>
                      <span>{isModalFav ? 'Favorite' : 'Add Favorite'}</span>
                    </button>
                  );
                })()}

                <button
                  type="button"
                  onClick={() => setViewMinisterModal(null)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  title="Close"
                >
                  ✕
                </button>

                {/* Centered Avatar & Primary Clerical Profile */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {cand.profile_photo ? (
                      <img src={cand.profile_photo} alt={cand.priest_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      renderDefaultAvatar(candTitle, cand.clergy_type, 68)
                    )}
                  </div>

                  <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                    {displayName}
                  </h3>

                  <div style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {cand.clergy_type === 'religious'
                      ? (cand.religious_order || 'Religious Congregation')
                      : (cand.diocese_province?.toLowerCase().includes('diocese')
                          ? cand.diocese_province
                          : `Diocese of ${cand.diocese_province || 'Madras-Mylapore'}`)}
                  </div>

                  {/* Clean Subtle Badges Row (Role + Age) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: isCandSister ? '#9D174D' : '#1E40AF',
                        background: isCandSister ? '#FDF2F8' : '#EFF6FF',
                        border: isCandSister ? '1px solid #FBCFE8' : '1px solid #DBEAFE',
                        padding: '2px 10px',
                        borderRadius: '9999px'
                      }}
                    >
                      {isCandSister
                        ? 'Catholic Religious Sister'
                        : (cand.clergy_type === 'diocesan' ? 'Diocesan Priest' : 'Religious Priest')}
                    </span>
                    {candAge !== null && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#92400E',
                          background: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          padding: '2px 9px',
                          borderRadius: '9999px'
                        }}
                      >
                        Age : {candAge} Yrs
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Body */}
              <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* 1. Address & Proximity */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#475569' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Address
                        </div>
                        {cand.distance_km !== null && (
                          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '2px 8px', borderRadius: '9999px', whiteSpace: 'nowrap' }}>
                            {cand.distance_km} km away
                          </div>
                        )}
                      </div>
                      {cand.residence_name && (
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                          {cand.residence_name}
                        </div>
                      )}
                      <div style={{ fontSize: cand.residence_name ? '0.8rem' : '0.9rem', fontWeight: cand.residence_name ? 400 : 600, color: cand.residence_name ? '#64748B' : '#0F172A', marginTop: '1px', lineHeight: '1.4' }}>
                        {cand.residence_address || 'Address not specified'}
                      </div>
                    </div>
                  </div>

                  {/* 2. Comfortable Modes of Transport */}
                  {(() => {
                    const candModes = Array.isArray(cand.transport_modes) && cand.transport_modes.length > 0
                      ? cand.transport_modes
                      : (cand.transport_mode ? [cand.transport_mode] : ['own_bike']);
                    return (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#475569' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="12" rx="2" />
                            <circle cx="7" cy="18" r="2" />
                            <path d="M9 18h6" />
                            <circle cx="17" cy="18" r="2" />
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                            Comfortable Travel Modes
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {candModes.map(mId => {
                              const found = TRANSPORT_OPTIONS.find(o => o.id === mId);
                              const label = found ? found.label : mId.replace(/_/g, ' ');
                              return (
                                <span
                                  key={mId}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    background: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    color: '#334155',
                                    fontSize: '0.76rem',
                                    fontWeight: 600
                                  }}
                                >
                                  <span>{label}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3. About Me / Pastoral Statement */}
                  {cand.about_me && cand.about_me.trim() ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#475569' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                          About Ministry
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                          {cand.about_me}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* 4. Contact Details (Phone & Email) */}
                  {(cand.priest_mobile || cand.priest_email) && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#475569' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                          Direct Contact
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', fontSize: '0.82rem' }}>
                          {cand.priest_mobile && (
                            <a
                              href={`tel:${cand.priest_mobile}`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0F766E', fontWeight: 700, textDecoration: 'none' }}
                            >
                              <span>{formatMobileDisplay(cand.priest_mobile)}</span>
                            </a>
                          )}
                          {cand.priest_email && (
                            <a
                              href={`mailto:${cand.priest_email}`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}
                            >
                              <span>{cand.priest_email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. Web & Social Media */}
                  {hasAnySocial && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#475569' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                          Social Media Links
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          {cand.priest_mobile && (
                            <a
                              href={`https://wa.me/${cand.priest_mobile.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '34px',
                                height: '34px',
                                borderRadius: '9999px',
                                background: '#F0FDF4',
                                border: '1px solid #BBF7D0',
                                color: '#16A34A',
                                textDecoration: 'none'
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                              </svg>
                            </a>
                          )}
                          {soc.youtube && (
                            <a
                              href={formatHref(soc.youtube)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="YouTube"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '34px',
                                height: '34px',
                                borderRadius: '9999px',
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                color: '#DC2626',
                                textDecoration: 'none'
                              }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </a>
                          )}
                          {soc.facebook && (
                            <a
                              href={formatHref(soc.facebook)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Facebook"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '34px',
                                height: '34px',
                                borderRadius: '9999px',
                                background: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                color: '#1D4ED8',
                                textDecoration: 'none'
                              }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </a>
                          )}
                          {soc.instagram && (
                            <a
                              href={formatHref(soc.instagram, 'https://instagram.com/')}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Instagram"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '34px',
                                height: '34px',
                                borderRadius: '9999px',
                                background: '#FDF2F8',
                                border: '1px solid #FBCFE8',
                                color: '#DB2777',
                                textDecoration: 'none'
                              }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                              </svg>
                            </a>
                          )}
                          {soc.website && (
                            <a
                              href={formatHref(soc.website)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Official Website / Blog"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '34px',
                                height: '34px',
                                borderRadius: '9999px',
                                background: '#F0FDFA',
                                border: '1px solid #99F6E4',
                                color: '#0F766E',
                                textDecoration: 'none'
                              }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-block"
                    onClick={() => setViewMinisterModal(null)}
                    style={{ padding: '0.65rem', fontSize: '0.86rem', fontWeight: 600, borderRadius: '8px' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}


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
              {/* 1. PRIEST (Fr.) - Male */}
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Fr. (Priest)</span>
              </button>

              {/* 2. SISTER (Sr.) - Female */}
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M5 21v-2a4 4 0 0 1 3-3.87" />
                  <circle cx="12" cy="7" r="4" />
                  <path d="M9 14h6a3 3 0 0 1 3 3v4H6v-4a3 3 0 0 1 3-3z" />
                </svg>
                <span>Sr. (Sister)</span>
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
      {/* --- PHOTO CROP & ZOOM MODAL --- */}
      {cropperModal && (
        <div
          className="modal-overlay"
          style={{ zIndex: 999999, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setCropperModal(null)}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '380px',
              width: '92%',
              borderRadius: '20px',
              padding: '1.5rem',
              background: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                  <line x1="16" y1="5" x2="22" y2="5" />
                  <line x1="19" y1="2" x2="19" y2="8" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span>Adjust Clerical Photo</span>
              </div>
              <button
                type="button"
                onClick={() => setCropperModal(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  color: '#64748B',
                  width: '28px',
                  height: '28px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                ✕
              </button>
            </div>

            {/* Circular Viewport Preview with Drag-to-Pan */}
            <div
              style={{
                position: 'relative',
                width: '240px',
                height: '240px',
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#0F172A',
                boxShadow: '0 0 0 4px #0F766E, 0 10px 25px rgba(0,0,0,0.2)',
                cursor: cropDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none'
              }}
              onMouseDown={(e) => {
                setCropDragging(true);
                setCropDragStart({ x: e.clientX - cropPan.x, y: e.clientY - cropPan.y });
              }}
              onMouseMove={(e) => {
                if (!cropDragging) return;
                setCropPan({
                  x: e.clientX - cropDragStart.x,
                  y: e.clientY - cropDragStart.y
                });
              }}
              onMouseUp={() => setCropDragging(false)}
              onMouseLeave={() => setCropDragging(false)}
              onTouchStart={(e) => {
                if (e.touches && e.touches[0]) {
                  setCropDragging(true);
                  setCropDragStart({ x: e.touches[0].clientX - cropPan.x, y: e.touches[0].clientY - cropPan.y });
                }
              }}
              onTouchMove={(e) => {
                if (!cropDragging || !e.touches || !e.touches[0]) return;
                setCropPan({
                  x: e.touches[0].clientX - cropDragStart.x,
                  y: e.touches[0].clientY - cropDragStart.y
                });
              }}
              onTouchEnd={() => setCropDragging(false)}
            >
              <img
                src={cropperModal.rawImage}
                alt="Adjust preview"
                draggable={false}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translate(${cropPan.x}px, ${cropPan.y}px) scale(${cropZoom})`,
                  transformOrigin: 'center center',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  transition: cropDragging ? 'none' : 'transform 0.05s ease'
                }}
              />
            </div>

            <div style={{ fontSize: '0.74rem', color: '#64748B', marginBottom: '1rem', fontWeight: 500 }}>
              💡 Drag to reposition &bull; Use slider below to zoom
            </div>

            {/* Zoom Slider Control */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>
                <span>Zoom Level</span>
                <span style={{ color: '#0F766E' }}>{Math.round(cropZoom * 100)}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>🔍-</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#0F766E', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>🔍+</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCropperModal(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontSize: '0.86rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApplyCroppedImage}
                style={{ flex: 2, padding: '0.65rem', borderRadius: '10px', fontSize: '0.86rem', fontWeight: 700, background: '#0F766E' }}
              >
                ✓ Apply & Crop Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
