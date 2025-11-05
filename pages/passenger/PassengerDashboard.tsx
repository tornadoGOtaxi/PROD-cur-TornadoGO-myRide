
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Ride, UserRole } from '../../types';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { RIDE_STATUS_COLORS } from '../../constants';

interface PassengerDashboardProps {
  navigate: (page: 'request' | 'view' | 'publicStatus', token?: string) => void;
}

const PassengerDashboard: React.FC<PassengerDashboardProps> = ({ navigate }) => {
  const { user, logout } = useAuth();
  const { rides } = useData();

  const myRides = rides
    .filter(r => r.requester_user_id === user?.id)
    .sort((a, b) => new Date(b.ride_date_time).getTime() - new Date(a.ride_date_time).getTime());

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Passenger Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <Button onClick={() => { logout(); navigate('landing' as any); }} variant="danger">Sign Out</Button>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <Card>
             <CardHeader>
                <CardTitle>My Rides</CardTitle>
                <CardDescription>Here is a list of your past and upcoming rides.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                    {myRides.length > 0 ? myRides.map(ride => (
                        <div key={ride.id} className="p-4 border rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{ride.pickup_details} &rarr; {ride.dropoff_details}</p>
                                <p className="text-sm text-gray-500">{new Date(ride.ride_date_time).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${RIDE_STATUS_COLORS[ride.status]}`}>{ride.status}</span>
                               <Button variant="ghost" size="sm" className="mt-1" onClick={() => navigate('publicStatus', ride.public_token)}>Details</Button>
                            </div>
                        </div>
                    )) : <p>You haven't requested any rides yet.</p>}
                </div>
             </CardContent>
           </Card>
        </div>

        <div className="space-y-6">
            <Card className="bg-primary text-white">
                <CardHeader>
                    <CardTitle className="text-white">New Ride</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Need to get somewhere?</p>
                    <Button variant="secondary" className="w-full" onClick={() => navigate('request')}>Request a Ride Now</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Profile & Preferences</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 mb-2"><strong>Email:</strong> {user?.email}</p>
                    <p className="text-sm text-gray-600 mb-4"><strong>Phone:</strong> {user?.phone}</p>
                    <Button className="w-full" variant="ghost">Edit Profile</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;
