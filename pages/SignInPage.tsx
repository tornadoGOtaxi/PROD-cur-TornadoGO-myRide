

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../components/ui/Card';
import TornadoGoLogo from '../components/TornadoGoLogo';

interface SignInPageProps {
  navigate: (page: 'landing' | 'register') => void;
}

// Simple hash for demo purposes. In a real app, this logic would be on the backend.
const simpleHash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h.toString();
};

const SignInPage: React.FC<SignInPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const password_hash = simpleHash(password);
    const loggedIn = login(email, password_hash);
    if (!loggedIn) {
      setError('Invalid email or password.');
    }
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
          <CardTitle>Sign In to myRide</CardTitle>
          <CardDescription>Access your passenger, driver, or admin portal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label>Email Address</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" variant="secondary">Sign In</Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
            <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button onClick={() => navigate('register')} className="font-medium text-primary hover:underline">
                    Register
                </button>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInPage;
