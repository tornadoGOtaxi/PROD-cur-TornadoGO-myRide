
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PaymentType, Stop } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../components/ui/Card';
import TornadoGoLogo from '../components/TornadoGoLogo';

interface RequestRidePageProps {
  navigate: (page: 'landing' | 'publicStatus', token?: string) => void;
}

const RequestRidePage: React.FC<RequestRidePageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { actions } = useData();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [stops, setStops] = useState<Stop[]>([]);
  const [rideDateTime, setRideDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [passengers, setPassengers] = useState(1);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.CASH);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddStop = () => {
    setStops([...stops, { id: `stop-${Date.now()}`, description: '' }]);
  };

  const handleStopChange = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index].description = value;
    setStops(newStops);
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !phone || !pickup || !dropoff || !rideDateTime) {
      setError('Please fill out all required fields.');
      return;
    }

    const rideData = {
      requester_user_id: user?.id || null,
      guest_name: user ? null : name,
      guest_email: user ? null : email,
      guest_phone: user ? null : phone,
      pickup_details: pickup,
      dropoff_details: dropoff,
      additional_stops_json: JSON.stringify(stops.filter(s => s.description.trim() !== '')),
      ride_date_time: new Date(rideDateTime).toISOString(),
      num_passengers: passengers,
      payment_type: paymentType,
      assigned_driver_id: null,
    };
    
    const newRide = actions.addRide(rideData);
    setSuccess(`Ride requested successfully! Your Ride ID is ${newRide.id}.`);
    
    setTimeout(() => {
        navigate('publicStatus', newRide.public_token);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <button onClick={() => navigate('landing')} className="absolute top-4 left-4 text-primary hover:underline">
            &larr; Back to Home
        </button>
      <div className="transform scale-75 -mb-4">
        <TornadoGoLogo />
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Request a Ride</CardTitle>
          <CardDescription>Fill in the details below to book your taxi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label>Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} required disabled={!!user} />
                </div>
                <div>
                    <label>Email</label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={!!user} />
                </div>
                <div>
                    <label>Phone</label>
                    <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required disabled={!!user} />
                </div>
                 <div>
                    <label>Date and Time</label>
                    <Input type="datetime-local" value={rideDateTime} onChange={e => setRideDateTime(e.target.value)} required />
                </div>
            </div>
             <div>
                <label>Pickup Location</label>
                <Input value={pickup} onChange={e => setPickup(e.target.value)} placeholder="e.g., 123 Main St, Taylorville" required />
            </div>
            <div>
                <label>Drop-off Location</label>
                <Input value={dropoff} onChange={e => setDropoff(e.target.value)} placeholder="e.g., Springfield Airport" required />
            </div>

            <div>
                <label>Additional Stops</label>
                {stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center gap-2 mb-2">
                        <Input value={stop.description} onChange={e => handleStopChange(index, e.target.value)} placeholder={`Stop ${index + 1}`} />
                        <Button type="button" variant="danger" onClick={() => handleRemoveStop(index)}>X</Button>
                    </div>
                ))}
                <Button type="button" variant="ghost" onClick={handleAddStop}>+ Add Stop</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label>Number of Passengers</label>
                    <Input type="number" value={passengers} onChange={e => setPassengers(Math.max(1, parseInt(e.target.value, 10)))} min="1" required />
                </div>
                 <div>
                    <label>Payment Type</label>
                    <select value={paymentType} onChange={e => setPaymentType(e.target.value as PaymentType)} className="h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2">
                        {Object.values(PaymentType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                    </select>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button type="submit" className="w-full" variant="secondary">Request Ride</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestRidePage;
