import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import { User } from './types';
import { getStoredUser, storeUser, clearStoredUser } from './services/databaseService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogin = async (loggedInUser: User) => {
    await storeUser(loggedInUser);
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await clearStoredUser();
    setUser(null);
  };

  if (loading) {
      return (
          <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
              <p>Loading application...</p>
          </div>
      )
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <HomePage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
