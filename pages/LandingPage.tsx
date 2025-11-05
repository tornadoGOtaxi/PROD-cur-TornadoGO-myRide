import React from 'react';
import Button from '../components/ui/Button';
import TornadoGoLogo from '../components/TornadoGoLogo';

interface LandingPageProps {
  navigate: (page: 'request' | 'view' | 'register' | 'signin') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary to-primary-dark p-4">
      <TornadoGoLogo className="mb-12" />

      <div className="w-full max-w-sm space-y-4">
        <Button
          variant="secondary"
          className="w-full text-lg py-3 transform hover:scale-105"
          onClick={() => navigate('request')}
        >
          Request a Ride
        </Button>
        <Button
          variant="primary"
          className="w-full text-lg py-3 border-2 border-secondary hover:bg-primary-light transform hover:scale-105"
          onClick={() => navigate('view')}
        >
          View Rides
        </Button>
        <div className="flex gap-4">
            <Button
            variant="ghost"
            className="w-full text-secondary-light hover:bg-white/10"
            onClick={() => navigate('register')}
            >
            Register for myRide
            </Button>
            <Button
            variant="ghost"
            className="w-full text-secondary-light hover:bg-white/10"
            onClick={() => navigate('signin')}
            >
            Sign In
            </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
