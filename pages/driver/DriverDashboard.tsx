
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Ride, RideStatus, EventType } from '../../types';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { generateDriverReply } from '../../services/geminiService';
import Input from '../../components/ui/Input';


interface DriverDashboardProps {
  navigate: (page: any) => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ navigate }) => {
  const { user, logout } = useAuth();
  const { rides, users, rideActivityLogs, driverAvailabilities, actions, messages } = useData();
  const [currentTab, setCurrentTab] = useState('requests');
  const [chatInputs, setChatInputs] = useState<{ [rideId: string]: string }>({});
  const [suggestedReplies, setSuggestedReplies] = useState<{ [rideId: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState<{ [rideId: string]: boolean }>({});
  const debounceTimeoutRef = useRef<number | null>(null);
  const locationWatchId = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const rideRequests = useMemo(() => rides.filter(r => r.status === RideStatus.REQUESTED), [rides]);
  const [newRequestIndicator, setNewRequestIndicator] = useState(false);
  const prevRideRequestsCount = useRef(rideRequests.length);


  const availability = driverAvailabilities.find(da => da.driver_id === user?.id);
  
  const toggleAvailability = () => {
    if (!availability || !user) return;
    actions.updateDriverAvailability(user.id, !availability.is_available_now);
  };
  
  const myTrips = useMemo(() => rides.filter(r => r.assigned_driver_id === user?.id && ![RideStatus.COMPLETED, RideStatus.CANCELLED].includes(r.status)), [rides, user]);
  const recentActivity = useMemo(() => rideActivityLogs.slice().sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10), [rideActivityLogs]);
  
  const playNotificationSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  useEffect(() => {
    if (rideRequests.length > prevRideRequestsCount.current) {
        setNewRequestIndicator(true);
        playNotificationSound();
    }
    prevRideRequestsCount.current = rideRequests.length;
  }, [rideRequests.length]);

  const acceptRide = (rideId: string) => {
    if(!user) return;
    actions.assignDriverToRide(rideId, user.id, user.id);
  };

  const startLocationSharing = (ride: Ride) => {
    if (!user || locationWatchId.current !== null) return;
    if (navigator.geolocation) {
        actions.toggleRideLocationSharing(ride.id, true);
        locationWatchId.current = navigator.geolocation.watchPosition(
            (position) => {
                actions.updateDriverLocation(user.id, position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.error("Geolocation error:", error);
                stopLocationSharing(ride);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
  };

  const stopLocationSharing = (ride: Ride) => {
      if (locationWatchId.current !== null) {
          navigator.geolocation.clearWatch(locationWatchId.current);
          locationWatchId.current = null;
      }
      actions.toggleRideLocationSharing(ride.id, false);
  };


  const updateTripStatus = (rideId: string, currentStatus: RideStatus) => {
      if(!user) return;
      const ride = myTrips.find(r => r.id === rideId);
      if (!ride) return;

      let newStatus: RideStatus | null = null;
      if (currentStatus === RideStatus.ASSIGNED) {
          newStatus = RideStatus.EN_ROUTE_TO_PICKUP;
          startLocationSharing(ride);
      } else if (currentStatus === RideStatus.EN_ROUTE_TO_PICKUP) {
          newStatus = RideStatus.PICKED_UP;
      } else if (currentStatus === RideStatus.PICKED_UP || currentStatus === RideStatus.IN_PROGRESS) {
          newStatus = RideStatus.COMPLETED;
      }

      if (newStatus) {
          actions.updateRideStatus(rideId, newStatus, user.id);
          // If ride is completed, stop sharing location
          if(newStatus === RideStatus.COMPLETED){
              if(ride && ride.is_sharing_location) stopLocationSharing(ride);
          }
      }
  };

  const getNextActionText = (status: RideStatus): string => {
      switch(status) {
          case RideStatus.ASSIGNED: return "I'm On My Way";
          case RideStatus.EN_ROUTE_TO_PICKUP: return "Confirm Pickup";
          case RideStatus.PICKED_UP:
          case RideStatus.IN_PROGRESS: return "Confirm Dropoff";
          default: return "No Action";
      }
  }

  useEffect(() => {
    return () => {
        if (locationWatchId.current !== null) {
            navigator.geolocation.clearWatch(locationWatchId.current);
        }
    };
  }, []);
  
    useEffect(() => {
    // Cleanup for location sharing if a ride disappears or is cancelled
    if (locationWatchId.current !== null) {
        const currentSharingRide = myTrips.find(r => r.is_sharing_location);
        if (!currentSharingRide) {
            // No longer an active trip for this driver, or it got cancelled
            if (locationWatchId.current !== null) {
                navigator.geolocation.clearWatch(locationWatchId.current);
                locationWatchId.current = null;
            }
        }
    }
  }, [myTrips]);

  const handleChatInputChange = (rideId: string, text: string) => {
    setChatInputs(prev => ({ ...prev, [rideId]: text }));

    if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
    }
    
    if (text.trim().length > 5) {
        debounceTimeoutRef.current = window.setTimeout(() => {
            generateSuggestion(rideId, text);
        }, 500);
    } else {
        setSuggestedReplies(prev => ({...prev, [rideId]: ''}));
    }
  };

  const applySuggestion = (rideId: string) => {
    if(suggestedReplies[rideId]) {
        setChatInputs(prev => ({...prev, [rideId]: suggestedReplies[rideId]}));
        setSuggestedReplies(prev => ({...prev, [rideId]: ''}));
    }
  };

  const handleSendMessage = (rideId: string) => {
    const ride = myTrips.find(r => r.id === rideId);
    if (!ride || !user || !chatInputs[ride.id]?.trim() || !ride.requester_user_id) return;

    actions.addMessage({
        ride_id: ride.id,
        sender_id: user.id,
        receiver_id: ride.requester_user_id,
        message_text: chatInputs[ride.id],
        is_system: false,
    });
    
    setChatInputs(prev => ({...prev, [rideId]: ''}));
    setSuggestedReplies(prev => ({...prev, [rideId]: ''}));
  };
  
    const generateSuggestion = async (rideId: string, text: string) => {
    setIsGenerating(prev => ({ ...prev, [rideId]: true }));
    setSuggestedReplies(prev => ({...prev, [rideId]: ''}));
    
    // Find previous messages to add context
    const rideMessages = messages.filter(m => m.ride_id === rideId);
    const lastMessage = rideMessages.length > 0 ? rideMessages[rideMessages.length - 1].message_text : '';
    const context = `Previous message from passenger: "${lastMessage}". My draft reply: "${text}"`
    
    const suggestion = await generateDriverReply(context);
    
    setSuggestedReplies(prev => ({ ...prev, [rideId]: suggestion }));
    setIsGenerating(prev => ({ ...prev, [rideId]: false }));
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Driver Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}!</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${availability?.is_available_now ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{availability?.is_available_now ? 'Available' : 'Unavailable'}</span>
                <Button onClick={toggleAvailability} size="sm" variant="ghost">{availability?.is_available_now ? 'Go Offline' : 'Go Online'}</Button>
            </div>
            <Button onClick={() => { logout(); navigate('landing'); }} variant="danger">Sign Out</Button>
        </div>
      </header>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => { setCurrentTab('requests'); setNewRequestIndicator(false); }} className={`${currentTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm pr-4`}>
            Ride Requests ({rideRequests.length})
            {newRequestIndicator && (
              <span className="absolute top-3 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
            </button>
          <button onClick={() => setCurrentTab('trips')} className={`${currentTab === 'trips' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Trips ({myTrips.length})</button>
          <button onClick={() => setCurrentTab('activity')} className={`${currentTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Activity Feed</button>
        </nav>
      </div>

      <div>
        {currentTab === 'requests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rideRequests.length > 0 ? rideRequests.map(ride => (
                    <Card key={ride.id}>
                        <CardHeader>
                            <CardTitle>Ride #{ride.id.substring(5, 10)}</CardTitle>
                            <CardDescription>{new Date(ride.ride_date_time).toLocaleString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p><strong>From:</strong> {ride.pickup_details}</p>
                            <p><strong>To:</strong> {ride.dropoff_details}</p>
                            <p><strong>Passengers:</strong> {ride.num_passengers}</p>
                            <Button onClick={() => acceptRide(ride.id)} className="w-full mt-4" variant="secondary">Accept Ride</Button>
                        </CardContent>
                    </Card>
                )) : <p>No new ride requests.</p>}
            </div>
        )}

        {currentTab === 'trips' && (
             <div className="space-y-4">
                {myTrips.length > 0 ? myTrips.map(ride => {
                     const rideMessages = messages.filter(m => m.ride_id === ride.id).sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                     return (
                    <Card key={ride.id}>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <p className="font-bold text-lg">Ride to {ride.dropoff_details}</p>
                                    <p><strong>Status:</strong> {ride.status}</p>
                                    <p><strong>Passenger:</strong> {ride.requester_user_id ? users.find(u => u.id === ride.requester_user_id)?.name : ride.guest_name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <span className={`w-2.5 h-2.5 rounded-full ${ride.is_sharing_location ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                      Location Sharing: {ride.is_sharing_location ? 'ON' : 'OFF'}
                                  </div>
                                  <Button onClick={() => updateTripStatus(ride.id, ride.status)}>{getNextActionText(ride.status)}</Button>
                                </div>
                            </div>
                             {ride.requester_user_id && (
                                <div className="mt-4 border-t border-gray-200 pt-4">
                                    <h4 className="font-semibold text-gray-800">Chat with Passenger</h4>
                                    <div className="space-y-2 my-2 h-48 overflow-y-auto border rounded-md p-2 bg-gray-50">
                                      {rideMessages.map(msg => (
                                          <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                              <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${msg.sender_id === user?.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                  <p className="text-sm">{msg.message_text}</p>
                                                  <p className={`text-xs mt-1 text-right ${msg.sender_id === user?.id ? 'text-indigo-200' : 'text-gray-500'}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                              </div>
                                          </div>
                                      ))}
                                    </div>
                                    {suggestedReplies[ride.id] && !isGenerating[ride.id] && (
                                        <div className="my-2">
                                            <button onClick={() => applySuggestion(ride.id)} className="text-sm text-left p-2 bg-indigo-50 border border-indigo-200 rounded-md w-full hover:bg-indigo-100">
                                                <strong>Suggestion:</strong> {suggestedReplies[ride.id]}
                                            </button>
                                        </div>
                                    )}
                                    {isGenerating[ride.id] && <p className="text-sm text-gray-500 my-2">Generating suggestion...</p>}
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            value={chatInputs[ride.id] || ''}
                                            onChange={(e) => handleChatInputChange(ride.id, e.target.value)}
                                            placeholder="Message passenger..."
                                            onKeyDown={e => e.key === 'Enter' && handleSendMessage(ride.id)}
                                        />
                                        <Button onClick={() => handleSendMessage(ride.id)}>Send</Button>
                                    </div>
                                </div>
                             )}
                        </CardContent>
                    </Card>
                     )
                    }) : <p>No active trips.</p>}
            </div>
        )}
        
        {currentTab === 'activity' && (
            <Card>
                <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {recentActivity.map(log => (
                           <li key={log.id} className="text-sm text-gray-600">
                              <span className="font-semibold text-primary">{log.event_type.replace(/_/g, ' ')}:</span> {log.event_description}
                              <span className="text-xs text-gray-400 block">{new Date(log.created_at).toLocaleString()}</span>
                           </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
