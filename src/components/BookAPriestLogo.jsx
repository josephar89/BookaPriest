import React from 'react';

export const BookAPriestLogo = ({ className = "w-20 h-20", size, style = {} }) => {
  const inlineStyle = {
    ...(size ? { width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size } : {}),
    ...style
  };

  return (
    <div className={`flex flex-col items-center ${className}`} style={inlineStyle}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm"
        style={{ width: '100%', height: '100%', display: 'block' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Rounded Badge Container */}
        <rect x="5" y="5" width="90" height="90" rx="24" fill="#FFFFFF" />
        
        {/* Papal Gold Left Split Circle */}
        <path
          d="M 50 14 A 36 36 0 0 0 50 86 Z"
          fill="#F59E0B"
        />

        {/* Navy Outer Ring Contour */}
        <circle
          cx="50"
          cy="50"
          r="36"
          stroke="#0F172A"
          strokeWidth="4"
          fill="none"
        />

        {/* Stole Drapes (Left & Right) */}
        <path
          d="M 33 56 C 26 66 26 78 32 82 M 67 56 C 74 66 74 78 68 82"
          stroke="#0F172A"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Main Map Pin / Clergy Silhouette */}
        <path
          d="M 50 20 C 37 20 34 32 34 42 C 34 54 46 68 50 71 C 54 68 66 54 66 42 C 66 32 63 20 50 20 Z"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />

        {/* Central Latin Cross */}
        <path
          d="M 50 28 V 50 M 41 36 H 59"
          stroke="#0F172A"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Small Red Sacramental Crosses on Stole Ends */}
        <path d="M 32 76 H 32.1 M 32 74 V 78" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
        <path d="M 68 76 H 68.1 M 68 74 V 78" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default BookAPriestLogo;
