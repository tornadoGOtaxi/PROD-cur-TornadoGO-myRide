

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';

import LandingPage from './pages/LandingPage';
import RequestRidePage from './pages/RequestRidePage';
import ViewRidesPage from './pages/ViewRidesPage';
import RegisterPage from './pages/RegisterPage';
import SignInPage from './pages/SignInPage';
import PublicStatusPage from './pages/PublicStatusPage';
import PassengerDashboard from './pages/passenger/PassengerDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { UserRole } from './types';
import FloatingRideButton from './components/FloatingRideButton';

type Page = 'landing' | 'request' | 'view' | 'register' | 'signin' | 'publicStatus' | 'passengerDashboard' | 'driverDashboard' | 'adminDashboard';

const App = () => {
    const [page, setPage] = useState<Page>('landing');
    const [publicToken, setPublicToken] = useState<string | null>(null);
    const { user } = useAuth();
    const { rides } = useData();

    const navigate = useCallback((newPage: Page, token: string | null = null) => {
        setPage(newPage);
        if (token !== undefined) {
            setPublicToken(token);
        }
    }, []);

    const currentPage = useMemo(() => {
        if (user) {
            switch (user.role) {
                case UserRole.PASSENGER:
                    return <PassengerDashboard navigate={navigate} />;
                case UserRole.DRIVER:
                    return <DriverDashboard navigate={navigate} />;
                case UserRole.ADMIN:
                    return <AdminDashboard navigate={navigate} />;
                default:
                    return <LandingPage navigate={navigate} />;
            }
        }

        switch (page) {
            case 'landing':
                return <LandingPage navigate={navigate} />;
            case 'request':
                return <RequestRidePage navigate={navigate} />;
            case 'view':
                return <ViewRidesPage navigate={navigate} />;
            case 'register':
                return <RegisterPage navigate={navigate} />;
            case 'signin':
                return <SignInPage navigate={navigate} />;
            case 'publicStatus':
                const ride = rides.find(r => r.public_token === publicToken);
                return ride ? <PublicStatusPage ride={ride} navigate={navigate} user={user} /> : <LandingPage navigate={navigate} />;
            default:
                return <LandingPage navigate={navigate} />;
        }
    }, [page, user, navigate, publicToken, rides]);

    const showFloatingButton = (page !== 'request' && !user) || (user?.role === UserRole.PASSENGER);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
            <main>
              {currentPage}
            </main>
            {/* FIX: Correctly pass the navigate prop to the FloatingRideButton component. */}
            {showFloatingButton && <FloatingRideButton navigate={() => navigate('request')} />}
        </div>
    );
};

export default App;