import { useState } from 'react';
import './App.css';
import AudioRecorder from './components/AudioRecorder';
import Message from './components/Message';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import WordGuessPage from './components/WordGuessPage';
import AnalysisModal from './components/chat_analys';
import {  useRef } from 'react'; // Добавляем useRef
function App() {
  const [user, setUser] = useState(null);
  const [isLoginFormVisible, setLoginFormVisible] = useState(false);
  const [isRegisterFormVisible, setRegisterFormVisible] = useState(false);
  const [isWordPageVisible, setWordPageVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);


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
    resetChat();
    localStorage.removeItem('token');
    localStorage.removeItem('chatId'); // 👈 ВАЖНО!
    setUser(null);
    setChatId(null); // если хранишь в состоянии
    setMessages([]); // 💥 очищаем историю сообщений
  };

  const resetChat = () => {
    setMessages([]); // Очистить все старые сообщения
  };
  
  const messageIdRef = useRef(0); // Добавляем реф для генерации ID

  // В компоненте App.js
const handleNewAudio = (userAudioUrl, serverAudioUrlPromise) => {
  const baseId = messageIdRef.current;
  messageIdRef.current += 4; // Увеличиваем базовый ID

  const timestamp = new Date().toLocaleTimeString();

  // Генерируем уникальный ключ для сообщения
  const uniqueKey = Date.now();

  const userMessage = {
      id: `${baseId}-${uniqueKey}-user`, // Уникальный составной ID
      type: 'audio',
      content: userAudioUrl,
      sender: 'user',
      timestamp,
  };

  const loadingMessage = {
      id: `${baseId}-${uniqueKey}-loading`,
      type: 'loading',
      content: 'Бот генерирует ответ...',
      sender: 'bot',
      timestamp,
  };

  setMessages((prev) => [...prev, userMessage, loadingMessage]);

  serverAudioUrlPromise.then(({ serverAudioUrl, userTranscript, modelTranscript }) => {
      const responseTime = new Date().toLocaleTimeString();

      const botMessageAudio = {
          id: loadingMessage.id, // Используем ID loading сообщения
          type: 'audio',
          content: `${serverAudioUrl}?t=${Date.now()}`, // Добавляем timestamp к URL
          sender: 'bot',
          timestamp: responseTime,
      };

      // Остальные сообщения
      const userTranscriptMessage = {
          id: `${baseId}-${uniqueKey}-user-transcript`,
          type: 'text',
          content: `Ты: ${userTranscript}`,
          sender: 'bot',
          timestamp: responseTime,
      };

      const modelTranscriptMessage = {
          id: `${baseId}-${uniqueKey}-model-transcript`,
          type: 'text',
          content: `ИИ: ${modelTranscript}`,
          sender: 'bot',
          timestamp: responseTime,
      };

      setMessages((prev) => [
          ...prev.filter(msg => msg.id !== loadingMessage.id),
          botMessageAudio,
          userTranscriptMessage,
          modelTranscriptMessage
      ]);
  }).catch(error => {
      console.error('Ошибка:', error);
      // Удаляем loading сообщение при ошибке
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
  });
};
  
  
  
  const handleCreateChat = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const response = await fetch("http://localhost:8000/api/create-chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setChatId(data.chat_id);
        localStorage.setItem('chatId', data.chat_id); // 👈 добавь это
        alert("Чат создан успешно!");
      } else {
        alert("Ошибка: " + data.detail);
      }
    } catch (error) {
      console.error("Ошибка при создании чата:", error);
    }
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
        {!chatId ? (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button onClick={handleCreateChat}>Начать чат</button>
          </div>
        ) : (
          <>
          
            <div className="chat-messages">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </div>

            <div className="chat-input">
            <AudioRecorder onNewAudio={handleNewAudio} chatId={chatId} />
            <AnalysisModal />

            </div>
          </>
        )}
      </>
    )}


      {/* Если выбрана страница "Слова" */}
      {user && isWordPageVisible && <WordGuessPage onReturnToChat={handleReturnToChat} />}
    </div>
  );
}
export default App;