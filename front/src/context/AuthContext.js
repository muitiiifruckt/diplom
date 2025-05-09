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

  const requestPasswordReset = async (email) => {
    const response = await authService.requestPasswordReset(email);
    return response.message;
  };

  const resetPassword = async (token, newPassword) => {
    const response = await authService.resetPassword(token, newPassword);
    return response.message;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, requestPasswordReset, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
