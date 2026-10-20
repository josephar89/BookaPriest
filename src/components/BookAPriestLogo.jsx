import React from 'react';

export function BookAPriestLogo({ size = 56, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={className}
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      <defs>
        <clipPath id="circleClipComponent">
          <circle cx="50" cy="50" r="42" />
        </clipPath>
      </defs>

      {/* Papal Roundel: Yellow Left / White Right */}
      <g clipPath="url(#circleClipComponent)">
        <rect x="8" y="8" width="42" height="84" fill="#F7B918" />
        <rect x="50" y="8" width="42" height="84" fill="#FFFFFF" />
      </g>

      {/* Priestly Silhouette / Mitre / Stole Outline in Roman Navy */}
      <path 
        d="M 50 12 C 37 12 30 22 30 35 C 30 46 36 53 43 57 L 30 63 C 26 65 24 70 24 78 L 27 88 C 27.5 89.5 29.5 90.5 31.5 89.5 L 40 85 C 41.5 84 42 82 41.5 80 L 37 67 C 42 63 47 62 50 62 C 53 62 58 63 63 67 L 58.5 80 C 58 82 58.5 84 60 85 L 68.5 89.5 C 70.5 90.5 72.5 89.5 73 88 L 76 78 C 76 70 74 65 70 63 L 57 57 C 64 53 70 46 70 35 C 70 22 63 12 50 12 Z" 
        fill="none" 
        stroke="#1A2238" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Center Liturgical Cross */}
      <line x1="50" y1="21" x2="50" y2="49" stroke="#1A2238" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="39" y1="29" x2="61" y2="29" stroke="#1A2238" strokeWidth="5.5" strokeLinecap="round" />

      {/* Inner Stole V-Neck */}
      <path 
        d="M 39 49 C 45 56 55 56 61 49" 
        fill="none" 
        stroke="#1A2238" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
      />

      {/* Red Crosses on Stole Ends */}
      <line x1="33" y1="78" x2="33" y2="84" stroke="#C22E28" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30.5" y1="80.5" x2="35.5" y2="80.5" stroke="#C22E28" strokeWidth="2.5" strokeLinecap="round" />

      <line x1="67" y1="78" x2="67" y2="84" stroke="#C22E28" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="64.5" y1="80.5" x2="69.5" y2="80.5" stroke="#C22E28" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default BookAPriestLogo;
