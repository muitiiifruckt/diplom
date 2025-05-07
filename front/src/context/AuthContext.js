import { createContext, useContext, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      setUser({ username });
      return { success: true };
    }
    return { success: false, error: data.detail };
  };

  const register = async (username, password) => {
    const data = await authService.register(username, password);
    if (data.username) {
      return { success: true };
    }
    return { success: false, error: data.detail || 'Неизвестная ошибка' };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);