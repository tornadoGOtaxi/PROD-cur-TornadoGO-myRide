import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Ride, User, UserRole, RideStatus } from '../../types';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { RIDE_STATUS_COLORS, RIDE_STATUS_OPTIONS } from '../../constants';

interface AdminDashboardProps {
  navigate: (page: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
    const { user, logout } = useAuth();
    const { users, rides, actions } = useData();
    const [currentTab, setCurrentTab] = useState('overview');

    const stats = useMemo(() => ({
        totalRides: rides.length,
        activeRides: rides.filter(r => ![RideStatus.COMPLETED, RideStatus.CANCELLED].includes(r.status)).length,
        completedRides: rides.filter(r => r.status === RideStatus.COMPLETED).length,
        totalPassengers: users.filter(u => u.role === UserRole.PASSENGER).length,
        totalDrivers: users.filter(u => u.role === UserRole.DRIVER).length,
    }), [rides, users]);
    
    const [userFilter, setUserFilter] = useState('');
    const [rideFilter, setRideFilter] = useState('');

    const filteredUsers = useMemo(() => users.filter(u => u.name.toLowerCase().includes(userFilter.toLowerCase()) || u.email.toLowerCase().includes(userFilter.toLowerCase())), [users, userFilter]);
    const filteredRides = useMemo(() => rides.filter(r => r.id.includes(rideFilter) || r.pickup_details.toLowerCase().includes(rideFilter.toLowerCase()) || r.dropoff_details.toLowerCase().includes(rideFilter.toLowerCase())).sort((a,b) => new Date(b.ride_date_time).getTime() - new Date(a.ride_date_time).getTime()), [rides, rideFilter]);

    const handleToggleUserActive = (userId: string, newStatus: boolean) => {
        actions.updateUser(userId, { active: newStatus });
    };

    const handleUpdateRideStatus = (rideId: string, status: RideStatus) => {
        actions.updateRideStatus(rideId, status, user?.id || null);
    };

    const handleAssignDriver = (rideId: string, driverId: string) => {
        actions.assignDriverToRide(rideId, driverId, user?.id || null);
    };

    const handleCancelRide = (rideId: string) => {
        const reason = prompt("Please enter a reason for cancellation:");
        if (reason) {
            actions.cancelRide(rideId, reason, user?.id || null);
        }
    };

    const drivers = useMemo(() => users.filter(u => u.role === UserRole.DRIVER), [users]);

    return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-gray-600">Logged in as {user?.name}</p>
        </div>
        <Button onClick={() => { logout(); navigate('landing'); }} variant="danger">Sign Out</Button>
      </header>

       <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setCurrentTab('overview')} className={`${currentTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Overview</button>
          <button onClick={() => setCurrentTab('users')} className={`${currentTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Manage Users</button>
          <button onClick={() => setCurrentTab('rides')} className={`${currentTab === 'rides' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Manage Rides</button>
        </nav>
      </div>

      {currentTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard title="Total Rides" value={stats.totalRides} />
              <StatCard title="Active Rides" value={stats.activeRides} />
              <StatCard title="Completed Rides" value={stats.completedRides} />
              <StatCard title="Passengers" value={stats.totalPassengers} />
              <StatCard title="Drivers" value={stats.totalDrivers} />
          </div>
      )}
      {currentTab === 'users' && (
          <Card>
              <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
              <CardContent>
                  <Input placeholder="Filter users by name or email..." value={userFilter} onChange={e => setUserFilter(e.target.value)} className="mb-4" />
                   <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map(u => (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                             {u.active ? 'Active' : 'Inactive'}
                                           </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button size="sm" variant={u.active ? 'danger' : 'primary'} onClick={() => handleToggleUserActive(u.id, !u.active)}>
                                                {u.active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                   </div>
              </CardContent>
          </Card>
      )}
      {currentTab === 'rides' && (
           <Card>
              <CardHeader><CardTitle>Ride Management</CardTitle></CardHeader>
              <CardContent>
                  <Input placeholder="Filter rides..." value={rideFilter} onChange={e => setRideFilter(e.target.value)} className="mb-4" />
                   <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pax</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[320px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRides.map(ride => {
                                    const passenger = users.find(u => u.id === ride.requester_user_id);
                                    const passengerName = passenger ? passenger.name : ride.guest_name || 'Guest';
                                    return (
                                        <tr key={ride.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ride.id.substring(5, 10)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{passengerName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ride.ride_date_time).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" title={`${ride.pickup_details} to ${ride.dropoff_details}`}>
                                                <div className="w-32 truncate">{ride.pickup_details} &rarr; {ride.dropoff_details}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{ride.num_passengers}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ride.payment_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${RIDE_STATUS_COLORS[ride.status]}`}>
                                                    {ride.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{users.find(u => u.id === ride.assigned_driver_id)?.name || 'Unassigned'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <select 
                                                  value={ride.status} 
                                                  onChange={(e) => handleUpdateRideStatus(ride.id, e.target.value as RideStatus)}
                                                  className="p-1.5 rounded-md border-gray-300 text-sm"
                                                  disabled={[RideStatus.COMPLETED, RideStatus.CANCELLED].includes(ride.status)}
                                                >
                                                    {RIDE_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                 <select 
                                                  value={ride.assigned_driver_id || ''} 
                                                  onChange={(e) => handleAssignDriver(ride.id, e.target.value)}
                                                  className="p-1.5 rounded-md border-gray-300 text-sm"
                                                  disabled={[RideStatus.COMPLETED, RideStatus.CANCELLED].includes(ride.status)}
                                                >
                                                    <option value="">Unassign</option>
                                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                                {!([RideStatus.COMPLETED, RideStatus.CANCELLED].includes(ride.status)) && (
                                                  <Button size="sm" variant="danger" onClick={() => handleCancelRide(ride.id)}>Cancel</Button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                   </div>
              </CardContent>
          </Card>
      )}
    </div>
  );
};

const StatCard = ({ title, value }: { title: string, value: number | string }) => (
    <Card>
        <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        </CardContent>
    </Card>
);


export default AdminDashboard;