import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, Ride, RideActivityLog, Message, DriverAvailability, DriverLocation, UserRole, RideStatus, EventType, PaymentType, Stop } from '../types';

// This is a simple hash function for demonstration. 
// In a real app, use a secure library like bcrypt on the backend.
const simpleHash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h.toString();
};

const initialData = () => {
    const adminId = "user-admin-01";
    return {
        users: [
            { id: adminId, name: 'Brady Admin', email: 'brady.at.tornadotaxi@gmail.com', phone: '555-0100', role: UserRole.ADMIN, password_hash: simpleHash('Taylorville2025!'), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), active: true },
            { id: 'user-driver-01', name: 'John Driver', email: 'john.d@example.com', phone: '555-0101', role: UserRole.DRIVER, password_hash: simpleHash('password123'), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), active: true },
            { id: 'user-pass-01', name: 'Jane Passenger', email: 'jane.p@example.com', phone: '555-0102', role: UserRole.PASSENGER, password_hash: simpleHash('password123'), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), active: true },
        ],
        rides: [],
        rideActivityLogs: [],
        messages: [],
        driverAvailabilities: [
            { id: 'da-01', driver_id: 'user-driver-01', available_from: null, available_to: null, is_available_now: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ],
        driverLocations: []
    }
};

// --- CSV and Email Simulation ---
const objectToCsvRow = (obj: any, headers: string[]): string => {
    return headers.map(header => {
        let val = obj[header];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        const strVal = String(val);
        if (strVal.includes('"') || strVal.includes(',')) {
            return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
    }).join(',');
};

const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    const rows = data.map(obj => objectToCsvRow(obj, headers));
    return [headerRow, ...rows].join('\n');
};

const sendEmailWithAttachment = (subject: string, body: string, csvData: string, filename: string) => {
    console.log(`--- SIMULATING EMAIL EXPORT (via Resend) ---`);
    console.log(`  - To: tornadoGOtaxi@outlook.com`);
    console.log(`  - Subject: ${subject}`);
    console.log(`  - Body: ${body}`);
    console.log(`  - Attachment: ${filename}`);
    console.log(`--- ATTACHMENT CONTENT ---`);
    console.log(csvData);
    console.log(`--- END SIMULATION ---`);
}

const exportAndEmailUpdate = (tableName: string, action: 'CREATE' | 'UPDATE', data: any) => {
    const dataArray = Array.isArray(data) ? data : [data];
    if (dataArray.length === 0) return;

    const timestamp = new Date().toISOString();
    const subject = `Data ${action}: ${tableName} - ${timestamp}`;
    const body = `A record in the ${tableName} table was ${action === 'CREATE' ? 'created' : 'updated'}. See attached CSV for details.`;
    const filename = `${tableName}_${action}_${timestamp.replace(/:/g, '-')}.csv`;
    
    try {
        const csv = convertToCSV(dataArray);
        if(csv) sendEmailWithAttachment(subject, body, csv, filename);
    } catch (error) {
        console.error("Failed to generate CSV or send email simulation:", error);
    }
};
// --- End Simulation ---

interface DataContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  rides: Ride[];
  setRides: React.Dispatch<React.SetStateAction<Ride[]>>;
  rideActivityLogs: RideActivityLog[];
  setRideActivityLogs: React.Dispatch<React.SetStateAction<RideActivityLog[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  driverAvailabilities: DriverAvailability[];
  setDriverAvailabilities: React.Dispatch<React.SetStateAction<DriverAvailability[]>>;
  driverLocations: DriverLocation[];
  setDriverLocations: React.Dispatch<React.SetStateAction<DriverLocation[]>>;
  actions: {
    addRide: (rideData: Omit<Ride, 'id' | 'public_token' | 'created_at' | 'updated_at' | 'status' | 'is_sharing_location'>) => Ride;
    updateRideStatus: (rideId: string, status: RideStatus, actorId?: string | null) => void;
    assignDriverToRide: (rideId: string, driverId: string, actorId?: string | null) => void;
    addUser: (userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'active'>) => User;
    updateUser: (userId: string, updates: Partial<Omit<User, 'id'>>) => void;
    cancelRide: (rideId: string, reason: string, actorId: string | null) => void;
    addMessage: (messageData: Omit<Message, 'id' | 'created_at'>) => Message;
    toggleRideLocationSharing: (rideId: string, isSharing: boolean) => void;
    updateDriverLocation: (driverId: string, lat: number, lng: number) => void;
    updateDriverAvailability: (driverId: string, isAvailable: boolean) => void;
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children?: ReactNode }) => {
    const [users, setUsers] = useLocalStorage<User[]>('tt_users', initialData().users);
    const [rides, setRides] = useLocalStorage<Ride[]>('tt_rides', initialData().rides);
    const [rideActivityLogs, setRideActivityLogs] = useLocalStorage<RideActivityLog[]>('tt_activity', initialData().rideActivityLogs);
    const [messages, setMessages] = useLocalStorage<Message[]>('tt_messages', initialData().messages);
    const [driverAvailabilities, setDriverAvailabilities] = useLocalStorage<DriverAvailability[]>('tt_availabilities', initialData().driverAvailabilities);
    const [driverLocations, setDriverLocations] = useLocalStorage<DriverLocation[]>('tt_locations', initialData().driverLocations);
    
    const actions = {
        addUser: (userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'active'>): User => {
            const newUser: User = {
                ...userData,
                id: `user-${Date.now()}`,
                password_hash: simpleHash(userData.password_hash),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                active: true,
            };
            setUsers(prev => [...prev, newUser]);
            exportAndEmailUpdate('users', 'CREATE', newUser);

            if (newUser.role === UserRole.DRIVER) {
                const newAvailability: DriverAvailability = {
                    id: `da-${Date.now()}`,
                    driver_id: newUser.id,
                    available_from: null,
                    available_to: null,
                    is_available_now: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                setDriverAvailabilities(prev => [...prev, newAvailability]);
                exportAndEmailUpdate('driverAvailabilities', 'CREATE', newAvailability);
            }

            return newUser;
        },
        addRide: (rideData: Omit<Ride, 'id' | 'public_token' | 'created_at' | 'updated_at' | 'status' | 'is_sharing_location'>): Ride => {
            const newRide: Ride = {
                ...rideData,
                id: `ride-${Date.now()}`,
                public_token: `pub-${Math.random().toString(36).substr(2, 9)}`,
                status: RideStatus.REQUESTED,
                is_sharing_location: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setRides(prev => [...prev, newRide]);
            exportAndEmailUpdate('rides', 'CREATE', newRide);

            const log: RideActivityLog = {
                id: `log-${Date.now()}`,
                ride_id: newRide.id,
                actor_user_id: newRide.requester_user_id,
                event_type: EventType.RIDE_REQUESTED,
                event_description: 'Ride was requested.',
                created_at: new Date().toISOString(),
            };
            setRideActivityLogs(prev => [...prev, log]);
            exportAndEmailUpdate('rideActivityLogs', 'CREATE', log);

            console.log(`--- SIMULATING EMAIL NOTIFICATIONS FOR RIDE ${newRide.id} (via Resend) ---`);
            const requesterEmail = newRide.guest_email || users.find(u => u.id === newRide.requester_user_id)?.email;
            const publicLink = window.location.origin + `?page=publicStatus&token=${newRide.public_token}`;
            
            console.log(`  - To: tornadoGOtaxi@outlook.com | Subject: New Ride Request #${newRide.id.substring(5,10)}`);
            console.log(`    Body: A new ride has been requested from ${newRide.pickup_details} to ${newRide.dropoff_details}.`);
            
            if (requesterEmail) {
                console.log(`  - To: ${requesterEmail} | Subject: Your TornadoGO Ride is Confirmed!`);
                console.log(`    Body: Thank you for booking with us. You can track your ride status here: ${publicLink}`);
            }
            console.log(`--- END SIMULATION ---`);

            return newRide;
        },
        updateRideStatus: (rideId: string, status: RideStatus, actorId: string | null = null) => {
            let updatedRide: Ride | null = null;
            setRides(prev => prev.map(r => {
                if (r.id === rideId) {
                    updatedRide = { ...r, status, updated_at: new Date().toISOString() };
                    return updatedRide;
                }
                return r;
            }));
            if(updatedRide) exportAndEmailUpdate('rides', 'UPDATE', updatedRide);

            const log: RideActivityLog = {
                id: `log-${Date.now()}`,
                ride_id: rideId,
                actor_user_id: actorId,
                event_type: EventType.STATUS_UPDATED,
                event_description: `Status updated to ${status}.`,
                created_at: new Date().toISOString(),
            };
            setRideActivityLogs(prev => [...prev, log]);
            exportAndEmailUpdate('rideActivityLogs', 'CREATE', log);
        },
        assignDriverToRide: (rideId: string, driverId: string, actorId: string | null = null) => {
             const ride = rides.find(r => r.id === rideId);
             if (!ride) return;

             const finalDriverId = driverId || null;
             const newStatus = ride.status === RideStatus.REQUESTED && finalDriverId ? RideStatus.ASSIGNED : ride.status;

             let updatedRide: Ride | null = null;
             setRides(prev => prev.map(r => {
                if (r.id === rideId) {
                    updatedRide = { ...r, assigned_driver_id: finalDriverId, status: newStatus, updated_at: new Date().toISOString() };
                    return updatedRide;
                }
                return r;
             }));
             if(updatedRide) exportAndEmailUpdate('rides', 'UPDATE', updatedRide);
             
             const driver = users.find(u => u.id === finalDriverId);
             const log: RideActivityLog = {
                id: `log-${Date.now()}`,
                ride_id: rideId,
                actor_user_id: actorId,
                event_type: EventType.DRIVER_ASSIGNED,
                event_description: finalDriverId ? `Driver ${driver?.name || 'Unknown'} assigned.` : 'Ride was unassigned.',
                created_at: new Date().toISOString(),
            };
            setRideActivityLogs(prev => [...prev, log]);
            exportAndEmailUpdate('rideActivityLogs', 'CREATE', log);
        },
        updateUser: (userId: string, updates: Partial<Omit<User, 'id'>>) => {
            let updatedUser: User | null = null;
            setUsers(prev => prev.map(u => {
                if (u.id === userId) {
                    updatedUser = { ...u, ...updates, updated_at: new Date().toISOString() };
                    return updatedUser;
                }
                return u;
            }));
            if(updatedUser) exportAndEmailUpdate('users', 'UPDATE', updatedUser);
        },
        cancelRide: (rideId: string, reason: string, actorId: string | null) => {
            let updatedRide: Ride | null = null;
            setRides(prev => prev.map(r => {
                if (r.id === rideId) {
                    updatedRide = { ...r, status: RideStatus.CANCELLED, updated_at: new Date().toISOString() };
                    return updatedRide;
                }
                return r;
            }));
            if (updatedRide) exportAndEmailUpdate('rides', 'UPDATE', updatedRide);

            const log: RideActivityLog = {
                id: `log-${Date.now()}`,
                ride_id: rideId,
                actor_user_id: actorId,
                event_type: EventType.RIDE_CANCELLED,
                event_description: `Ride cancelled. Reason: ${reason}`,
                created_at: new Date().toISOString(),
            };
            setRideActivityLogs(prev => [...prev, log]);
            exportAndEmailUpdate('rideActivityLogs', 'CREATE', log);
        },
        addMessage: (messageData: Omit<Message, 'id' | 'created_at'>): Message => {
            const newMessage: Message = {
                ...messageData,
                id: `msg-${Date.now()}`,
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, newMessage]);
            exportAndEmailUpdate('messages', 'CREATE', newMessage);
            return newMessage;
        },
        toggleRideLocationSharing: (rideId: string, isSharing: boolean) => {
            let updatedRide: Ride | null = null;
            setRides(prev => prev.map(r => {
                if (r.id === rideId) {
                    updatedRide = { ...r, is_sharing_location: isSharing, updated_at: new Date().toISOString() };
                    return updatedRide;
                }
                return r;
            }));
            if(updatedRide) exportAndEmailUpdate('rides', 'UPDATE', updatedRide);
        },
        updateDriverLocation: (driverId: string, lat: number, lng: number) => {
            setDriverLocations(prev => {
                const existing = prev.find(dl => dl.driver_id === driverId);
                if (existing) {
                    return prev.map(dl => {
                        if (dl.driver_id === driverId) {
                            const updated = { ...dl, last_lat: lat, last_lng: lng, last_updated_at: new Date().toISOString() };
                            exportAndEmailUpdate('driverLocations', 'UPDATE', updated);
                            return updated;
                        }
                        return dl;
                    });
                }
                const newLocation: DriverLocation = {
                    id: `dl-${Date.now()}`,
                    driver_id: driverId,
                    last_lat: lat,
                    last_lng: lng,
                    last_updated_at: new Date().toISOString(),
                };
                exportAndEmailUpdate('driverLocations', 'CREATE', newLocation);
                return [...prev, newLocation];
            });
        },
        updateDriverAvailability: (driverId: string, isAvailable: boolean) => {
            let updatedAvailability: DriverAvailability | null = null;
            setDriverAvailabilities(prev =>
                prev.map(da => {
                    if (da.driver_id === driverId) {
                        updatedAvailability = { ...da, is_available_now: isAvailable, updated_at: new Date().toISOString() };
                        return updatedAvailability;
                    }
                    return da;
                })
            );
            if (updatedAvailability) {
                exportAndEmailUpdate('driverAvailabilities', 'UPDATE', updatedAvailability);
            }
        },
    };

    return (
        <DataContext.Provider value={{ users, setUsers, rides, setRides, rideActivityLogs, setRideActivityLogs, messages, setMessages, driverAvailabilities, setDriverAvailabilities, driverLocations, setDriverLocations, actions }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};