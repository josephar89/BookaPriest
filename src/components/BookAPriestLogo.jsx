import React from 'react';

/**
 * Book a Priest official brand logo component.
 * Faithful vector recreation of the Papal Vatican colorway brand proposal.
 *
 * @param {number|string} size - Overall width/height or symbol size (e.g. 36, 76, "48px")
 * @param {'light'|'dark'|'app-icon'|'app-icon-light'} variant - Visual theme
 * @param {boolean} showText - Whether to render the "Book a Priest" wordmark
 * @param {boolean} showTagline - Whether to render "CONNECTING PARISHES & CLERGY"
 * @param {'horizontal'|'vertical'} layout - Layout orientation when text is shown
 * @param {string} className - Optional wrapper CSS class
 * @param {React.CSSProperties} style - Optional wrapper inline styles
 */
export const BookAPriestLogo = ({
  size = 48,
  variant = 'light',
  showText = false,
  showTagline = false,
  layout = 'horizontal',
  className = '',
  style = {}
}) => {
  const isDark = variant === 'dark';
  const isAppIcon = variant === 'app-icon';
  const isAppIconLight = variant === 'app-icon-light';

  // Palette definitions from BookaPriest brand identity
  const PAPAL_GOLD = '#F7B918';
  const MIDNIGHT_NAVY = '#1A2238';
  const LITURGICAL_RED = '#C22E28';
  const WHITE = '#FFFFFF';

  // SVG Line and fill colors based on active variant
  const strokeColor = isDark ? PAPAL_GOLD : MIDNIGHT_NAVY;
  const crossColor = isDark ? PAPAL_GOLD : MIDNIGHT_NAVY;
  const stoleCrossColor = isDark ? PAPAL_GOLD : LITURGICAL_RED;
  const bodyFill = isDark ? MIDNIGHT_NAVY : WHITE;

  // Pixel dimension calculation
  const dim = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`bookapriest-brand-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        gap: layout === 'vertical' ? '0.5rem' : '0.75rem',
        ...style
      }}
    >
      {/* Vector Emblem */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: dim,
          height: dim,
          flexShrink: 0,
          display: 'block'
        }}
        aria-label="Book a Priest Logo"
        role="img"
      >
        <defs>
          <clipPath id={`papal-split-${variant}`}>
            <rect x="0" y="0" width="50" height="100" />
          </clipPath>
        </defs>

        {/* Squircle Tile background for App-Icon variants */}
        {isAppIcon && (
          <rect width="100" height="100" rx="22" fill={MIDNIGHT_NAVY} />
        )}
        {isAppIconLight && (
          <>
            <rect width="100" height="100" rx="22" fill={WHITE} />
            <rect width="98" height="98" x="1" y="1" rx="21" fill="none" stroke="#E5E7EB" strokeWidth="2" />
          </>
        )}

        <g transform={(isAppIcon || isAppIconLight) ? "translate(5, 5) scale(0.9)" : undefined}>
          {/* Semicircle Backdrop - Shown in light & app-icon modes */}
          {!isDark && (
            <circle
              cx="50"
              cy="50"
              r="41"
              fill={PAPAL_GOLD}
              clipPath={`url(#papal-split-${variant})`}
            />
          )}

          {/* Priest Hood & Stole Contour */}
          <path
            d="M 50 13 C 35 13 31 27 31 39 C 31 49 39 57 44 61 L 30 67 C 26 69 24 74 24 81 L 26.5 88.5 C 27 90 28.5 90.5 30.5 89.5 L 38 85.5 C 39.5 84.5 40 82.5 39.5 81 L 36.5 71 C 41 67.5 45.5 66 50 66 C 54.5 66 59 67.5 63.5 71 L 60.5 81 C 60 82.5 60.5 84.5 62 85.5 L 69.5 89.5 C 71.5 90.5 73 90 73.5 88.5 L 76 81 C 76 74 74 69 70 67 L 56 61 C 61 57 69 49 69 39 C 69 27 65 13 50 13 Z"
            fill={bodyFill}
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Latin Cross */}
          <line
            x1="50"
            y1="21"
            x2="50"
            y2="47"
            stroke={crossColor}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <line
            x1="39"
            y1="29"
            x2="61"
            y2="29"
            stroke={crossColor}
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Inner Collar Clasp Curve */}
          <path
            d="M 40 52 C 45 58 55 58 60 52"
            fill="none"
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Left Liturgical Cross on Stole */}
          <line
            x1="32"
            y1="76"
            x2="32"
            y2="83"
            stroke={stoleCrossColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="28.5"
            y1="79.5"
            x2="35.5"
            y2="79.5"
            stroke={stoleCrossColor}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Right Liturgical Cross on Stole */}
          <line
            x1="68"
            y1="76"
            x2="68"
            y2="83"
            stroke={stoleCrossColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="64.5"
            y1="79.5"
            x2="71.5"
            y2="79.5"
            stroke={stoleCrossColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Typography: "Book a Priest" Wordmark */}
      {showText && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: layout === 'vertical' ? 'center' : 'flex-start',
            lineHeight: 1.15
          }}
        >
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: isDark ? WHITE : MIDNIGHT_NAVY,
              letterSpacing: '-0.025em',
              fontFamily: "'Outfit', system-ui, -apple-system, sans-serif"
            }}
          >
            Book <span style={{ color: PAPAL_GOLD, fontWeight: 900 }}>a</span> Priest
          </span>
          {showTagline && (
            <span
              style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: isDark ? '#9CA3AF' : '#4B5563',
                fontWeight: 700,
                marginTop: '3px'
              }}
            >
              Connecting Parishes & Clergy
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BookAPriestLogo;
