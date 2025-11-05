import React from 'react';

interface FloatingRideButtonProps {
  navigate: (page: 'request') => void;
}

const FloatingRideButton: React.FC<FloatingRideButtonProps> = ({ navigate }) => {
  return (
    <button
      onClick={() => navigate('request')}
      className="fixed bottom-8 right-8 bg-secondary hover:bg-secondary-dark text-primary font-bold rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary-dark focus:ring-offset-2 transition-transform transform hover:scale-110 z-50"
      aria-label="Request a Ride"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
    </button>
  );
};

export default FloatingRideButton;
