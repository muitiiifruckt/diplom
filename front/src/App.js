import { useState } from 'react';
import './App.css';
import LoginForm from './components/LoginForm'; // Импортируем компонент формы логина
import RegisterForm from './components/RegisterForm'; // Импортируем компонент формы регистрации

function App() {
  const [user, setUser] = useState(null); // Хранит текущего пользователя
  const [isLoginFormVisible, setLoginFormVisible] = useState(false);
  const [isRegisterFormVisible, setRegisterFormVisible] = useState(false);

  const handleLogin = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        setUser({ username });
        setLoginFormVisible(false);
      } else {
        alert('Ошибка: ' + data.detail);
      }
    } catch (error) {
      console.error('Ошибка при отправке данных', error);
    }
  };

    const handleRegister = async (username, password) => {
      try {
          const response = await fetch('http://localhost:8000/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  username: username,
                  password: password
              }),
          });

          const data = await response.json();

          if (response.ok) {
              alert('Регистрация прошла успешно. Теперь вы можете войти!');
              setRegisterFormVisible(false);
          } else {
              alert('Ошибка: ' + (data.detail || 'Неизвестная ошибка'));
          }
      } catch (error) {
          console.error('Ошибка при отправке данных', error);
      }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>Голосовой чат</h1>

        <div className="auth-buttons">
          {user ? (
            <>
              <span>Привет, {user.username}!</span>
              <button onClick={handleLogout}>Выйти</button>
            </>
          ) : (
            <>
              <button onClick={() => setLoginFormVisible(true)}>Войти</button>
              <button onClick={() => setRegisterFormVisible(true)}>Регистрация</button>
            </>
          )}
        </div>
      </div>

      {isLoginFormVisible && <LoginForm onSubmit={handleLogin} />}
      {isRegisterFormVisible && <RegisterForm onSubmit={handleRegister} />}

      {/* Остальная часть приложения */}
    </div>
  );
}

export default App;
