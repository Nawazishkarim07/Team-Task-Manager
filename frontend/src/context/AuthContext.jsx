import { useState } from 'react';
import API from '../api/axiosSetup';
import { AuthContext } from './AuthContextValue';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const persistUser = (data) => {
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    persistUser(data);
  };

  const signup = async (payload) => {
    const { data } = await API.post('/auth/register', payload);
    persistUser(data);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
