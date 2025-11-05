

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../components/ui/Card';
import TornadoGoLogo from '../components/TornadoGoLogo';

interface RegisterPageProps {
  navigate: (page: 'landing' | 'signin') => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { users, actions } = useData();
  const [role, setRole] = useState<UserRole>(UserRole.PASSENGER);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (users.some(u => u.email === email)) {
      setError('An account with this email already exists.');
      return;
    }
    
    actions.addUser({ name, email, phone, password_hash: password, role });
    setSuccess('Registration successful! You can now sign in.');
    
    setTimeout(() => {
      navigate('signin');
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register for myRide</CardTitle>
          <CardDescription>Create your account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label>I am a...</label>
                <div className="flex gap-4 mt-2">
                    <Button type="button" onClick={() => setRole(UserRole.PASSENGER)} className={`w-full ${role === UserRole.PASSENGER ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}>Passenger</Button>
                    <Button type="button" onClick={() => setRole(UserRole.DRIVER)} className={`w-full ${role === UserRole.DRIVER ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}>Driver</Button>
                </div>
            </div>
            <div>
              <label>Full Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label>Email Address</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Phone Number</label>
              <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div>
              <label>Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button type="submit" className="w-full" variant="secondary">Register</Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
            <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button onClick={() => navigate('signin')} className="font-medium text-primary hover:underline">
                    Sign In
                </button>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
