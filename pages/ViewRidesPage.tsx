

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Ride } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import TornadoGoLogo from '../components/TornadoGoLogo';
import { RIDE_STATUS_COLORS } from '../constants';

interface ViewRidesPageProps {
    navigate: (page: 'landing' | 'publicStatus', token?: string) => void;
}

const ViewRidesPage: React.FC<ViewRidesPageProps> = ({ navigate }) => {
    const { rides, users } = useData();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [foundRides, setFoundRides] = useState<Ride[]>([]);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSearched(true);

        const matchingUser = users.find(u => u.email === email && u.phone === phone);

        const matchingRides = rides.filter(ride => 
            (ride.guest_email === email && ride.guest_phone === phone) ||
            (matchingUser && ride.requester_user_id === matchingUser.id)
        );

        if(matchingRides.length === 0){
            setError('No rides found for this email and phone number.');
        }
        
        setFoundRides(matchingRides.sort((a,b) => new Date(b.ride_date_time).getTime() - new Date(a.ride_date_time).getTime()));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
            <button onClick={() => navigate('landing')} className="absolute top-4 left-4 text-primary hover:underline">
                &larr; Back to Home
            </button>
            <div className="transform scale-75 my-4 -mb-4">
                <TornadoGoLogo />
            </div>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>View Your Rides</CardTitle>
                    <CardDescription>Enter your email and phone to find your rides.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label>Email</label>
                            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label>Phone</label>
                            <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full" variant="primary">Find Rides</Button>
                    </form>
                </CardContent>
            </Card>

            {searched && (
                <div className="mt-8 w-full max-w-2xl">
                    <h3 className="text-2xl font-bold text-center mb-4">Your Rides</h3>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {foundRides.length > 0 ? (
                        <div className="space-y-4">
                            {foundRides.map(ride => (
                                <Card key={ride.id}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold">Ride ID: {ride.id.split('-')[1]}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(ride.ride_date_time).toLocaleString()}
                                                </p>
                                                <p className="text-sm">From: {ride.pickup_details}</p>
                                                <p className="text-sm">To: {ride.dropoff_details}</p>
                                            </div>
                                            <div className="text-right">
                                                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${RIDE_STATUS_COLORS[ride.status]}`}>{ride.status}</span>
                                                <Button variant="ghost" className="mt-2" onClick={() => navigate('publicStatus', ride.public_token)}>View Details</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : !error && <p className="text-center text-gray-500">No rides found.</p>}
                </div>
            )}
        </div>
    );
};

export default ViewRidesPage;
