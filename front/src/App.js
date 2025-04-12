import { useState } from 'react';
import './App.css';
import AudioRecorder from './components/AudioRecorder';
import Message from './components/Message';

function App() {
  const [messages, setMessages] = useState([]);

  const handleNewAudio = (audioUrl) => {
    setMessages([...messages, {
      id: Date.now(),
      type: 'audio',
      content: audioUrl,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    }]);
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