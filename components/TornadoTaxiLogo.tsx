import React from 'react';

const TornadoTaxiLogo = ({ className = 'w-24 h-24' }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-secondary-light to-secondary-dark shadow-lg"></div>
      <div className="absolute w-[90%] h-[90%] rounded-full bg-primary shadow-inner"></div>
      <div className="relative z-10 text-white text-center">
        <svg viewBox="0 0 100 80" className="w-full h-auto" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
          <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FDE047' }} />
              <stop offset="100%" style={{ stopColor: '#D4AF37' }} />
            </linearGradient>
          </defs>
          <text
            x="50"
            y="55"
            fontFamily="Impact, sans-serif"
            fontSize="70"
            fill="url(#gold-gradient)"
            textAnchor="middle"
            stroke="#4B0082"
            strokeWidth="2"
          >
            T
          </text>
        </svg>
        <span className="text-sm font-bold text-secondary-light tracking-wider" style={{ textShadow: '1px 1px 2px #000' }}>
            TORNADO TAXI
        </span>
      </div>
    </div>
  );
};

export default TornadoTaxiLogo;