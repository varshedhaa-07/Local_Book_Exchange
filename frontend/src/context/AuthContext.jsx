import { useEffect, useState } from 'react';
import api from '../api/client';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('book_exchange_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('book_exchange_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/me');
        const nextUser = {
          id: data._id,
          name: data.name,
          email: data.email,
          location: data.location,
        };
        setUser(nextUser);
        localStorage.setItem('book_exchange_user', JSON.stringify(nextUser));
      } catch {
        localStorage.removeItem('book_exchange_token');
        localStorage.removeItem('book_exchange_user');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const saveSession = (payload) => {
    localStorage.setItem('book_exchange_token', payload.token);
    localStorage.setItem('book_exchange_user', JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const login = async (values) => {
    const { data } = await api.post('/auth/login', values);
    saveSession(data);
    return data;
  };

  const register = async (values) => {
    const { data } = await api.post('/auth/register', values);
    saveSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('book_exchange_token');
    localStorage.removeItem('book_exchange_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
