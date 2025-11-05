
import React, { useState, useRef, useEffect } from 'react';
import { Ride, User, RideStatus } from '../types';
import { useData } from '../context/DataContext';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import TornadoGoLogo from '../components/TornadoGoLogo';
import { RIDE_STATUS_COLORS } from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getRouteInfo } from '../services/geminiService';


interface PublicStatusPageProps {
  ride: Ride;
  navigate: (page: 'landing') => void;
  user?: User | null;
}

const PublicStatusPage: React.FC<PublicStatusPageProps> = ({ ride, navigate, user }) => {
  const { rideActivityLogs, users, driverLocations, messages, actions } = useData();
  const [chatInput, setChatInput] = useState('');
  const [eta, setEta] = useState<string | null>(null);
  const [isLoadingEta, setIsLoadingEta] = useState(false);
  const etaIntervalRef = useRef<number | null>(null);

  const relevantLogs = rideActivityLogs
    .filter(log => log.ride_id === ride.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const driver = users.find(u => u.id === ride.assigned_driver_id);
  const driverLocation = driverLocations.find(dl => dl.driver_id === ride.assigned_driver_id);

  const rideMessages = messages.filter(m => m.ride_id === ride.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const isPassengerOfRide = user && user.id === ride.requester_user_id;

  useEffect(() => {
    const fetchEta = async () => {
      if (ride.status === RideStatus.EN_ROUTE_TO_PICKUP && ride.is_sharing_location && driverLocation) {
        setIsLoadingEta(true);
        try {
          const routeInfo = await getRouteInfo(
            { lat: driverLocation.last_lat, lng: driverLocation.last_lng },
            ride.pickup_details
          );
          setEta(routeInfo);
        } catch (error) {
          console.error("Failed to fetch ETA:", error);
          setEta("Could not calculate ETA.");
        } finally {
          setIsLoadingEta(false);
        }
      } else {
        setEta(null);
      }
    };

    if (etaIntervalRef.current) {
      clearInterval(etaIntervalRef.current);
    }

    if (ride.status === RideStatus.EN_ROUTE_TO_PICKUP && ride.is_sharing_location && driverLocation) {
      fetchEta();
      etaIntervalRef.current = window.setInterval(fetchEta, 15000);
    }

    return () => {
      if (etaIntervalRef.current) {
        clearInterval(etaIntervalRef.current);
      }
    };
  }, [ride.status, ride.is_sharing_location, driverLocation, ride.pickup_details]);


  const handleSendMessage = () => {
    if (!chatInput.trim() || !user || !ride.assigned_driver_id) return;
    actions.addMessage({
        ride_id: ride.id,
        sender_id: user.id,
        receiver_id: ride.assigned_driver_id,
        message_text: chatInput,
        is_system: false,
    });
    setChatInput('');
  };


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
       <button onClick={() => navigate('landing')} className="absolute top-4 left-4 text-primary hover:underline">
        &larr; Back to Home
      </button>
      <div className="transform scale-75 my-4 -mb-4">
        <TornadoGoLogo />
      </div>
      <div className="w-full max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                  <CardTitle>Ride Status</CardTitle>
                  <CardDescription>Ride ID: {ride.id.split('-')[1]}</CardDescription>
              </div>
              <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${RIDE_STATUS_COLORS[ride.status]}`}>{ride.status}</span>
            </div>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                      <h4 className="font-bold">Pickup</h4>
                      <p>{ride.pickup_details}</p>
                  </div>
                  <div>
                      <h4 className="font-bold">Drop-off</h4>
                      <p>{ride.dropoff_details}</p>
                  </div>
                  <div>
                      <h4 className="font-bold">Requested Time</h4>
                      <p>{new Date(ride.ride_date_time).toLocaleString()}</p>
                  </div>
                  {driver && (
                      <div>
                          <h4 className="font-bold">Your Driver</h4>
                          <p>{driver.name}</p>
                      </div>
                  )}
              </div>
          </CardContent>
        </Card>
        
        {ride.is_sharing_location && driverLocation && (
          <Card className="mb-6">
            <CardContent className="p-4">
                {ride.status === RideStatus.EN_ROUTE_TO_PICKUP && (
                    <div className="text-center my-2">
                        <h3 className="text-lg font-semibold text-gray-700">Driver ETA to Pickup</h3>
                        <p className="text-2xl font-bold text-primary animate-pulse">
                            {isLoadingEta && !eta ? 'Calculating...' : eta || '...'}
                        </p>
                    </div>
                )}
               <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <h5 className="font-bold">Live Driver Location</h5>
                   <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 rounded-md my-2 flex items-center justify-between px-8 relative overflow-hidden">
                        {/* Driver Icon */}
                        <div className="flex flex-col items-center z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                            </svg>
                            <span className="text-xs font-bold">DRIVER</span>
                        </div>

                        {/* Road line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-400 dark:bg-gray-500 z-0">
                            <div className="h-1 bg-primary transition-all duration-1000" style={{width: '20%'}}></div> {/* Example progress */}
                        </div>
                        
                        {/* Pickup Icon */}
                        <div className="flex flex-col items-center z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span className="text-xs font-bold">YOU</span>
                        </div>
                    </div>
                  <p className="text-sm">Lat: {driverLocation.last_lat.toFixed(4)}, Lng: {driverLocation.last_lng.toFixed(4)}</p>
                  <p className="text-xs text-gray-500">Last updated: {new Date(driverLocation.last_updated_at).toLocaleTimeString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isPassengerOfRide && ride.assigned_driver_id && (
           <Card className="mb-6">
             <CardHeader>
                <CardTitle>Chat with {driver?.name || 'Driver'}</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-4 h-64 overflow-y-auto pr-4 mb-4 border rounded-md p-4 bg-gray-50">
                    {rideMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender_id === user.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm">{msg.message_text}</p>
                                <p className={`text-xs mt-1 text-right ${msg.sender_id === user.id ? 'text-indigo-200' : 'text-gray-500'}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." />
                    <Button onClick={handleSendMessage}>Send</Button>
                </div>
             </CardContent>
           </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
          <CardContent>
              <div className="border-l-2 border-primary pl-4 space-y-6">
                  {relevantLogs.map(log => (
                      <div key={log.id} className="relative">
                          <div className="absolute -left-[1.2rem] w-3 h-3 bg-secondary rounded-full mt-1.5 ring-4 ring-gray-100"></div>
                          <p className="font-semibold text-primary">{log.event_type.replace(/_/g, ' ')}</p>
                          <p className="text-sm">{log.event_description}</p>
                          <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                  ))}
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicStatusPage;
