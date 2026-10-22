import React from 'react';

/**
 * Official Book a Priest final brand logo component.
 * Incorporates the Papal Gold map-pin clergy silhouette, Roman collar tab,
 * and white Latin pectoral cross.
 *
 * @param {number|string} size - Overall width or icon size (e.g. 76, 36)
 * @param {'color'|'monochrome'|'dark'} variant - Color variant
 * @param {boolean} showText - Whether to render "Book a Priest" wordmark
 * @param {boolean} showTagline - Whether to render "Priests at your call"
 * @param {'horizontal'|'vertical'} layout - Orientation when text is shown
 * @param {string} className - Optional CSS class
 * @param {React.CSSProperties} style - Optional inline styles
 */
export const BookAPriestLogo = ({
  size,
  variant = 'color',
  showText = false,
  showTagline = false,
  layout = 'horizontal',
  className = '',
  style = {}
}) => {
  const isMono = variant === 'monochrome';
  const isDark = variant === 'dark';

  const NAVY = '#131E3C';
  const PAPAL_GOLD = '#FCD116';
  const WHITE = '#FFFFFF';

  // Fill and stroke selection
  const pinFill = isMono ? WHITE : (isDark ? NAVY : PAPAL_GOLD);
  const pinStroke = isDark ? PAPAL_GOLD : NAVY;
  const priestFill = isDark ? PAPAL_GOLD : NAVY;
  const crossFill = isDark ? NAVY : WHITE;
  const collarFill = isDark ? NAVY : WHITE;

  // Determine dimension
  const dim = size ? (typeof size === 'number' ? `${size}px` : size) : '100%';

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
      {/* Scalable Vector Emblem */}
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: dim,
          height: size ? (typeof size === 'number' ? `${size * 1.2}px` : `calc(${dim} * 1.2)`) : 'auto',
          aspectRatio: '100 / 120',
          flexShrink: 0,
          display: 'block'
        }}
        aria-label="Book a Priest Logo"
        role="img"
      >
        {/* Map Pin Container */}
        <path
          d="M 50 6
             C 73.196 6 92 24.804 92 48
             C 92 61.2 86.4 72.8 77.2 82.8
             L 50 114
             L 22.8 82.8
             C 13.6 72.8 8 61.2 8 48
             C 8 24.804 26.804 6 50 6 Z"
          fill={pinFill}
          stroke={pinStroke}
          strokeWidth="7.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Priest Silhouette Group */}
        <g fill={priestFill}>
          {/* Head */}
          <circle cx="50" cy="40" r="13.5" />

          {/* Neck */}
          <rect x="46" y="52" width="8" height="10" />

          {/* Shoulders / Bust */}
          <path
            d="M 46 60
               C 35 61 28 69 28 82
               C 34 91 66 91 72 82
               C 72 69 65 61 54 60
               Z"
          />
        </g>

        {/* Roman Clerical Collar Tab */}
        <rect x="48" y="55" width="4" height="6.5" fill={collarFill} rx="0.5" />

        {/* Latin Cross on Vestment */}
        <rect x="47.2" y="65.5" width="5.6" height="20" fill={crossFill} rx="0.5" />
        <rect x="41" y="71" width="18" height="5.6" fill={crossFill} rx="0.5" />
      </svg>

      {/* Wordmark & Tagline */}
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
              color: isDark ? WHITE : NAVY,
              letterSpacing: '-0.025em',
              fontFamily: "'Outfit', system-ui, -apple-system, sans-serif"
            }}
          >
            Book <span style={{ color: PAPAL_GOLD, fontWeight: 900 }}>a</span> Priest
          </span>
          {showTagline && (
            <span
              style={{
                fontSize: '9.5px',
                letterSpacing: '0.08em',
                color: isDark ? '#9CA3AF' : '#4B5563',
                fontWeight: 700,
                marginTop: '3px',
                textTransform: 'uppercase'
              }}
            >
              Priests at your call
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BookAPriestLogo;
