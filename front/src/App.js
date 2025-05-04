import { useState, useRef, useEffect } from 'react';
import './App.css';
import AudioRecorder from './components/AudioRecorder';
import Message from './components/Message';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import WordGuessPage from './components/WordGuessPage';
import AnalysisModal from './components/chat_analys';
import PodcastPage from './components/PodcastPage';
import TestsPage from './components/TestsPage';

function App() {
  const [user, setUser] = useState(null);
  const [isLoginFormVisible, setLoginFormVisible] = useState(false);
  const [isRegisterFormVisible, setRegisterFormVisible] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messageIdRef = useRef(0);
  const [chats, setChats] = useState([]);
  const [activePage, setActivePage] = useState("chat"); // "chat", "words", "podcast", "tests"
  const [messages, setMessages] = useState([]);

  const fetchChats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch("http://localhost:8000/api/my-chats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Ошибка загрузки чатов:", error);
    }
  };
  const fetchMessages = async (chatId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/api/chat/${chatId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Преобразуем сообщения к формату, который ожидает Message.js
        const formatted = data.map(msg => [
          msg.user_audio_url && {
            id: `${msg.id}-user-audio`,
            type: 'audio',
            content: `http://localhost:8000${msg.user_audio_url}`,
            sender: 'user',
            timestamp: msg.timestamp,
          },
          msg.user_transcript && {
            id: `${msg.id}-user`,
            type: 'text',
            content: `Ты: ${msg.user_transcript}`,
            sender: 'user',
            timestamp: msg.timestamp,
          },
          msg.bot_audio_url && {
            id: `${msg.id}-bot-audio`,
            type: 'audio',
            content: `http://localhost:8000${msg.bot_audio_url}`,
            sender: 'bot',
            timestamp: msg.timestamp,
          },
          msg.bot_transcript && {
            id: `${msg.id}-bot`,
            type: 'text',
            content: `ИИ: ${msg.bot_transcript}`,
            sender: 'bot',
            timestamp: msg.timestamp,
          }
        ]).flat().filter(Boolean);
        setMessages(formatted);
      }
    } catch (error) {
      console.error("Ошибка загрузки сообщений:", error);
    }
  };
  useEffect(() => {
    if (user) fetchChats();
  }, [user]);
  const handleSelectChat = (id) => {
    setChatId(id);
    localStorage.setItem('chatId', id);
    fetchMessages(id);
  };
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
    localStorage.removeItem('chatId');
    setUser(null);
    setChatId(null);
    setMessages([]);
    setChats([]); // сбросить чаты
    setActivePage("chat");
  };

  const resetChat = () => {
    setMessages([]);
  };
  
  const handleNewTextMessage = (textPromise) => {
    // Логика обработки текстовых сообщений
    textPromise.then(({ user_message, model_message }) => {
      const timestamp = new Date().toLocaleTimeString();
      const userMessage = {
        id: `${messageIdRef.current}-user`,
        type: 'text',
        content: `Ты: ${user_message}`,
        sender: 'user',
        timestamp,
      };
      const modelMessage = {
        id: `${messageIdRef.current}-model`,
        type: 'text',
        content: `ИИ: ${model_message}`,
        sender: 'bot',
        timestamp,
      };
      setMessages((prev) => [...prev, userMessage, modelMessage]);
    }).catch(error => {
      console.error('Ошибка получения текста:', error);
    });
  };
  const handleNewAudio = (userAudioUrl, serverAudioUrlPromise) => {
    const baseId = messageIdRef.current;
    messageIdRef.current += 4;
    const timestamp = new Date().toLocaleTimeString();
    const uniqueKey = Date.now();

    const userMessage = {
      id: `${baseId}-${uniqueKey}-user`,
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
        id: loadingMessage.id,
        type: 'audio',
        content: `${serverAudioUrl}?t=${Date.now()}`,
        sender: 'bot',
        timestamp: responseTime,
      };

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
        localStorage.setItem('chatId', data.chat_id);
        setActivePage("chat");
        fetchChats();
        fetchMessages(data.chat_id);
      } else {
        alert("Ошибка: " + data.detail);
      }
    } catch (error) {
      console.error("Ошибка при создании чата:", error);
    }
  };

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>Simple Talk</h1>

        <div className="auth-buttons">
          {user ? (
            <>
              <span>{user.username}</span>
              <button onClick={handleLogout}>Выйти</button>
              <button onClick={() => setActivePage("words")}>Слова</button>
              <button onClick={() => setActivePage("podcast")}>🎧 Подкаст</button>
              <button onClick={handleCreateChat}>Начать чат</button>
              <button onClick={() => setActivePage("tests")}>Тесты</button>
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

      {user && activePage === "podcast" && (
        <PodcastPage onReturnToChat={() => setActivePage("chat")} />
      )}
      {user && activePage === "tests" && (
        <TestsPage onReturnToChat={() => setActivePage("chat")} />
      )}

      {user && activePage === "words" && (
        <WordGuessPage onReturnToChat={() => setActivePage("chat")} />
      )}

      {user && activePage === "chat" && (
        <div className="chat-layout">
          <div className="chat-list">
            <button onClick={handleCreateChat}>+ Новый чат</button>
            {chats.map(chat => (
              <div
                key={chat.chat_id}
                className={`chat-list-item${chatId === chat.chat_id ? ' active' : ''}`}
                onClick={() => handleSelectChat(chat.chat_id)}
              >
                Чат #{chat.chat_id} <br />
                <span style={{ fontSize: '0.8em', color: '#888' }}>{new Date(chat.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="chat-main">
            {!chatId ? (
              <div style={{ textAlign: "center", marginTop: "1rem" }}>Выберите чат или создайте новый</div>
            ) : (
              <>
                <div className="chat-messages">
                  {messages.map((message) => (
                    <Message key={message.id} message={message} />
                  ))}
                </div>
                <div className="chat-input">
                  <AudioRecorder 
                    onNewAudio={handleNewAudio} 
                    onNewTextMessage={handleNewTextMessage}
                    chatId={chatId} 
                  />
                  <AnalysisModal />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
