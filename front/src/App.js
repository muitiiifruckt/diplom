import { useState } from 'react';
import './App.css';
import AudioRecorder from './components/AudioRecorder';
import Message from './components/Message';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import WordGuessPage from './components/WordGuessPage';


function App() {
  const [user, setUser] = useState(null);
  const [isLoginFormVisible, setLoginFormVisible] = useState(false);
  const [isRegisterFormVisible, setRegisterFormVisible] = useState(false);
  const [isWordPageVisible, setWordPageVisible] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleLogin = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
      console.error('Ошибка при логине:', error);
    }
  };

  const handleRegister = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Регистрация прошла успешно. Теперь вы можете войти!');
        setRegisterFormVisible(false);
      } else {
        alert('Ошибка: ' + (data.detail || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const handleNewAudio = (userAudioUrl, serverAudioUrlPromise) => {
    const timestamp = new Date().toLocaleTimeString();
    const userMessage = {
      id: Date.now(),
      type: 'audio',
      content: userAudioUrl,
      sender: 'user',
      timestamp: timestamp,
    };

    const loadingMessage = {
      id: Date.now() + 1,
      type: 'loading',
      content: 'Бот генерирует ответ...',
      sender: 'bot',
      timestamp: timestamp,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    serverAudioUrlPromise.then((serverAudioUrl) => {
      const botMessage = {
        id: Date.now() + 2,
        type: 'audio',
        content: serverAudioUrl,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.type === 'loading' ? botMessage : msg))
      );
    });
  };
// Функция для возвращения в чат
const handleReturnToChat = () => {
  setWordPageVisible(false);
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
              <button onClick={() => setWordPageVisible(!isWordPageVisible)}>Слова</button>
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

      {/* Если пользователь вошёл и не выбрал "Слова" — показать чат */}
      {user && !isWordPageVisible && (
        <>
          <div className="chat-messages">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </div>

          <div className="chat-input">
            <AudioRecorder onNewAudio={handleNewAudio} />
          </div>
        </>
      )}

      {/* Если выбрана страница "Слова" */}
      {user && isWordPageVisible && <WordGuessPage onReturnToChat={handleReturnToChat} />}
    </div>
  );
}
export default App;