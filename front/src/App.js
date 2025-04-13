import { useState } from 'react';
import './App.css';
import AudioRecorder from './components/AudioRecorder';
import Message from './components/Message';

function App() {
  const [messages, setMessages] = useState([]);

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
  
    // Показываем оба сразу
    setMessages((prev) => [...prev, userMessage, loadingMessage]);
  
    // Ждём ответ от сервера
    serverAudioUrlPromise.then((serverAudioUrl) => {
      const botMessage = {
        id: Date.now() + 2,
        type: 'audio',
        content: serverAudioUrl,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
  
      setMessages((prev) =>
        prev.map((msg) =>
          msg.type === 'loading' ? botMessage : msg
        )
      );
    });
  };
  

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>Голосовой чат</h1>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>

      <div className="chat-input">
        <AudioRecorder onNewAudio={handleNewAudio} />
      </div>
    </div>
  );
}

export default App;

