import React from 'react';

export const BookAPriestLogo = ({ className = "", size, showText = false }) => {
  // Compute inline dimension if `size` is passed (e.g. size={76} or size={36})
  const inlineStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div 
      className={`bookapriest-brand-wrapper ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
    >
      {/* SVG Icon Emblem */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: size ? `${size}px` : '100%',
          height: size ? `${size}px` : 'auto',
          flexShrink: 0,
          display: 'block',
          ...inlineStyle
        }}
      >
        {/* Background Circle - Papal Split (Left: Gold, Right: White) */}
        <mask id="circle-split">
          <circle cx="50" cy="50" r="45" fill="white" />
        </mask>
        
        {/* Outline of the background circle */}
        <circle cx="50" cy="50" r="45" fill="#FFFFFF" stroke="#1E1E2C" strokeWidth="6" />
        {/* Papal Gold half */}
        <path d="M 50,5 A 45,45 0 0,0 50,95 Z" fill="#F9C300" mask="url(#circle-split)" />
        
        {/* The Outer Stole (Draping downwards) */}
        <path 
          d="M 28,68 C 28,50 34,42 50,42 C 66,42 72,50 72,68 C 72,83 67,84 67,88" 
          stroke="#1E1E2C" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        <path 
          d="M 28,68 C 28,83 33,84 33,88" 
          stroke="#1E1E2C" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Map Pin / Head Contour */}
        <path 
          d="M 50,15 C 33.5,15 31,31 31,43 C 31,55 45,69 50,71 C 55,69 69,55 69,43 C 69,31 66.5,15 50,15 Z" 
          fill="#FFFFFF" 
          stroke="#1E1E2C" 
          strokeWidth="6.5" 
          strokeLinejoin="round"
        />

        {/* Central Latin Cross */}
        <path 
          d="M 50,22 V 46" 
          stroke="#1E1E2C" 
          strokeWidth="5.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M 40,30 H 60" 
          stroke="#1E1E2C" 
          strokeWidth="5.5" 
          strokeLinecap="round" 
        />

        {/* Inner Clasp / Neck Line */}
        <path 
          d="M 37,51 C 41,56 59,56 63,51" 
          stroke="#1E1E2C" 
          strokeWidth="5" 
          strokeLinecap="round" 
          fill="none"
        />

        {/* Miniature Cross Stole Accents */}
        {/* Left Accent */}
        <path d="M 33,76 H 33.1 M 33,73 V 79" stroke="#E11D48" strokeWidth="4" strokeLinecap="round" />
        {/* Right Accent */}
        <path d="M 67,76 H 67.1 M 67,73 V 79" stroke="#E11D48" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {/* Typography: "Book a Priest" */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.1 }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.025em', fontFamily: "'Outfit', sans-serif" }}>
            Book <span style={{ color: '#F9C300', fontWeight: 900 }}>a</span> Priest
          </span>
          <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#4B5563', fontWeight: 700, marginTop: '2px' }}>
            Connecting Parishes & Clergy
          </span>
        </div>
      )}
    </div>
  );
};

export default BookAPriestLogo;
